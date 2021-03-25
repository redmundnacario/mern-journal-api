const express = require('express')
const { check } = require('express-validator')

const router = express.Router()

const usersControllers = require('../controllers/users.controllers')

router.get("/", usersControllers.getUsers)

router.post("/signup",
            [
                check("name").not().isEmpty(),
                check("email").normalizeEmail().isEmail(),
                check("password").isLength({min:7})
            ]
            ,
            usersControllers.signUp)

router.post("/signin", usersControllers.signIn)


module.exports = router
