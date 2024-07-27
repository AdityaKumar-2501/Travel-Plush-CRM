const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
	{
		name: { type: String, required: false },
		mobile: { type: String, required: false },
		travelDate: { type: Date, required: false },
		destination: { type: String, required: false },
		leadStatus: { type: String, required: false },
		subject: { type: String, required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		reminderDate: { type: Date, required: true },
		completed: { type: Boolean, default: false },
		lead : { type: mongoose.Schema.Types.ObjectId, ref : 'Lead' },
	},
	{ timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;