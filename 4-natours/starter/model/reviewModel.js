const mongoose = require('mongoose')
const slugify = require('slugify')
const Tour = require('./tourModel');

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

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    // console.log(stats)

    // await Tour.findByIdAndUpdate( tourId, { 
    //     ratingsQuantity: stats[0].nRating,
    //     ratingsAverage: stats[0].avgRating
    // })

    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
  };
  
reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });
  
  reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
  });

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review 