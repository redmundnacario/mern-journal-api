const express = require('express');
const bodyParser = require('body-parser');

// MongoDB connect
const connectDB = require('./config/db')
connectDB()

// active version
const ACTIVE_VERSION = "/api/v1"

//models/
const HttpError = require(`.${ACTIVE_VERSION}/models/error`)

// routes
const usersRoutes = require(`.${ACTIVE_VERSION}/routes/users.routes`)
const journalsRoutes = require(`.${ACTIVE_VERSION}/routes/journals.routes`)
const tasksRoutes = require(`.${ACTIVE_VERSION}/routes/tasks.routes`)

// inititialize app
const app = express()
const PORT = 5000

//body paraser for json
app.use(bodyParser.json())

// assign routes
app.use(`${ACTIVE_VERSION}/users`, usersRoutes);
app.use(`${ACTIVE_VERSION}/journals`, journalsRoutes);
app.use(`${ACTIVE_VERSION}/tasks`, tasksRoutes);

// handle if routes not found

app.use((req, res, next)=>{
    const error = new HttpError("404 Not found!",404)
    return next(error)
})
// handle errors
app.use((error, req, res, next) => {
    if (res.headerSent){
        return next(error)
    }
    console.log("Error : ", req.method, req.originalUrl , error.code, error.message)
    res.status(error.code || 500)
    res.json({ message: error.message || "Unknown error occured!"});
})


// test
app.use((req,res,next) => {
    res.send("Hello")
})


// serve
app.listen(5000, ()=> console.log(`Serving at port ${PORT}`))