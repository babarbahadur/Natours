const express = require('express')
const router = express.Router()
const {updateMe, deleteMe, getAllUsers, getUser, deleteUser, patchUser} = require('../controllers/userControllers')
const {signup, login, resetPassword, forgotPassword, protect, updatePassword} = require('../controllers/authController')

router
    .route('/signup')
    .post(signup)

router
    .route('/login')
    .get(login)

router
    .route('/forgotPassword')
    .post(forgotPassword)

router
    .route('/resetPassword/:token')
    .patch(resetPassword)

router
    .route('/changePassword')
    .patch(protect, updatePassword)

router
    .route('/updateMe')
    .patch(protect, updateMe)

 router
    .route('/deleteMe')
    .delete(protect, deleteMe)

router
    .route('/')
    .get(getAllUsers)

router
    .route('/:id')
    .get(getUser)
    .delete(deleteUser)
    // .patch(patchUser)

module.exports = router