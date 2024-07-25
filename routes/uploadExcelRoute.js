const express = require("express");
const router = express.Router();
const Lead = require('../models/lead.js')
const xlsx = require('xlsx');
const upload = require("../middlewares/upload.js");
const mongoose = require('mongoose');
const verifyToken = require("../middlewares/authentication");

// Function to convert Excel date to JavaScript date
const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(Date.UTC(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds));
};


// Set up a route for file uploads
router.post("/",verifyToken, upload.single("file"), async (req, res) => {

	try {
		if (!req.file) {
			return res.status(400).send("No file uploaded.");
		}

		const workbook = xlsx.readFile(req.file.path);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Get the current sequence value for 'index'
        const counter = await mongoose.connection.collection('counters').findOneAndUpdate(
            { id: 'index' },
            { $inc: { seq: jsonData.length } },
            { new: true }, // Return the updated document
            { returnDocument: 'before', upsert: true }
        );

        if (!counter) {
            throw new Error("Counter document for 'index' not found.");
        }
        var currentSeq = counter.seq;

        // let currentSeq = (counter.value && counter.value.seq) ? counter.value.seq + 1 : 100;


        const bulkOps = jsonData.map((data) => {
            // Convert Excel date serial to JavaScript date
            const travelStartDate = excelDateToJSDate(data["travelStartDate(YYYY-MM-DD)"]);
            const travelEndDate = excelDateToJSDate(data["travelEndDate(YYYY-MM-DD)"]);


            if (!travelStartDate || isNaN(travelStartDate) || !travelEndDate || isNaN(travelEndDate) ) {
                throw new Error(`Invalid date format for row with name: ${data.name}`);
            }

            return {
                updateOne: {
                    filter: { email: data.email },
                    update: {
                        $set: {
                            name: data.name,
                            email: data.email,
                            mobile: data.mobile,
                            destination: data.destination,
                            totalPerson: data.totalPerson,
                            age: data.age,
                            travelStartDate: travelStartDate,
                            travelEndDate: travelEndDate,
                            hotelPreference: data.hotelPreference,
                            dateFlexibility: data.dateFlexibility,
                            address: data.address,
                            city: data.city,
                            duration: data.duration,
                            budget: data.budget,
                            transport: data.transport,
                            visa: data.visa,
                            // date: leadDate,
                            leadStatus: data.leadStatus,
                            flights: data.flights ? JSON.parse(data.flights) : [],
                            hotels: data.hotels ? JSON.parse(data.hotels) : [],
                            transfers: data.hotels ? JSON.parse(data.transfers) : [],
                            visas : data.visas ? JSON.parse(data.visas) : [],
                            insurances : data.insurance ? JSON.parse(data.insurance) : [],
                            travelPackage : data.travelPackage ? JSON.parse(data.travelPackage) : [],
                            index: ++currentSeq,
                        }
                    },
                    upsert: true
                }
            };
        });

        await mongoose.connection.collection('counters').updateOne(
			{ _id: 'Lead_index' }, // The ID follows the pattern: {model name}_{field name}
			{ $set: { seq: currentSeq } } // Reset the sequence value to currentSeq
		  );


		// we use bulkWrite because it will check each entry in excel and then check if the entry is already present in DB or not
        // if not then insert the entry in db else do nothing.

		const result = await Lead.bulkWrite(bulkOps);

        res.status(201).send({
            message: "Excel file successfully uploaded.",
            insertedCount: result.insertedCount,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount,
            upsertedCount: result.upsertedCount,
            upsertedIds: result.upsertedIds,
            modifiedIds: result.modifiedIds
        });

	} catch (error) {
        console.log(error.message);
		res.status(500).send("Error processing the file." + error.message);
	}
});

module.exports = router;
