const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const {promisify} = require('util');

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {

  const token = generateToken(user._id)

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  }); 
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      // passwordChangedAt: Date.now(),
      // role: req.body.role,
      // picture: "Coding.jpg"
    });

    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome()

    createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body

    if(!email || !password) {
        return next(new AppError('Email or password not provided', 400));
    }
    const user = await User.findOne({email}).select('+password +picture')

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Wrong email or password', 401))
    }

    createSendToken(user, 201, res)
})

exports.protect = catchAsync(async (req, res, next) => {
    //Check if authorization is provided!
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('Header not provided', 400, 'header'))
      }
    //1) Check if there is a token
    let token
  
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt
    }
  
    if(!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401))
    }
  
    //2) Verify the token is valid
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    //3) Check if user still exists
    const freshUser = await User.findById(decoded.id)
    if(!freshUser) {
        return next(new AppError('The user does not exist', 401))
    }
  
    //4) Check if user changed password after the token was issue
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Password was recently changed. Please login again!', 401));
    }

    //Grant Access
    req.user = freshUser
  
    next()
  
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new AppError('You are not authorized', 403))
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;


  try {
    await new Email(user, resetURL).sendPasswordReset()
  //   await sendEmail({
  //     email: user.email,
  //     subject: 'Your password reset token (valid for 10 min)',
  //     message
  //   });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {

  const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  // 1) Find the user according to the token and verify if it is valid
  const user = await User.findOne({ passwordResetToken: resetToken, passwordResetExpires: {$gt: Date.now()} });

  // 2) If token has not expired, and there is user, set the new password
  if(!user) {
    return next(new AppError('Token invalid or expired!', 400))
  }

  user.password = req.body.password,
  user.confirmPassword = req.body.confirmPassword,
  user.passwordResetToken = undefined,
  user.passwordResetExpires = undefined,

  await user.save()
  // 3) Update changePasswordAt property of the user

  // 4) Log in the user in, send JWT
  createSendToken(user, 201, res)

  // const token = await generateToken(user._id)

  // res.status(201).json({
  //   status: 'success',
  //   token,
  // });

})

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Find user
  const user = await await User.findById(req.user.id).select('+password')
  // Check if previous password is provided and correct

  if(await (!user.correctPassword(req.body.password ,user.password))) {
    return next(new AppError('Provided password does not match', 401))
  }

  //set new password

  user.password= req.body.newPassword,
  user.confirmPassword= req.body.confirmNewPassword

  await user.save()

  createSendToken(user, 201, res)
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
