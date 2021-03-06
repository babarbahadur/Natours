const mongoose = require('mongoose')
const slugify = require('slugify')

//We are importing user for embedding guides
// const User = require('./userModel')

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
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: value => Math.round(value * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    slug: String,
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        { 
            type: { 
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, 
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
}
)

//This is indexing
tourSchema.index({ price: 1, ratingsAverage: -1})
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })


tourSchema.virtual('durationsWeek').get(function (){
    return this.duration / 7
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true})
    // console.log(this, 'This is document');
    next();
})

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

//This is to embedd guides in Tours 
// tourSchema.pre('save', async function(next){
//     const guidesPromise = this.guides.map( async id => await User.findById(id))
//     this.guides = await Promise.all( guidesPromise)
//     next();
// })

tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } })
    this.startTime = Date.now();
    next()
})

tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { 
        secretTour: {$ne: true}
    }})
    next()
})

tourSchema.post(/^find/, function(next) {
    console.log(`The process took  ${Date.now() - this.startTime} miliseconds`)
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour 