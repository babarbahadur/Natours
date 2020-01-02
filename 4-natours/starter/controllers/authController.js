const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken')
const {promisify} = require('util');

const generateToken = async (id) => {
    return await jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: Date.now(),
        role: req.body.role
    });

    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN,
    // })
    const token = await generateToken(newUser._id)

    res.status(201).json({
      status: 'success',
      token,
      data: {
        newUser
      }
    });
})

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body

    if(!email || !password) {
        return next(new AppError('Email or password not provided', 400));
    }
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Wrong email or password', 401))
    }

    const token = await generateToken(user._id)

    res.status(201).json({
        status: 'success',
        token: token
    })

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
  