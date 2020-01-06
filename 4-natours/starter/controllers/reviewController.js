const Review = require('./../model/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('./../utils/appError')

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const reviews = await features.query;

    if(!reviews) {
        return next(new AppError('No review found', 404))
    } 
    res
    .status(200)
    .json({
        message: 'Success', 
        length: reviews.length, 
        data: {
            reviews
        }
    })
})

exports.getReview = catchAsync(async (req, res, next) => {
    const selectedReview = await Review.findById(req.params.id)

    if(!selectedReview) {
        return next(new AppError('No review found with that ID', 404))
    } 

    res
    .status(200)
    .json({
        message: 'Success',
        data: {
            selectedReview
        }
    })
})

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

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id)

    if(!review) {
        return next(new AppError('No review found', 404))
    } 
    
    res
    .status(204)
    .json({
        message: 'Data deleted sucessfully',
    })
})

exports.patchReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!review) {
        return next(new AppError('No review found', 404))
    } 

    res
    .status(200)
    .json({
        message: 'Data patch sucessfully!',
        data: {
            review
        }
    })
})