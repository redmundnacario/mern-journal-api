const { v4: uuidv4 }  = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/error.js');

let DUMMY_USERS = [
    {
        id: "u1",
        name: "Red",
        email: "rednacky@gmail.com",
        password: "123456"
    },
    {
        id: "u2",
        name: "marge",
        email: "margy@gmail.com",
        password: "123456"       
    }
]

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    // return `${location}[${param}]: ${msg}`;
    if (value == null){
        return `The '${param}' from the input data is not defined or missing.`;
    } else if (param === "password" || param === "confirmnPassword" && value.length < 7){
        return `The length of '${param}' should be greater than 6 characters.`;
    } else {
        return `${msg} ${value}`;
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

const getUsers =(req,res,next) => {
    res.json({users: DUMMY_USERS})
}

const signIn = (req,res,next) => {
    const {email, password} = req.body

    // find if email is valid user
    const hasUser = DUMMY_USERS.find(value => value.email == email )
    // console.log(hasUser)
    // console.log(hasUser.password !== password)

    if (!hasUser || hasUser.password !== password){
        //throw error
        const error =new HttpError("Credentials given is incorrect", 422)
        return next(error )
    }

    res.status(200).json({message: "User successfully signed in."})
}

const signUp = (req,res,next) => {
    const errors = validationResult(req).formatWith(errorFormatter)
    const hasErrors = !errors.isEmpty()

    if (hasErrors){
        return next(new HttpError(errorArrayFormater(errors.array({ onlyFirstError: true })), 422))
    }

    const {name, email, password} = req.body

    const hasUser = DUMMY_USERS.find(value => value.email == email)

    if (hasUser) {
        return next(new HttpError("Account already taken", 422))
    }
    const createdUser ={
        id:uuidv4(),
        name,
        email,
        password
    }
    DUMMY_USERS.push(createdUser)

    res.status(201).json({user:createdUser})
}


exports.getUsers = getUsers
exports.signIn = signIn
exports.signUp = signUp
