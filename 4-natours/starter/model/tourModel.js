const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    rating :{
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
    }
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour 