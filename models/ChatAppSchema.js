const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ChatApp = new Schema({
	usernameId: {
		type: String,
		required: true
	},
	ownerId: {
		type: String,
		required: true
	},
	ownerMessage: {
		message: [{
			type: String
		}], 
		date: {
			type: [String],
			default: Date.now()
		}
	}
});


module.exports = mongoose.model('chat', ChatApp)