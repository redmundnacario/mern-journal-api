const { v4: uuidv4 }  = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/error');

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

const getAllTasks =(req, res, next) => {
    res.status(200).json(DUMMY_TASKS)
}
// GET Task by id
const getTaskById = (req, res, next) => {
    const taskId = req.params.tid
    // find Task
    const hasTask = DUMMY_TASKS.find(value => value.id == taskId )
    // if tasks is undefined or missing
    if (!hasTask){
        return next(new HttpError("Task not found", 404))
    }
    //send response
    res.status(200).json({...hasTask})
}

// GET all Tasks by journal Id
const getAllTasksByJournalId = (req, res, next) => {
    const journalId = req.params.jid

    // filter dummy data
    const tasks = DUMMY_TASKS.filter(value => value.journal_id == journalId)
    // if tasks is undefined or length of tasks is empty
    if (!tasks || tasks.length === 0){
        return next(new HttpError("Tasks not found", 404))
    }
    // send response
    res.status(200).json(tasks)
}

// GET all tasks by user id
const getAllTasksByUserId = (req, res, next) => {
    const userId = req.params.uid

    // filter dummy data
    const tasks = DUMMY_TASKS.filter(value => value.user_id == userId)
    // if tasks is undefined or length of tasks is empty
    if (!tasks || tasks.length === 0){
        return next(new HttpError("Tasks not found", 404))
    }
    // send response
    res.status(200).json(tasks)
}

// CREATE task
const createTask = (req,res,next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array()), 422))
    }

    const {title, description, journal_id, user_id} = req.body

    // creat new task data
    const createdTask = {
        id: uuidv4(),
        title,
        description,
        journal_id,
        user_id
    }

    // push to dummy data
    DUMMY_TASKS.push(createdTask)
    // send response
    res.status(201).json({...createdTask})
}

// EDIT Task
const editTask = (req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array()), 422))
    }
    
    const { title, description } = req.body
    const taskId = req.params.tid

    // find task
    const hasTask = DUMMY_TASKS.find( value => value.id == taskId )
    
    // if task is undefined or missing
    if (!hasTask){
        return next(new HttpError("Task not found", 404))
    }

    hasTask.title = title
    hasTask.description = description

    res.status(200).json({...hasTask})

}

const deleteTask = (req, res, next) => {
    const taskId = req.params.tid

    const hasTask = DUMMY_TASKS.find( value => value.id == taskId )
    
    // if journals is undefined or missing
    if (!hasTask){
        return next(new HttpError("Task not found", 404))
    }

    // console.log(placeId)
    DUMMY_TASKS = DUMMY_TASKS.filter(value => value.id != taskId)

    // console.log(DUMMY_TASKS)
    res.status(200).json({message: "Task deleted."})
}

exports.getAllTasks = getAllTasks

exports.getTaskById = getTaskById
exports.getAllTasksByJournalId = getAllTasksByJournalId
exports.getAllTasksByUserId = getAllTasksByUserId

exports.createTask = createTask
exports.editTask = editTask
exports.deleteTask = deleteTask