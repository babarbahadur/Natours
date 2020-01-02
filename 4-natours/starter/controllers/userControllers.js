const User = require('./../model/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


exports.getAllUsers = catchAsync( async(req, res) => {
  const features = new APIFeatures(User.find(), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();
  const users = await features.query;

  if(!users) {
      return next(new AppError('No user found', 404))
  } 
  res
  .status(200)
  .json({
      message: 'Success', 
      length: users.length, 
      data: {
          users
      }
  })
})

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