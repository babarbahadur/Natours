const express = require('express')
const router = express.Router()
const {getAllReviews, getReview, createReview, deleteReview, patchReview } = require('../controllers/reviewController')
const {protect, restrictTo} = require('../controllers/authController')

router
    .route('/')
    .get(protect, restrictTo('admin'), getAllReviews)
    // .post(protect, restrictTo('user'), createReview)

router
    .route('/:id')
    .get(getReview)
    .delete(protect, restrictTo('admin'), deleteReview)
    .patch(protect, patchReview)

module.exports = router