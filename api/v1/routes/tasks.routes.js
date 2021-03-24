const express = require('express')
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
router.post("/", tasksControllers.createTask)

// edit
router.patch("/:tid", tasksControllers.editTask)

//update
// router.put()

//delete
router.delete("/:tid", tasksControllers.deleteTask)

module.exports = router