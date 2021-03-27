const jwt = require('jsonwebtoken')
const HttpError = require('../models/error')
const config = require('config')

const auth = (req, res, next) => {
    const token = req.header('x-auth-token')

    if (!token) {
		return next(new HttpError('Unauthorized access denied.', 401))
    }

	try {
		const decoded = jwt.verify(token, config.get("jwtSecret"))

		req.user = decoded.user
		next()
	} catch (error) {
		return next(new HttpError('Token is not valid.', 401))
	}
}

// Checks if user is Admin, if not, invoke unauthorized access
const checkLevel = (req, res, next) => {
	if (req.user.type !== 'admin'){
		return next(new HttpError('Unauthorized access denied. No admin privileges.', 401))
	}
	next()
}

exports.auth = auth
exports.checkLevel = checkLevel
