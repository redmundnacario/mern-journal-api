const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };

const demoLogger = (req, res, next) => {
    let current_datetime = new Date();
    let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
    let method = req.method;
    let url = req.url;
    let status = res.statusCode;
    const start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
    
    console.log(log);

    next()
}


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


exports.demoLogger = demoLogger
exports.errorFormatter = errorFormatter
exports.errorArrayFormater = errorArrayFormater