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
  
exports.errorFormatter = errorFormatter
exports.errorArrayFormater = errorArrayFormater