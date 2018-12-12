const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const UserSchema = new Schema({
	user:{
		type: String,
		required: true
	},
	todos:[
		{
			type: String,
			required: true
		}
	]
})

module.exports = User = mongoose.model('users', UserSchema);