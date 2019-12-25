const express = require('express')
const router = express.Router()
const {getAllTours, postTour, getTour, deleteTour, patchTour, tourStats, yearStats} = require('../controllers/tourControllers')

// router.param('id', checkID)
router
    .route('/tour-stats')
    .get(tourStats)

router
    .route('/stats/:year')
    .get(yearStats)

router
    .route('/')
    .get(getAllTours)
    .post(postTour)

router
    .route('/:id')
    .get(getTour)
    .delete(deleteTour)
    .patch(patchTour)

module.exports = router