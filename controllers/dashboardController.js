const Lead = require("../models/lead.js");
const {User} = require("../models/user.js");
const moment = require("moment");

function test(req, res) {
	res.status(200).send("Everything is good!");
}

async function getAllLeads(req, res) {
	try {
		const allLeads = await Lead.aggregate([
			{
				$group: {
					_id: null,
					names: { $push: "$name" },
					totalLeads: { $sum: 1 },
				},
			},
		]);
		if (!allLeads.length) return res.status(404).send("No Lead found!");

		const { names, totalLeads } = allLeads[0];
		return res.status(200).json({ names, totalLeads });
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}

async function todaysLeads(req, res) {
	try {
		const now = moment();
		const startOfDay = now.clone().startOf("day");
		const endOfDay = now.clone().endOf("day");

		const results = await Lead.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfDay.toDate(),
						$lt: endOfDay.toDate(),
					},
				},
			},
			{
				$group: {
					_id: null, // _id: null means it group all entry into one group.
					totalCount: { $sum: 1 },
				},
			},
		]);

		if (results.length > 0) {
			const { totalCount } = results[0];
			res.status(200).send({ totalCount });
		} else {
			res.status(200).send({ totalCount: 0 });
		}
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}

async function weeklyLeads(req, res) {
	try {
		const now = moment();
		const startOfWeek = now.clone().startOf("week");
		const endOfWeek = now.clone().endOf("week");

		const results = await Lead.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfWeek.toDate(),
						$lt: endOfWeek.toDate(),
					},
				},
			},
			{
				$group: {
					_id: null,
					totalCount: { $sum: 1 },
				},
			},
		]);

		if (results.length > 0) {
			const { totalCount } = results[0];
			res.status(200).send({ totalCount });
		} else {
			res.status(200).send({ totalCount: 0 });
		}
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}

async function monthlyLeads(req, res) {
	try {
		const now = moment();
		const startOfMonth = now.clone().startOf("month");
		const endOfMonth = now.clone().endOf("month");

		const results = await Lead.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfMonth.toDate(),
						$lt: endOfMonth.toDate(),
					},
				},
			},
			{
				$group: {
					_id: null,
					totalCount: { $sum: 1 },
				},
			},
		]);

		if (results.length > 0) {
			const { totalCount } = results[0];
			res.status(200).send({ totalCount });
		} else {
			res.status(200).send({ totalCount: 0 });
		}
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}

async function everyMonthLeads(req, res) {
	try {
		const results = await Lead.aggregate([
			{
				$group: {
					_id: { $month: "$createdAt" },
					numberofLeads: { $sum: 1 },
				},
			},
		]);
		console.log(results);

		if (results.length > 0) {
			const { _id, numberofLeads } = results[0];
			res.status(200).send({
				_id: moment(_id, "M").format("MMM") || _id,
				numberofLeads,
			});
		} else {
			res.status(200).send({ _id: _id || 0, numberofLeads: 0 });
		}
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}

async function userProfile(req, res) {
	try {
		const users = await User.aggregate([
			{
				$group:{
					_id: '$profile',
					names: {$push: '$name'},
					totalUsers : {$sum: 1}
				}
			},
			{  // 1 means include the field form previous pipeline results and 0 means exclude the field
				// creating a new formatted object that will contain the field results that are required and fields can be renamed.
				$project: {
					profile: '$_id', // Rename _id to profile
					names: 1, // Include names in the output
					totalUsers: 1, // Include totalUsers in the output
					_id: 0 // Exclude the original _id field
				}
			}
		]);
		console.log(users);
		if (!users.length) return res.status(404).send("No users found!");
		else{
			// const [names, profile, totalUsers] = users
			return res.status(200).send(users);
		}
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}
module.exports = {
	test,
	getAllLeads,
	todaysLeads,
	weeklyLeads,
	monthlyLeads,
	everyMonthLeads,
	userProfile,
};
