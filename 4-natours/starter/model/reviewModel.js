const mongoose = require('mongoose')
const slugify = require('slugify')

const reviewSchema = new mongoose.Schema({
    review: { 
        type: String,
        required: [true, 'A review can not be empty'],
        trim: true,
        maxlength: [140, 'A review name must have less or equal then 40 characters'],
        minlength: [4, 'A review name must have more or equal then 10 characters']
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: [true, 'Rating is required']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour', 
        required: [true, 'Review must belong to a tour.'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.'],
    }
},
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
})

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    // .populate({
    //     path:'tour',
    //     select: 'name'
    // })
    next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review 