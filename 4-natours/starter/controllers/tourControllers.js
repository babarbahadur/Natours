const Tour = require('./../model/tourModel')
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('./../utils/appError')
const Factory = require('./factoryController')

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