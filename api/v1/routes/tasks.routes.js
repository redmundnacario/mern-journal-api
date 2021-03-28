const express = require('express')
const {check} = require('express-validator')

//middlewares
const {auth, checkLevel} = require('../middlewares/auth')

const tasksControllers = require("../controllers/tasks.controllers")



const router = express.Router()


// @route   GET /tasks/
// @desc    Get all tasks
// @access  Private 
// @level   Admin
router.get("/", auth, checkLevel, tasksControllers.getAllTasks)


// @route   GET /tasks/:tid
// @desc    Get a journal by single id
// @access  Private 
// @level   User
router.get("/:tid", auth,  tasksControllers.getTaskById)


// @route   GET /tasks/journal/:jid
// @desc    Get tasks by single journal id
// @access  Private 
// @level   User
router.get("/journal/:jid", auth, tasksControllers.getAllTasksByJournalId)


// @route   GET /tasks/user/:uid
// @desc    Get tasks by single user id
// @access  Private 
// @level   User
router.get("/user/:uid", auth, tasksControllers.getAllTasksByUserId)


// @route   POST /tasks/
// @desc    Create a new task
// @access  Private 
// @level   User
router.post("/",
            [   
                auth,
                check('title').not().isEmpty(),
                check('description').isLength({min:10}),
                check('journal_id').not().isEmpty(),
                check('user_id').not().isEmpty(),
                check('deadline').not().isEmpty(),
            ],
            tasksControllers.createTask)


// @route   PATCH /tasks/:tid
// @desc    Edit task
// @access  Private 
// @level   User
router.patch("/:tid",
            [   
                auth,
                check('title').optional().not().isEmpty(),
                check('description').optional().isLength({min:10}),
                check('deadline').optional().not().isEmpty(),
            ],
            tasksControllers.editTask)


// @route   DELETE /tasks/:tid
// @desc    Delete task
// @access  Private 
// @level   User
router.delete("/:tid",auth, tasksControllers.deleteTask)

module.exports = router