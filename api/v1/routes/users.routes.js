const express = require('express')
const { check } = require('express-validator')

//middlewares
const auth = require('../middlewares/auth')
const usersControllers = require('../controllers/users.controllers')


const router = express.Router()



// @route   GET /users/
// @desc    Get all users
// @access  Private 
// @level   Admin
router.get("/", auth, usersControllers.getUsers)

// @route   GET /users/:uid
// @desc    Get a single user
// @access  Private
// @level   User
router.get("/:uid", auth, usersControllers.getUserbyId)


// @route   PATCH /users/:uid
// @desc    edit single user
// @access  Private
// @level   Admin
router.patch("/:uid",
            [
                auth,
                check("name").optional().exists(),
                check("email").optional().normalizeEmail().isEmail(),
                check("password").optional().isLength({min:7})
            ],
            usersControllers.editUser)


// @route   DELETE /users/:uid
// @desc    Remove current single user and its contents in other tables
// @access  Private
router.delete("/:uid", auth, usersControllers.deleteUser)

module.exports = router
