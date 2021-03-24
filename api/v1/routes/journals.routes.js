const express = require('express')
const HttpError = require('../models/error')

const router = express.Router()

const journalsControllers = require('../controllers/journals.controllers')


router.get("/", journalsControllers.getAllJournals)

// get journal by id
router.get("/:jid", journalsControllers.getJournalById)

// get all journals by a user id
router.get("/user/:uid", journalsControllers.getAllJournalsByUserId)

// create
router.post("/", journalsControllers.createJournal)

// edit
router.patch("/:jid", journalsControllers.editJournal)

//update
// router.put("/:jid", journalsControllers.updateJournal)

//delete
router.delete("/:jid", journalsControllers.deleteJournal)

module.exports = router