const express = require('express')
const router = express.Router()
const {getCheckoutSession} = require('../controllers/checkoutController')
const {protect} = require('../controllers/authController')

router.get('/checkout-session/:tourId', protect, getCheckoutSession)

module.exports = router