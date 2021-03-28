const HttpError = require('../models/error')

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    // return `${location}[${param}]: ${msg}`;
    if (value == null){
        return `The '${param}' from the input data is not defined or missing.`;
    } else if (param === "password" || param === "confirmnPassword" && value.length < 7){
        return `The length of '${param}' should be greater than 6 characters.`;
    } else {
        return `${msg} ${value} in ${param}`;
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

const checkCurrentUser = (reqUser, userParamsId) => {
    const userId = reqUser.id
    const type = reqUser.type
    console.log("admin?", type === 'admin', type)
    console.log("not same user?", userId !== userParamsId , userId, userParamsId)

    if (type === "admin"){
        return
    } 
    
    if (userId !== userParamsId ){
		const error = new HttpError('Unauthorized access denied. User does not match.', 401)
        return error
	}
}
  
exports.errorFormatter = errorFormatter
exports.errorArrayFormater = errorArrayFormater
exports.checkCurrentUser = checkCurrentUser