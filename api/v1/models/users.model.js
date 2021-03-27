const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    type: {type:String, default:'user', immutable: true},//cannot be changed or updated
    date_created: {type: Date, default: Date.now},
    date_updated: {type: Date, default: null},
    journals : [{type: mongoose.Types.ObjectId, required: true , ref: "Journal"}]
})

const User = mongoose.model("User", userSchema)

module.exports = User