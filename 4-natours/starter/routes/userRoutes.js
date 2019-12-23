const express = require('express')
const router = express.Router()
const {getAllUsers, createUser, getUser, deleteUser, patchUser} = require('../controllers/userControllers')

router
    .route('/')
    .get(getAllUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .delete(deleteUser)
    .patch(patchUser)

module.exports = router