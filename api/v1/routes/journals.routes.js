const express = require('express')
const HttpError = require('../models/error')
const { check } = require('express-validator')

//middlewares
const auth = require('../middlewares/auth')

const journalsControllers = require('../controllers/journals.controllers')



const router = express.Router()



// @route   GET /journals
// @desc    Get all journals
// @access  Private 
// @level   User
router.get("/", auth, journalsControllers.getAllJournals)

// @route   GET /journals/:jid
// @desc    Get a journal by single id
// @access  Private 
// @level   User
router.get("/:jid", auth, journalsControllers.getJournalById)


// @route   GET /journals/user/:uid
// @desc    Get all journals of a single User id
// @access  Private 
// @level   User
router.get("/user/:uid", auth, journalsControllers.getAllJournalsByUserId)


// @route   POST /journals
// @desc    Create a Journal
// @access  Private 
// @level   User
router.post("/", 
            [   
                auth,
                check('title').not().isEmpty(),
                check('description').isLength({min:10}),
                check('user_id').not().isEmpty(),
            ],
            journalsControllers.createJournal)

// @route   PATCH /journals/:jid
// @desc    Edit a Journal
// @access  Private 
// @level   User
router.patch("/:jid", 
            [   
                auth,
                check('title').optional().not().isEmpty(),
                check('description').optional().isLength({min:10})
            ],
            journalsControllers.editJournal)


// @route   DELETE /journals/:jid
// @desc    Edit a Journal
// @access  Private 
// @level   User
router.delete("/:jid", auth, journalsControllers.deleteJournal)

module.exports = router