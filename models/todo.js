const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
	{
		// name: { type: String, required: true },
		// mobile: { type: String, required: true },
		subject: { type: String, required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		// destination: { type: String, required: true },
		reminderDate: { type: Date, required: true },
		// leadStatus: { type: String, required: false },
		completed: { type: Boolean, default: false },
		// travelDate: { type: Date, required: false },
		lead : { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
	},
	{ timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;