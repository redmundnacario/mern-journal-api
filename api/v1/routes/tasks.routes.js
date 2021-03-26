const express = require('express')
const {check} = require('express-validator')

//middlewares
const auth = require('../middlewares/auth')

const tasksControllers = require("../controllers/tasks.controllers")



const router = express.Router()


// @route   GET /tasks/
// @desc    Get all tasks
// @access  Private 
// @level   User
router.get("/", auth, tasksControllers.getAllTasks)

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
            ],
            tasksControllers.createTask)

// edit
router.patch("/:tid",
            [   
                auth,
                check('title').not().isEmpty(),
                check('description').isLength({min:10})
            ],
            tasksControllers.editTask)

//update
// router.put()

//delete
router.delete("/:tid", tasksControllers.deleteTask)

module.exports = router