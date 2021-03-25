const express = require('express')
const {check} = require('express-validator')
const HttpError = require('../models/error')

const router = express.Router()

const tasksControllers = require("../controllers/tasks.controllers")

// get all
router.get("/", tasksControllers.getAllTasks)

// get task by task id
router.get("/:tid",  tasksControllers.getTaskById)

// get task by journal id
router.get("/journal/:jid", tasksControllers.getAllTasksByJournalId)

// get task by userid
router.get("/user/:uid", tasksControllers.getAllTasksByUserId)

// create
router.post("/",
            [
                check('title').not().isEmpty(),
                check('description').isLength({min:10}),
                check('journal_id').not().isEmpty(),
                check('user_id').not().isEmpty(),
            ],
            tasksControllers.createTask)

// edit
router.patch("/:tid",
            [
                check('title').not().isEmpty(),
                check('description').isLength({min:10})
            ],
            tasksControllers.editTask)

//update
// router.put()

//delete
router.delete("/:tid", tasksControllers.deleteTask)

module.exports = router