const express = require('express')
const router = express.Router()
const {getAllTours, postTour, getTour, deleteTour, patchTour, tourStats, yearStats} = require('../controllers/tourControllers')
const {getReview, createReview, deleteReview, patchReview } = require('../controllers/reviewController')
const {protect, restrictTo} = require('../controllers/authController')

// router.param('id', checkID)
router
    .route('/tour-stats')
    .get(tourStats)

router
    .route('/stats/:year')
    .get(yearStats)

router
    .route('/')
    .get(protect, getAllTours)
    .post(postTour)

router
    .route('/:id')
    .get(getTour)
    .delete(protect, restrictTo('admin', 'tour-lead'), deleteTour)
    .patch(patchTour)

//Reviews
router
    .route('/:tourId/reviews')
    .post(protect, restrictTo('admin'), createReview)

module.exports = router