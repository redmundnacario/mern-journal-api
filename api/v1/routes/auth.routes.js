const express = require('express')
const {check} = require('express-validator')

//middlewares
const {auth, checkLevel} = require('../middlewares/auth')

const authControllers = require('../controllers/auth.controllers')

const router = express.Router()

// @route   GET /
// @desc    Get the authenticated user
// @access  Private
router.get("/", auth, authControllers.getAuthenticatedUser)

// @route   POST /auth/signup
// @desc    Register a user
// @access  Public
router.post("/signup",
            [
                check("name").not().isEmpty(),
                check("email").normalizeEmail().isEmail(),
                check("password").isLength({min:7})
            ]
            ,
            authControllers.signUp)
            
// @route   POST /auth/signin
// @desc    Logging in a user
// @access  Public
router.post("/signin", authControllers.signIn)


module.exports = router