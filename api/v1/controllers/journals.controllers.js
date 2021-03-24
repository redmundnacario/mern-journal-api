const { v4: uuidv4 }  = require('uuid')

const HttpError = require('../models/error');

let DUMMY_JOURNALS = [
    {
        id: 1,
        title: "Journal1",
        description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        user_id: 1,
        tasks: []
    },
    {
        id:2,
        title: "Journal2",
        description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        user_id: 1,
        tasks: []
    },
    {
        id:3,
        title: "Journal2",
        description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        user_id: 2,
        tasks: []
    },
]

const getAllJournals =(req, res, next) => {
    res.status(200).json(DUMMY_JOURNALS)
}
// GET journal by id
const getJournalById = (req, res, next) => {
    const journalId = req.params.jid
    // find journal
    const hasJournal = DUMMY_JOURNALS.find(value => value.id == journalId )
    // if journals is undefined or missing
    if (!hasJournal){
        return next(new HttpError("Journal not found", 404))
    }
    //send response
    res.status(200).json({...hasJournal})
}

// GET all journals by userid
const getAllJournalsByUserId = (req, res, next) => {
    const userId = req.params.uid

    // filter dummy data
    const journals = DUMMY_JOURNALS.filter(value => value.user_id == userId)
    // if journals is undefined or length of journals is empty
    if (!journals || journals.length === 0){
        return next(new HttpError("Users journals not found", 404))
    }
    // send response
    res.status(200).json(journals)
}

// CREATE journal
const createJournal = (req,res,next) => {
    const {title, description, user_id} = req.body

    // creat new journal data
    const createdJournal = {
        id: uuidv4(),
        title,
        description,
        user_id,
        tasks : []
    }

    // push to dummy data
    DUMMY_JOURNALS.push(createdJournal)
    // send response
    res.status(201).json({...createdJournal})
}

// EDIT Journal
const editJournal = (req, res, next) => {
    const { title, description } =req.body
    const journalId = req.params.jid

    // find journal
    const hasJournal = DUMMY_JOURNALS.find( value => value.id == journalId )
    
    // if journals is undefined or missing
    if (!hasJournal){
        return next(new HttpError("Journal not found", 404))
    }

    hasJournal.title = title
    hasJournal.description = description

    res.status(200).json({...hasJournal})

}

const deleteJournal = (req, res, next) => {
    const journalId = req.params.jid

    const hasJournal = DUMMY_JOURNALS.find( value => value.id == journalId )
    
    // if journals is undefined or missing
    if (!hasJournal){
        return next(new HttpError("Journal not found", 404))
    }

    // console.log(placeId)
    DUMMY_JOURNALS = DUMMY_JOURNALS.filter(value => value.id != journalId)

    // console.log(DUMMY_JOURNALS)
    res.status(200).json({message: "Journal deleted."})
}

exports.getAllJournals = getAllJournals
exports.getJournalById = getJournalById
exports.getAllJournalsByUserId = getAllJournalsByUserId
exports.createJournal = createJournal
exports.editJournal = editJournal
exports.deleteJournal = deleteJournal