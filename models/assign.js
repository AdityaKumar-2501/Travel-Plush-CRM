const mongoose = require("mongoose");

const assignSchema = new mongoose.Schema({
    assignTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    assignBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, { timestamps: true });

const Assign = mongoose.model('Assign', assignSchema);

module.exports = Assign;