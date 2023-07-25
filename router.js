const express = require('express')
const Router = express()
const user = require('./models/userSchema')
const Role = require('./models/role')
const bcrypt = require('bcryptjs')
const { check, cookie } = require('express-validator')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { secret } = require('./config')
const multer = require('multer')
const cookieParser = require('cookie-parser')


const checkMidle = require('./authorisationCheck')

const upload = multer()
Router.use(cookieParser())

const generateAccessToken = (id, role, username) => {
	const payLoad = {
		id,
		role,
		username
	}

	return jwt.sign(payLoad, secret, {expiresIn: '90d'})
} 

Router.post('/register', upload.none(), [
	check('username', 'username must not be empty').notEmpty(),
	check('password', 'password must have min 8 symbols').isLength({min: 8})
], async (request, response) => {
	try {
		const err = validationResult(request)
			if(!err.isEmpty()){
				response.send(err)
			}

			const {username, password} = request.body
			const candidate = await user.findOne({username: username})

			if(candidate) {
				response.status(401).send('User with this username now exists')
			}

			const pass = bcrypt.hashSync(password, 7)
			const userRole = await Role.findOne({ value: "USER" })
			const newUser = new user({username: username, password: pass, role: [userRole.value]})

			await newUser.save()

			const token = generateAccessToken(user._id, user.roles, user.username)

			response.cookie('token', token, {
				httpOnly: true
			})

			response.status(304).redirect('/')

			
	}
	catch(e) {
		console.log(e)
	}
})

Router.post('/login', upload.none(), async (request, response) => {
	try{
		const { username, password } = request.body

	const checkUser = await user.findOne({ username: username })
	if(!checkUser){
		response.status(400).send('user with that name dont exists')
	}

	const pass = bcrypt.compareSync(password, checkUser.password)
	if(!pass){
		response.status(400).send('incorect password')
	}

	token = generateAccessToken(checkUser._id, checkUser.roles, checkUser.username)

	response.cookie('token', token)

	response.status(304).redirect('/')
	}
	catch(e) {
		console.log(e)
	}
})

Router.get('/user', checkMidle, async (request, response) => {
	response.send('You are loged in')
})

module.exports = Router