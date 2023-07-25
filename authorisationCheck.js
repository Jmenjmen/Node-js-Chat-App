const jwt = require('jsonwebtoken')
const { secret } = require('./config')


module.exports = function (request, response, next) {
	if(request.method === 'OPTIONS'){
		next()
	}

	try {
		const token = request.cookies.token
		if(!token) {
			response.send('no!!!')
		}

		const deData = jwt.verify(token, secret)
		request.user = deData
		next()
	}
	catch(e) {
		console.log(e)
		request.cookies.token = null
		response.redirect('/')
	}
}