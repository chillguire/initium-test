const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const clientSchema = new Schema({
	id: {
		type: String,
		sparse: true,
	},
	name: {
		type: String,
		required: true,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	attended: {
		type: Boolean,
		required: true,
		default: false,
	},
	queue: {
		type: Number,
		required: true,
		enum: [0, 1],
	},
});

module.exports = mongoose.model('Client', clientSchema);