const multer = require('multer')
const User = require('./../model/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Factory = require('./factoryController')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({ 
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     console.log(file, 'oneeeee')
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(key => {
    if(allowedFields.includes(key)) newObj[key] = obj[key]
  });
  return newObj;
}

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = (req, res, next) => {
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)
    
  next()
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
  if(req.file) filteredBody.photo = req.file.filename
  
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
