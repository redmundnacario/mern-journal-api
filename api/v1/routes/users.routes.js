const express = require('express')
const expressValidator = require('express-validator')

const router = express.Router()

const usersControllers = require('../controllers/users.controllers')

router.get("/", usersControllers.getUsers)

router.post("/signup", usersControllers.signUp)

router.post("/signin", usersControllers.signIn)


module.exports = router
