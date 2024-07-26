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

	// this query is to find the lead by checking the partial information (using regex) of any field that is given in body while calling the API
	// and fecth results from database
	const query = {};
	for (let key in body) {
		if (body[key]) {
			query[key] = { $regex: body[key], $options: "i" }; // 'i' for case-insensitive
		}
	}

	try {
		const lead = await Lead.find(query);
		if (!lead.length) return res.status(404).send("No Lead found");
		return res.status(200).send(lead);
	} catch (error) {
		return res.status(500).send(`Internal server error ${error.message}`);
	}
};

async function getAllLeads(req, res) {
	const page = req.query.page - 1 || 0; // subtracted 1 so that first 3 will not skip
	try {
		const allLeads = await Lead.aggregate([
			{ $skip: page * 10 },
			{ $limit: 10 },
		]);
		return res.status(200).send(allLeads);
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

		// Execute the search query
		const results = await Lead.find({ $or: orConditions });

		if (!results.length) {
			return res.status(404).send("No matching records found.");
		}

		return res.status(200).json(results);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Internal Server Error: ${error.message}`);
	}
}

async function assignLead(req, res) {
	const { assignTo, assignBy, leadId } = req.body;
	try {
		// for finding the any Super Admin exist
		const existingSuperAdmin = await User.findOne({
			_id: assignBy,
			profile: "superAdmin",
		});
		if (!existingSuperAdmin) {
			return res
				.status(400)
				.send(`Assigning User is not the Super Admin`);
		}

		// for finding the any user exist to assignTo
		const existingUser = await User.findOne({
			_id : assignTo
		});
		if(!existingUser) {
			return res.status(400).send(`Assigned User is not Exist`);
		}

		// for finding the any lead exist
		const existingLead = await Lead.findOne({_id: leadId});
		if(!existingLead) {
			return res.status(400).send(`Lead is not Exist`);
		}

		const assigning = await Lead.findOneAndUpdate({_id: leadId, $set: {assignTo, assignBy, assignAt: Date.now() }});

		if(assigning) {
			return res.status(200).json({Super_Admin :existingSuperAdmin.name , User:existingUser.name, lead: existingLead.name });
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
					key.includes("_id_buffer")
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
