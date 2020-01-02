const express = require('express')
const router = express.Router()
const {getAllUsers, getUser, deleteUser, patchUser} = require('../controllers/userControllers')
const {signup, login} = require('../controllers/authController')

router
    .route('/signup')
    .post(signup)

router
    .route('/login')
    .get(login)
    
router
    .route('/')
    .get(getAllUsers)

router
    .route('/:id')
    .get(getUser)
    .delete(deleteUser)
    // .patch(patchUser)

module.exports = router