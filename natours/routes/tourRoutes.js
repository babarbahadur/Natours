const express = require('express')
const router = express.Router()
const {getAllTours, postTour, getTour, deleteTour, uploadPhotos, resizePhotos, patchTour, tourStats, yearStats, getToursWithin} = require('../controllers/tourControllers')
const {getReview, createReview, deleteReview, patchReview } = require('../controllers/reviewController')
const reviewRoute = require('../routes/reviewRoutes')
const {protect, restrictTo} = require('../controllers/authController')

//This is nested route and this will route the request to reviwRoute
router.use('/:tourId/reviews', reviewRoute)

// router.param('id', checkID)
router
    .route('/tour-stats')
    .get(protect, restrictTo('admin'), tourStats)

router
    .route('/stats/:year')
    .get(protect, restrictTo('admin'), yearStats)

router
    .route('/')
    .get(getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide'), postTour)

router
    .route('/:id')
    .get(getTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
    .patch(uploadPhotos, resizePhotos, patchTour)

router
    .route('/tours-within/:distance/center/:latlan/unit/:unit')
    .get(getToursWithin)

//Reviews
// router
//     .route('/:tourId/reviews')
//     .post(protect, restrictTo('admin'), createReview)

module.exports = router