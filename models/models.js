const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
	header: {
		type: String,
		require: true
	},
	imgSrc: {
		type: String,
		require: true
	},
	desc: {
		type: String,
		default: ''
	}
})

module.exports = mongoose.model('product', projectSchema)