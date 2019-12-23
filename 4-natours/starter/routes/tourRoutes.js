const express = require('express')
const router = express.Router()
const {getAllTours, postTour, getTour, deleteTour, patchTour, checkBody} = require('../controllers/tourControllers')

// router.param('id', checkID)
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