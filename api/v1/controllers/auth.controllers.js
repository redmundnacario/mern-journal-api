
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')

// model
const User = require('../models/users.model')
const HttpError = require('../models/error')

// helpers
const {errorFormatter, errorArrayFormater} = require('../helpers/helpers')

// @route   GET /
// @desc    Get the authenticated user
// @access  Private
const getAuthenticatedUser = async(req, res, next) =>{
    
    const userId = req.user.id

    let user;
    try { 
        // get all users, excluding the password attribute
        user = await User.findById(userId).select("-password -type -_id -__v")
    } catch(error){
        console.log(error)
        return next(new HttpError("Something went wrong in accessing the user. Try again.", 500))
    }
    console.log(userId)
    res.status(200).json({user: user.toObject({getters: true})})
}

// @route   POST /auth/signup
// @desc    Register a user
// @access  Public
const signIn = async(req,res,next) => {
    const {email, password} = req.body

    // find if email is valid user
    
    let existingUser 
    try {
        existingUser = await User.findOne({email:email})
    } catch (error) {
        console.log(error)
        return next(new HttpError("Something went wrong. Try again.", 500))
    }
    
    if (!existingUser){
        //throw error
        const error =new HttpError("Credentials given are incorrect", 422)
        return next(error )
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (!match){
        //throw error
        const error =new HttpError("Credentials given are incorrect", 422)
        return next(error )
    }

    const payload = {
        user: {
            id: existingUser.id,
            type: existingUser.type
        }
    }

    jwt.sign(payload, config.get("jwtSecret"),{
        expiresIn: 360000
    },(err,token)=>{
        if (err){ 
            console.log(error)
            return next(new HttpError("Authenticating user failed.", 500))
        }
        console.log(token)
        res.status(200).json({token:token})
    })
}

// @route   POST /auth/signin
// @desc    Logging in a user
// @access  Public
const signUp = async(req,res,next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array({ onlyFirstError: true })), 422))
    }

    const {name, email, password} = req.body

    let existingUser 
    try {
        existingUser = await User.findOne({email:email})
    } catch (error) {
        console.log(error)
        return next(new HttpError("Something went wrong. Try again.", 500))
    }

    if (existingUser) {
        return next(new HttpError("Account already taken", 422))
    }
    const createdUser = new User({
        name,
        email,
        password,
        journals: []
    })

    try {
        // encrpt
        const salt = await bcrypt.genSalt(10)
        createdUser.password = await bcrypt.hash(password, salt)
        await createdUser.save()
    } catch (error) {
        console.log(error)
        return next(new HttpError("Something went wrong in creating user. Try again.", 500))
    }

    const payload = {
        user: {
            id: createdUser.id,
            type: createdUser.type
        }
    }

    jwt.sign(payload, config.get("jwtSecret"),{
        expiresIn: 360000
    },(err,token)=>{
        if (err){ 
            console.log(error)
            return next(new HttpError("Authenticating user failed.", 500))
        }
        console.log(token)
        res.status(201).json({token:token})
    })
}

exports.getAuthenticatedUser = getAuthenticatedUser
exports.signIn = signIn
exports.signUp = signUp
