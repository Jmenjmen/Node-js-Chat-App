const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true	
	},
	password: {
		type: String,
		required: true	
	},
	roles: [{
		type: String,
		ref: 'Role'
	}]
})

module.exports = mongoose.model('user', userSchema)