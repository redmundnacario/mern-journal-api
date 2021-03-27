const { validationResult } = require('express-validator')
const mongoose = require("mongoose")

// model
const User = require('../models/users.model')
const HttpError = require('../models/error')

// helpers
const {errorFormatter, errorArrayFormater} = require('../helpers/helpers')


// check if user id
const checkCurrentUser = (reqUser, userParamsId) => {
    const userId = reqUser.id
    const type = reqUser.type
    console.log("admin?", type === 'admin', type)
    console.log("not same user?", userId !== userParamsId , userId, userParamsId)

    if (type === "admin"){
        return
    }

	if (userId !== userParamsId ){
		const error = new HttpError('Unauthorized access denied. User does not match.', 401)
        return error
	}
}


// @route   GET /users/
// @desc    Get all users
// @access  Private
// @level   Admin
const getUsers = async(req,res,next) => {
    let users;

    try {
        // get all users, excluding the password attribute
        users = await User.find({})
    } catch(error){

        return next(new HttpError("Something went wrong in accessing the users. Try again.", 500))
    }

    if(!users){
        return next(new HttpError("Users does not exist", 404))
    }

    // 

    res.status(200).json({users: users.map(user => user.toObject({getters: true}))})
}


// @route   GET /users/:id
// @desc    Get a single user
// @access  Private
// @level   Admin
const getUserbyId = async(req,res,next) => {
    const userId = req.params.id

    let user;
    try {
        // get all users, excluding the password attribute
        user = await User.findById(userId).select('-type')
    } catch(error){

        return next(new HttpError("Something went wrong in accessing the user. Try again.", 500))
    }

    if(!user){
        return next(new HttpError("User does not exist.", 404))
    }


    res.status(200).json({user: user.toObject({getters: true})})
}

// @route   PATCH /users/:id
// @desc    edit current single user
// @access  Private
const editUser = async(req, res, next) => {

    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array({ onlyFirstError: true })), 422))
    }

    const attributesToChange = req.body
    const userId = req.params.id

    // check if user is admin or current user
    const checkError = checkCurrentUser(req.user, userId)
    if (checkError) { 
        console.log(checkError)
        return next(checkError)}

    //check if user exist
    let user;
    try {
        // get all users, excluding the password attribute
        user = await User.findById(userId).select('-type')
    } catch(error){
        console.log(error)
        return next(new HttpError("Something went wrong in accessing the user. Try again.", 500))
    }

    if(!user){
        return next(new HttpError("User does not exist.", 404))
    }

    // update user
    
    try {
        attributesToChange.date_updated = Date.now()
        user = await User.findByIdAndUpdate(userId, attributesToChange, { new: true }).select("-password");
        
    } catch (error){

        return next( new HttpError("Updating user failed. Try again.", 500))
    }

    res.status(200).json({user: user.toObject({getters: true})})
}


// @route   DELETE /users/:id
// @desc    Remove current single user and its contents in other tables
// @access  Private
const deleteUser = async(req, res, next) => {
    const userId = req.params.id

    // check if user is admin or current user
    checkCurrentUser(req.user, userId)

    // find user
    let user 
    try {
        user = await User.findById(userId).select('-type')
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the user.", 500))
    }

    if (!user){
        return next(new HttpError("User not found.", 404))
    }

    // delete user
    try {
    
        await user.remove()
    } catch (error) {
        console.log(error)
        return next(new HttpError("Deleting user failed. Try again.", 500))
    }

    res.status(200).json({message: "User deleted."})
}



exports.getUsers = getUsers
exports.getUserbyId = getUserbyId
exports.editUser = editUser
exports.deleteUser = deleteUser

