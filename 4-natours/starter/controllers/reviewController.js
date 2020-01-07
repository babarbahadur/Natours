const Review = require('./../model/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('./../utils/appError')
const Factory = require('./factoryController')

exports.getAllReviews = Factory.getAll(Review)
exports.getReview = Factory.getOne(Review)

exports.createReview = catchAsync(async (req, res, next) => {
    console.log(req.params.tourId, 'This is params')
    const newReview = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        createdAt: Date.now(),
        tour: req.body.tourId || req.params.tourId,
        user: req.user._id || req.body.user,
      })
    res.status(201).json({
        status: 'success',
        data: newReview
    })
})

exports.deleteReview = Factory.deleteOne(Review)
exports.patchReview = Factory.patchOne(Review)