const User = require('./../model/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        newUser
      }
    });
})

exports.getAllUsers = (req, res) => {
  try{
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  }
  catch {
    res.status(404).json({
      status: 'error',
      message: 'Some error occured'
    })
  }
  
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
