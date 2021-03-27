const { v4: uuidv4 }  = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/error')
const mongoose = require('mongoose')

// models
const Task = require('../models/tasks.model')

let DUMMY_TASKS = [
    {
        id: 1,
        title: "Task 1",
        description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        user_id: 1,
        journal_id: 1,
    },
    {
        id:2,
        title: "Task 2",
        description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        user_id: 1,
        journal_id: 1,
    },
    {
        id:3,
        title: "task 3",
        description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        user_id: 2,
        journal_id: 2,
    },
]

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    // return `${location}[${param}]: ${msg}`;
    if (value == null){
        return `The '${param}' from the input data is not defined or missing.`;
    } else if (param === "description" && value.length < 10){
        return `The length of '${param}' should be greater than 9 characters.`;
    } else {
        return `${msg} '${value}' in ${param}`;
    }
};

const errorArrayFormater = (errorMap) => {
    errors = ""
    for (const error of errorMap) {
        if (errors == ""){
            errors = errors + error
        } else {
            errors = errors + ". " + error
        }
    }
    return errors
}

const getAllTasks = async(req, res, next) => {
    let tasks
    try {
        tasks = await Task.find()
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
    //send response
    res.status(200).json({task: task.toObject({getters:true})})
}

// GET all Tasks by journal Id
const getAllTasksByJournalId = async(req, res, next) => {
    const journalId = req.params.jid

    // filter dummy data
    let tasks 
    try {
        tasks = await Task.find({journal_id: journalId}).populate("tasks")
        console.log(tasks)
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the tasks", 500))
    }
    // if tasks is undefined or length of tasks is empty
    if (!tasks){
        return next(new HttpError("Tasks not found", 404))
    }
    console.log(tasks)
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

    const {title, description, journal_id, user_id} = req.body

    // creat new task data
    const createdTask = new Task({
        title,
        description,
        journal_id,
        user_id
    })

    // check if user id and journal id exists
    let user 
    try {
        user = await User.findById(user_id)
    } catch (error) {
        return next(HttpError("Something went wrong in accessing the user.", 500))
    } 

    if (!user){
        return next(HttpError("User not found.",404))
    }

    let journal 
    try {
        journal = await Journal.findById(journal_id)
    } catch (error) {
        return next(HttpError("Something went wrong in accessing the journal.", 500))
    } 

    if (!journal){
        return next(HttpError("Journal not found.",404))
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
        return next(HttpError("Something went wrong in saving the task.", 500))
    }
    DUMMY_TASKS.push(createdTask)
    // send response
    res.status(201).json({...createdTask})
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
        task = await Task.findById(taskId)
    } catch (error) {
        return next(new HttpError("Something wrong in accessing the task. Try again",500))
    }

    if (!task){
        return next(new HttpError("Task not found", 404))
    }

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