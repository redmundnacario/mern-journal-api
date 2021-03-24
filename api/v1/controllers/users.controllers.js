const { v4: uuidv4 }  = require('uuid')
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
