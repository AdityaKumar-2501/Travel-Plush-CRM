const currentDateTime = require("../functions/currentDateTime");
const Lead = require("../models/lead");
const xlsx = require("xlsx");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {User} = require("../models/user");

const testRouter = (req, res) => {
	try {
		return res.status(200).send("lead routes is working!");
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).send(`Internal server error ${error.message}`);
	}
};

const filterLead = async (req, res) => {
	const body = req.body;
	const page = req.query.page - 1 || 0; // subtracted 1 so that first 3 will not skip
	const pageSize = 10;
	const skip = page * pageSize;

	if (page < 0) return res.status(400).send("Invalid page number");

	// this query is to find the lead by checking the partial information (using regex) of any field that is given in body while calling the API
	// and fecth results from database
	const query = {};
	for (let key in body) {
		if (body[key]) {
			query[key] = { $regex: body[key], $options: "i" }; // 'i' for case-insensitive
		}
	}

	try {
		const { name , _id, profile } = req.foundUser;
		let filteredLeads;

		if(profile === "superAdmin"){
			filteredLeads = await Lead.aggregate([
				{
					$lookup:{
						from: 'users',
						localField : 'assignTo',
						foreignField : '_id',
						as: 'userData'
					}
				},
				{ $match: query },
				{ $sort: { _id: -1 } },
				{ $skip: skip },
				{ $limit: pageSize }
			]);
		}
		else if (profile === "salesExecutive"){
			filteredLeads = await Lead.aggregate([
				{ $match: 
					{
						assignTo : new mongoose.Types.ObjectId(_id),
						query
					} 
				},
				{ $sort: { _id: -1 } },
				{ $skip: skip },
				{ $limit: pageSize }
			]);
		}
		else{
			return res.status(403).send('Unauthorized.');
		}

		if (!filteredLeads.length) return res.status(404).send("No Lead found");
		return res.status(200).send(filteredLeads);
	} catch (error) {
		return res.status(500).send(`Internal server error ${error.message}`);
	}
};

async function getAllLeads(req, res) {
	const page = req.query.page - 1 || 0; // subtracted 1 so that first 3 will not skip
	const pageSize = 10;
	const skip = page * pageSize;

	if (page < 0) return res.status(400).send("Invalid page number");

	try {
		const { _id, profile } = req.foundUser;

		let allLeads;

		if(profile === "superAdmin"){
			allLeads = await Lead.aggregate([
				{
					$lookup:{
						from: 'users',
						localField : 'assignTo',
						foreignField : '_id',
						as: 'userData'
					}
				}
			]).sort({_id : -1}).skip(skip).limit(pageSize);
		}
		else if (profile === "salesExecutive"){
			allLeads = await Lead.find({
				assignTo : _id
			}).sort({_id : -1}).skip(skip).limit(pageSize);
		}
		else{
			return res.status(403).send('Unauthorized.');
		}


		const totalLeads = (allLeads.length);
		const totalPages = Math.ceil(totalLeads / pageSize);

		return res.status(200).json({
			message: "Pagination search successfully!",
			data: allLeads,
			totalLeads,
			currentPage: page+1,
			totalPages
		});
	} catch (error) {
		console.log("error:", error);
		return res.status(500).send("Internal server error " + error.message);
	}
}

async function createLead(req, res) {
	try {
		const body = req.body;
		const name = body.fname + " " + body.lname;
		body.name = name;
		// Check if a lead with the same email already exists
		const existingLead = await Lead.findOne({ email: body.email });
		if (existingLead) {
			return res.status(400).send("Lead with this email already exists.");
		}

		const newLead = await Lead.create(body);
		return res.status(200).send("Lead created successfully");
	} catch (error) {
		console.log("error:", error);
		return res.status(500).send(`Internal Server Error: ${error.message}`);
	}
}

async function updateLead(req, res) {
	let { email, ...updateData } = req.body;

	if (!email) {
		return res.status(400).send("Please enter an email address");
	}
	// check if lead already exists or not
	if (email) {
		const existingLead = await Lead.find({ email: email });
		if (!existingLead.length) return res.status(404).send("Lead not found");
	}

	// if the user wants to updates his/her emailID then it must pass the new emailID in newemail field and if newemail is not
	// present in db then updates the emailID of the user.
	if (updateData.newemail) {
		const existingLead = await Lead.findOne({ email: updateData.newemail });

		if (existingLead) {
			return res.status(400).send("Email already exists");
		}
		updateData.email = updateData.newemail;
	}

	try {
		const updatedLead = await Lead.findOneAndUpdate({ email }, updateData, {
			new: true,
		});

		if (!updatedLead) {
			return res.status(400).send("Lead not updated");
		}

		return res.status(200).send("Data updated successfully");
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).send(`Internal server error: ${error.message}`);
	}
}

async function deleteLead(req, res) {
	const email = req.body.email;
	try {
		const foundLead = await Lead.findOne({ email });
		if (!foundLead) return res.status(400).send("Lead not found!");
		const deletedLead = await Lead.findByIdAndDelete(foundLead.id);
		if (!deletedLead) {
			return res.status(400).send("Lead not deleted!");
		}
		return res.status(200).send("Lead deleted successfully");
	} catch (error) {
		return res.status(500).send(`Internal Server Error: ${error.message}`);
	}
}

