const Tour = require('./../model/tourModel')
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('./../utils/appError')
const Factory = require('./factoryController')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    console.log(file)
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

//This is for Array for multiple images
exports.uploadPhotos = upload.fields(
    [{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 3 }])


// upload.single('imageCover')  This is for single image
// upload.array('imageCover', 3) This is for array

exports.resizePhotos = catchAsync(async (req, res, next) => {

    console.log(req.files)
    if(!req.files.imageCover || !req.files.images) return next();
    
    // 1) Cover Image 
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)

    // 2) images
    req.body.images = [];
    await Promise.all( 
        req.files.images.map(async (image, index) => {
            const imageName = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
            
            await sharp(image.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${imageName}`)

            req.body.images.push(imageName)
    }))

  next()
})

exports.getAllTours = Factory.getAll(Tour)

exports.getTour = Factory.getOne(Tour, { path: 'reviews'})

exports.postTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: 'success',
        data: newTour
    })
})

exports.deleteTour = Factory.deleteOne(Tour)
exports.patchTour = Factory.patchOne(Tour)

exports.tourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {duration: {$gte: 4 }}
        },
        {
            $group: {
                _id:{ $toUpper: '$difficulty' },
                tourNumber: {$sum: 1},
                avgGroupSize: {$avg: '$maxGroupSize'},
                minRatingsQuantity: {$min: '$ratingsQuantity'},
                maxDuration: {$max: '$duration'},
            }
        }, {
            $sort: { tourNumber: 1}
        },
        // {
        //     $match: {_id: {$ne: 'EASY'}}
        // }
    ]);

    res
    .status(200)
    .json({
        message: 'Success', 
        data: {
            stats
        }
    })

})

exports.yearStats = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const stats = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {startDates: { 
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)  
            }}
        },
        {
            $group: { 
                _id:{ $month: '$startDates'},
                totalNumber: {$sum: 1},
                name: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {totalNumber: -1} 
        },
    ])
    res
    .status(200)
    .json({
        message: 'Success', 
        data: {
            stats
        }
    })
})

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlan, unit } = req.params
    const [latitude, longitude] = latlan.split(',');
    
    //calculating the radius in radians
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if(!latitude || !longitude) {
        next(
            new AppError('Please provide latitude and longitude in the format lat, lan', 400
            )
        )
    }
    const tours = await Tour.find({ 
        startLocation: {$geoWithin: { $centerSphere: [[longitude, latitude], radius]}}
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})