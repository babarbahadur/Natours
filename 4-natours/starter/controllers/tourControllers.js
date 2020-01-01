const Tour = require('./../model/tourModel')
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('./../utils/appError')

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tours = await features.query;

    if(!tours) {
        return next(new AppError('No tour found', 404))
    } 
    res
    .status(200)
    .json({
        message: 'Success', 
        length: tours.length, 
        data: {
            tours: tours
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const selectedtour = await Tour.findById(req.params.id)

    if(!selectedtour) {
        return next(new AppError('No tour found with that ID', 404))
    } 

    res
    .status(200)
    .json({
        message: 'Success',
        data: {
            selectedtour
        }
    })
})

exports.postTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: 'success',
        data: newTour
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if(!tour) {
        return next(new AppError('No tour found', 404))
    } 
    
    res
    .status(200)
    .json({
        message: 'Data deleted sucessfully',
    })
})

exports.patchTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!tour) {
        return next(new AppError('No tour found', 404))
    } 

    res
    .status(200)
    .json({
        message: 'Data patch sucessfully!',
        data: {
            tour
        }
    })
})

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

// exports.deleteTour =  async (req, res) => {
//     const id = req.params.id * 1

//     const tour = tours.find( el => {
//         if(id === el.id) return el
//     })
    
//     if(!tour) return res.status(404).json({status: 404, message: 'Tour not found'})

//     const finalTour =[];
//     const newTour = tours.map(el => {
//         if(el.id != tour.id) {
//             return finalTour.push(el)
//         }
//     })

//     fs.writeFile(__dirname + '/../dev-data/data/tours-simple.json', JSON.stringify(finalTour), (err, data) => {
//         if(err) console.log('There is an error writing into the file')
//         console.log('Data writing successfully!')
//     })

//     res
//     .status(200)
//     .json({
//         message: 'Data deleted sucessfully',
//         data: {
//             finalTour
//         }
//     })
// }
