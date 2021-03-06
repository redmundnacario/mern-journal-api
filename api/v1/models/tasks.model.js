const mongoose = require("mongoose")

const Schema = mongoose.Schema

const taskSchema = new Schema({
    title : {type: String, required: true},
    description :{type: String, required: true, minlength:10},
    deadline : {type: Date, required: true},
    user_id: {type: mongoose.Types.ObjectId, required: true, ref: "User"},
    journal_id : {type: mongoose.Types.ObjectId, required: true, ref: "Journal"},
    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: null}
    
})

const Task = mongoose.model("Task", taskSchema)

module.exports = Task