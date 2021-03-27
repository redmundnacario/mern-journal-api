const { v4: uuidv4 }  = require('uuid')
const { validationResult } = require("express-validator")
const mongoose = require('mongoose')

//models
const Journal = require('../models/journals.model')
const Task = require('../models/tasks.model')
const User = require('../models/users.model')
const HttpError = require('../models/error');

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




// Get all Journals
const getAllJournals = async(req, res, next) => {
    let journals
    try {
        journals = await Journal.find()
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the Journals. Try again.", 500))
    }

    res.status(200).json({journals: journals.map(journal => journal.toObject({getters:true}))})
}
// GET journal by id
const getJournalById = async(req, res, next) => {
    const journalId = req.params.jid
    // find journal
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
    //send response
    res.status(200).json({journal : journal.toObject({getters:true})})
}

// GET all journals by userid
const getAllJournalsByUserId = async(req, res, next) => {
    const userId = req.params.uid

    // filter  data
    let journals
    try {
        journals = await Journal.find({user_id: userId}).populate('journals')
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the Journal.", 500))
    }

    // if journals is undefined or length of journals is empty
    if (!journals){
        return next(new HttpError("User's journals not found.", 404))
    }
    // send response
    res.status(200).json({journals: journals.map(journal => journal.toObject({getters:true}))})
}

// CREATE journal
const createJournal = async(req,res,next) => {

    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array()), 422))
    }

    const {title, description, user_id} = req.body

    // creat new journal data
    const createdJournal = new Journal({
        title,
        description,
        user_id,
        tasks : []
    })

    // check if user exist
    let user 
    try {
        user = await User.findById(user_id)
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the user.", 500))
    } 

    if (!user){
        return next(new HttpError("User not found.",404))
    }

    // when updating two tables/document, needs session
    // advantage is to rollback if place creation failed or user update failed
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()

        await createdJournal.save({session:sess})
        user.journals.push(createdJournal)
        await user.save({session:sess})

        await sess.commitTransaction();
    } catch (error) {
        console.log(error)
        return next( new HttpError("Creating Journal failed. Try again.", 500))
    }
    // send response
    res.status(201).json({journal: createdJournal.toObject({getters:true})})
}

// EDIT Journal
const editJournal = async(req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array()), 422))
    }

    const attributesToChange =req.body
    const journalId = req.params.jid

    // find journal
    let journal
    try {
        journal = await Journal.findById(journalId)
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the journal.", 500))
    }

    // if journals is undefined or missing
    if (!journal){
        return next(new HttpError("Journal not found", 404))
    }

    // update journal
    try {
        attributesToChange.date_update = Date.now()
        journal = await Journal.findByIdAndUpdate(journalId, attributesToChange, { new: true })
    } catch (error) {
        return next( new HttpError("Updating journal failed. Try again.", 500))
    }

    res.status(200).json({journal: journal.toObject({getters:true})})

}

const deleteJournal = async(req, res, next) => {
    const journalId = req.params.jid

    // find journal
    let journal
    try {
        journal = await Journal.findById(journalId)
    } catch (error) {
        return next(new HttpError("Something went wrong in accessing the journal.", 500))
    }

    // if journals is undefined or missing
    if (!journal){
        return next(new HttpError("Journal not found", 404))
    }

    // Delete data from db
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await journal.remove({session: sess})
        journal.user_id.journals.pull(journal)
        await journal.user_id.save({session: sess});

        await sess.commitTransaction();
    } catch(err){
        return next( new HttpError("Deleting journal failed. Try again.", 500))
    }

    res.status(200).json({message: "Journal deleted."})
}

exports.getAllJournals = getAllJournals
exports.getJournalById = getJournalById
exports.getAllJournalsByUserId = getAllJournalsByUserId
exports.createJournal = createJournal
exports.editJournal = editJournal
exports.deleteJournal = deleteJournal