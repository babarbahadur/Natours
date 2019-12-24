const Tour = require('./../model/tourModel')

exports.getAllTours = async (req, res) => {
    try {
        //REMOVING SORT, PAGING ETC
        const querryObj = {...req.query}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(element => {
            delete querryObj[element]
        });

        //FILTERING
        let filterQuerry = JSON.stringify(querryObj)
        filterQuerry = filterQuerry.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`)
        console.log(filterQuerry, 'This is fucking filter querry')
        

        let tours = await Tour.find(JSON.parse(filterQuerry))

        //SORTING
        // if(req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     tours = tours.sort(sortBy)
        // }
        //  else {
            // tours = tours.sort('price')
        // }

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

exports. patchTour = async (req, res) => {
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