async function golbalSearch(req, res) {
	const searchItem = req.query.search;
	const page = req.query.page - 1 || 0; // subtracted 1 so that first 3 will not skip
	const pageSize = 10;
	const skip = page * pageSize;

	if (page < 0) return res.status(400).send("Invalid page number");

	if (!searchItem) {
		return res.status(400).send("Missing search parameter");
	}

	try {
		// Get the schema paths
		const schemaPaths = Object.keys(Lead.schema.paths);

		const stringFields = schemaPaths.filter((field) => {
			return Lead.schema.paths[field].instance === "String";
		});

		// Build the $or query for string fields only
		const orConditions = stringFields.map((field) => {
			return { [field]: { $regex: searchItem, $options: "i" } }; // 'i' for case-insensitive search
		});


		const { _id, profile } = req.foundUser;
		
		let leads;

		if(profile === "superAdmin"){
			leads = await Lead.aggregate([
				{
					$lookup:{
						from: 'users',
						localField : 'assignTo',
						foreignField : '_id',
						as: 'userData'
					}
				},
				{ $match: { $or: orConditions }},
				{ $sort: { _id: -1 } },
				{ $skip: skip },
				{ $limit: pageSize }

			]);
		}
		else if (profile === "salesExecutive"){
			leads = await Lead.aggregate([
				{ $match: { assignTo : new mongoose.Types.ObjectId(_id), $or: orConditions }},
				{ $sort: { _id: -1 } },
				{ $skip: skip },
				{ $limit: pageSize }

			]);
		}
		else{
			return res.status(403).send('Unauthorized.');
		}


		const totalLeads = leads.length;
		const totalPages = Math.ceil(totalLeads / pageSize);

		if (!leads.length) return res.status(404).send("No Lead found");
		return res.status(200).json({
			message: "Pagination search successfully!",
			data: leads,
			totalLeads,
			currentPage: page+1,
			totalPages
		});

	} catch (error) {
		console.error(error);
		return res.status(500).send(`Internal Server Error: ${error.message}`);
	}
}

async function assignLead(req, res) {
	const { assignTo, leadIds } = req.body;
	try {
		// for finding the any user exist to assignTo
		const existingUser = await User.findOne({
			_id : assignTo
		});
		if(!existingUser) {
			return res.status(400).send(`Assigned User is not Exist`);
		}


		// Update all the leads with the provided leadIds
		const result = await Lead.updateMany(
			{ _id: { $in: leadIds } },
			{ $set: { assignTo, assignAt: Date.now() } }
		);
	
		if (result) {
			return res.status(200).json({
				message: `${result.modifiedCount } leads updated successfully`,
				assignTo: existingUser.name,
				result: result
			});
		} else {
			return res.status(404).send('No leads were updated');
		}

	} catch (error) {
		res.status(500).send(`Internal Server Error - ${error.message}`);
	}
}

async function downloadLeads(req, res) {

	// get array of Ids and then find specific entries 
	const body = req.body;

	// saves the leads details excel file in downloads folder
	const downloadsDir = path.join(__dirname, "..", "downloads");
	if (!fs.existsSync(downloadsDir)) {
		fs.mkdirSync(downloadsDir);
	}

	// * This function helps to iterate over the sub fields of leads like flights and hotel details and return new object with details.

	function flattenObject(ob, parent = "", res = {}) {
		for (let key in ob) {
			if (!ob.hasOwnProperty(key)) continue;

			let propName = parent ? parent + "_" + key : key;

			if (
				typeof ob[key] === "object" &&
				ob[key] !== null &&
				!Array.isArray(ob[key])
			) {
				flattenObject(ob[key], propName, res);
			} else if (Array.isArray(ob[key])) {
				ob[key].forEach((item, index) => {
					if (typeof item === "object" && item !== null) {
						flattenObject(item, `${propName}_${index}`, res);
					} else {
						res[`${propName}_${index}`] = item;
					}
				});
			} else {
				res[propName] = ob[key];
			}
		}
		return res;
	}

	try {
		// finding all the entries
		// const leads = await Lead.find({}).lean();

		// finding specific entries
		const leads = await Lead.find({ _id: {$in : body.ids}}).lean();

		const flattenedLeads = leads.map((lead) => flattenObject(lead));

		// the flattenedLeads contains some unwanted fields like _id.buffer so this function helps to iterate over all the
		// flattenedLeads and remove those field and make flattenedLeads contain only the useful fields

		// Remove _id.buffer fields if any are still present
		const cleanedLeads = flattenedLeads.map((lead) => {
			for (let key in lead) {
				if (
					key.startsWith("_id.buffer") ||
					key.includes("_id_buffer") || key.includes("buffer")
				) {
					delete lead[key];
				}
			}
			return lead;
		});

		const worksheet = xlsx.utils.json_to_sheet(cleanedLeads);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, "Leads");

		const filePath = path.join(downloadsDir, "leads.xlsx");
		xlsx.writeFile(workbook, filePath);

		// Send the file to the client
		res.download(filePath, "leads.xlsx", (err) => {
			if (err) {
				console.error(err);
				if (!res.headersSent) {
					res.status(500).send(err.message);
				}
			}
		});
	} catch (error) {
		console.error(error);
		if (!res.headersSent) {
			return res.status(500).send(`Internal Server Error: ${error.message}`);
		}
	}
}

module.exports = {
	testRouter,
	getAllLeads,
	createLead,
	updateLead,
	deleteLead,
	filterLead,
	golbalSearch,
	downloadLeads,
	assignLead,
};
