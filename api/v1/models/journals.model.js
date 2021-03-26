const mongoose = require("mongoose")

const Schema = mongoose.Schema

const journalSchema = new Schema({
    title : {type: String, required: true},
    description :{type: String, required: true, minlength:10},
    user_id: {type: mongoose.Types.ObjectId, required: true, ref: "User"},
    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: null},
    tasks : [{type: mongoose.Types.ObjectId, required: true , ref: "Task"}]
})

const Journal = mongoose.model("Journal", journalSchema)

module.exports = Journal