const express = require('express')
const router = express.Router()
const {getAllUsers, signup, getUser, deleteUser, patchUser} = require('../controllers/userControllers')

router
    .route('/signup')
    .post(signup)
    
router
    .route('/')
    .get(getAllUsers)

router
    .route('/:id')
    .get(getUser)
    .delete(deleteUser)
    // .patch(patchUser)

module.exports = router