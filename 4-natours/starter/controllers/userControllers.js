const User = require('./../model/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Factory = require('./factoryController')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(key => {
    if(allowedFields.includes(key)) newObj[key] = obj[key]
  });
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {

  if(req.body.password || req.body.confirmPassword) {
    next( new AppError('You cannot update your password. Please use /updatePassword'), 400);
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { 
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser
    }
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {isActive: false})
  res.status(204).json({
    status: 'Success!'
  })
  
})

exports.getAllUsers = Factory.getAll(User)

exports.deleteUser = Factory.deleteOne(User)

exports.getUser = Factory.getOne(User)

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
