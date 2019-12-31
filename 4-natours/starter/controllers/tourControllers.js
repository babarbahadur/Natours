const Tour = require('./../model/tourModel')
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
        const tours = await features.query;

        res
        .status(200)
        .json({
            message: 'Success', 
            length: tours.length, 
            data: {
                tours: tours
            }
        })
    }
    catch (err) {
        console.log(err)
    }   
}

exports.getTour = async (req, res) => {
    try {
        const selectedtour = await Tour.findById(req.params.id)
        res
        .status(200)
        .json({
            message: 'Success',
            data: {
                selectedtour
            }
        })
    }
    catch (err) {
        console.log(err)
    }  
}

exports.postTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: newTour
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({status: 'Error', message: err})
    }
}

exports.deleteTour =  async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id)
        res
        .status(200)
        .json({
            message: 'Data deleted sucessfully',
    })
    }
    catch (err) {
        console.log(err)
    }
}

exports.patchTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res
        .status(200)
        .json({
            message: 'Data patch sucessfully!',
            data: {
                tour
            }
        })

    }
    catch (err) {
        console.log(err)
    }
    
}

exports.tourStats = async (req, res) => {
    try {
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

    }
    catch (err) {
        console.log(err)
    }
}

exports.yearStats = async (req, res) => {
    try {
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
    }
    catch (err) {
        res
        .status(400)
        .json({
            status: 'Fail',
            message: err,
        })
    }
}

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
