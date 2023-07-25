
module.exports = (request, response, next) => {
	if(request.method === 'OPTIONS'){
		next()
	}

	try {
		const token = request.cookies.token
		if(!token) {
			console.log('1')
		} else {
			response.redirect('auth/user')
		}
		
		next()
	}
	catch(e) {
		console.log(e)
	}
}