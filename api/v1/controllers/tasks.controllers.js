const { v4: uuidv4 }  = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/error')
const mongoose = require('mongoose')

// models
const Task = require('../models/tasks.model')
const Journal = require('../models/journals.model')
const User = require('../models/users.model')

// helpers
const {errorFormatter, errorArrayFormater, checkCurrentUser} = require('../helpers/helpers')

const getAllTasks = async(req, res, next) => {
    let tasks
    try {
        tasks = await Task.find({})
    } catch (error) {
        return next(HttpError("Something went wrong in accessing the tasks.",500))
    }

    res.status(200).json({tasks: tasks.map(task => task.toObject({getters:true}))})
}
// GET Task by id
const getTaskById = async(req, res, next) => {
    const taskId = req.params.tid
    // find Task
    let task
    try {
        task = await Task.findById(taskId)
    } catch (error) {
        return next(HttpError("Something went wrong in accessing the tasks.",500))
    }
    // if tasks is undefined or missing
    if (!task){
        return next(new HttpError("Task not found", 404))
    }

    // check if user is admin or current user , if not invoke error
    const checkError = checkCurrentUser(req.user, task.user_id.toString())
    if (checkError) { 
        return next(checkError)}


    //send response
    res.status(200).json({task: task.toObject({getters:true})})
}

// GET all Tasks by journal Id
const getAllTasksByJournalId = async(req, res, next) => {
    const journalId = req.params.jid

    //  get journal

    let journal
    try {
        console.log(journalId)
        journal = await Journal.findById(journalId)
    } catch (error) {
        console.log(error)
        return next(new HttpError("Something went wrong in accessing the Journal. Try again.", 500))
    }
    // if journals is undefined or missing
    if (!journal){
        return next(new HttpError("Journal not found.", 404))
    }

    // check if user is admin or current user , if not invoke error
    const checkError = checkCurrentUser(req.user, journal.user_id.toString())
    if (checkError) { 
        return next(checkError)
    }


    // filter dummy data
    let tasks 
    try {

        tasks = await Task.find({journal_id: journalId}).populate("tasks")
        
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the tasks", 500))
    }
    // if tasks is undefined or length of tasks is empty
    if (!tasks){
        return next(new HttpError("Tasks not found", 404))
    }

    
    // send response
    res.status(200).json({tasks: tasks.map(task => task.toObject({getters: true}))})
}

// GET all tasks by user id
const getAllTasksByUserId = async(req, res, next) => {
    const userId = req.params.uid

    // filter dummy data
    let tasks 
    try {
        tasks = await Task.find({user_id: userId}).populate("tasks")
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the tasks", 500))
    }
    // if tasks is undefined or length of tasks is empty
    if (!tasks){
        return next(new HttpError("Tasks not found", 404))
    }

    // check if user is admin or current user , if not invoke error
    const checkError = checkCurrentUser(req.user, userId)
    if (checkError) { 
        return next(checkError)}


    // send response
    res.status(200).json({tasks: tasks.map(task => task.toObject({getters: true}))})
}

// CREATE task
const createTask = async(req,res,next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array()), 422))
    }

    const {title, description, journal_id, user_id, deadline} = req.body
    console.log(req.body)
    // creat new task data
    const createdTask = new Task({
        title,
        description,
        journal_id,
        user_id,
        deadline
    })

    // check if user id and journal id exists
    let user 
    try {
        user = await User.findById(user_id)
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the user.", 500))
    } 

    if (!user){
        return next(new HttpError("User not found.",404))
    }

    // check if user is admin or current user , if not invoke error
    const checkError = checkCurrentUser(req.user, user.id.toString())
    if (checkError) { 
        return next(checkError)}

    let journal 
    try {
        journal = await Journal.findById(journal_id).populate('tasks')
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the journal.", 500))
    } 

    if (!journal){
        return next(new HttpError("Journal not found.",404))
    }

    // if (user_id !== journa)
    // push to dummy data
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()

        await createdTask.save({session:sess})
        journal.tasks.push(createdTask)
        await journal.save({session:sess})

        sess.commitTransaction()
    } catch (error) {
        return next(new HttpError("Something went wrong in saving the task.", 500))
    }
    // send response
    res.status(201).json({task: createdTask.toObject({getters:true})})
}

// EDIT Task
const editTask = async(req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array()), 422))
    }
    
    const attributesToChange = req.body
    const taskId = req.params.tid

    // find task
    let task
    try {
        task = await Task.findById(taskId)
    } catch (error) {
        return next(new HttpError("Something wrong in accessing the task. Try again",500))
    }

    if (!task){
        return next(new HttpError("Task not found", 404))
    }

    // check if user is admin or current user , if not invoke error
    const checkError = checkCurrentUser(req.user, task.user_id.toString())
    if (checkError) { 
        return next(checkError)}
    
    // update taask
    try {
        attributesToChange.date_updated = Date.now()
        task = await Task.findByIdAndUpdate(taskId, attributesToChange, {new:true})
    } catch (error) {
        return next(new HttpError("Updating task failed. Try again.", 500))
    }

    res.status(200).json({task: task.toObject({getters:true})})

}

const deleteTask = async(req, res, next) => {
    const taskId = req.params.tid

    // find task
    let task
    try {
        task = await Task.findById(taskId).populate("journal_id")
    } catch (error) {
        return next(new HttpError("Something wrong in accessing the task. Try again",500))
    }

    if (!task){
        return next(new HttpError("Task not found", 404))
    }


    // check if user is admin or current user , if not invoke error
    const checkError = checkCurrentUser(req.user, task.user_id.toString())
    if (checkError) { 
        return next(checkError)}

    // Delete data from db
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await task.remove({session: sess})
        task.journal_id.tasks.pull(task)
        await task.journal_id.save({session: sess});

        await sess.commitTransaction();
    } catch(err){
        return next( new HttpError("Deleting task failed. Try again.", 500))
    }

    res.status(200).json({message: "Task deleted."})
}

exports.getAllTasks = getAllTasks

exports.getTaskById = getTaskById
exports.getAllTasksByJournalId = getAllTasksByJournalId
exports.getAllTasksByUserId = getAllTasksByUserId

exports.createTask = createTask
exports.editTask = editTask
exports.deleteTask = deleteTask