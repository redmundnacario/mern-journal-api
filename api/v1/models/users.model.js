const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: null},
    journals : [{type: mongoose.Types.ObjectId, required: true , ref: "Journal"}]
})

const User = mongoose.model("User", userSchema)

module.exports = User