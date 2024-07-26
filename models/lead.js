const mongoose = require("mongoose");

// use to create a auto incrementing feild in Leads schema
const autoInc = require("mongoose-sequence")(mongoose);

// Flight Schema - have both going to trip and return flight details
const flightSchema = new mongoose.Schema({
	flightName: { type: String, required: true },
	flightBookingSite: { type: String, required: true },
	flightDate: { type: Date, required: true },
	flightType: { type: String, required: true },
	status: { type: String, required: true },
	pickTime: { type: Date, required: false },
	dropTime: { type: Date, required: false },
	country: { type: String, required: true },
	PNRno: { type: String, required: true },
	totalPeople: { type: Number, required: true },

	returnFlightName: { type: String },
	returnFlightBookingSite: { type: String },
	returnFlightDate: { type: Date },
	returnFlightType: { type: String },
	returncountry: { type: String},
	returnStatus: { type: String },
	returnFlightDate: { type: Date, required: false },
	returnPickTime: { type: Date, required: false },
	returnDropTime: { type: Date, required: false },
	returnPNRno: { type: String, required: false },
	returnTotalPeople: { type: Number, required: false },
	purchasePrice: { type: Number, required: true },
	costPrice: { type: Number, required: true },
});

// Hotel Schema
const hotelSchema = new mongoose.Schema({
	hotelName: { type: String, required: true },
	hotelBookingDate: { type: Date, required: true },
	hotelType : { type: String, required: true },
	checkInDate: { type: Date, required: true },
	checkOutDate: { type: Date, required: true },
	city: { type: String, required: true },
	numberOfPeople: { type: Number, required: true },
	country: { type: String, required: true },
	roomType: { type: String, required: true },
	purchasePrice: { type: Number, required: true },
	costPrice: { type: Number, required: true },
});

// Transfer Schema
const transferSchema = new mongoose.Schema({
	airportName: { type: String, required: true},
	pickTime: { type: String, required: true},
	hotelName: { type: String, required: true},
	dropTime: { type: String, required: true},

	newAirportName: { type: String, required: true},
	newPickTime: { type: String, required: true},
	newDropTime: { type: String, required: true},
	newhotelName: { type: String, required: true},
});

// visa schema
const visaSchema = new mongoose.Schema({
	visaName : { type: String, required: true},
	passport: { type: String, required: true},
	id : { type: String, required: true},
});



// Insurance Schema
const insuranceSchema = new mongoose.Schema({
	insuranceName: { type: String, required: true},
	policyNo : { type: String, required: true},
})

const leadSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: false, unique: true },
		mobile: { type: String, required: false },
		destination: { type: String, required: true },
		totalPerson: { type: Number, required: true },
		age: { type: Number, required: true },
		travelStartDate: { type: Date, required: true },
		travelEndDate: { type: Date, required: true },
		dateFlexibility: { type: Boolean, required: true },
		hotelPreference: { type: String, required: true },
		address: { type: String, required: true },
		city: { type: String, required: true },
		duration: { type: String, required: true },
		budget: { type: String, required: true },
		transport: { type: String, required: false },
		visa: { type: String, required: false },
		leadStatus: { type: String, required: false },
		assignTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		assignBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		assignAt: { type: Date, required: false },
		flights: [flightSchema],
		hotels: [hotelSchema],
		transfers: [transferSchema],
		visas: [visaSchema],
		insurances :  [insuranceSchema],
		travelPackage: [{
			serviceType: String,
			serviceDetails: mongoose.Schema.Types.Mixed
		}]
	},
	{ timestamps: true }
);

leadSchema.plugin(autoInc, { inc_field: "index" });

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
