async function  Db() {
    const mongoose = require("mongoose");
    const dotenv = require("dotenv");
    dotenv.config();
  
    // const dbConnection = process.env.mongo_url;
    const dbConnection = "mongodb://localhost:27017/travel_plus_crm"
    const Connection =    mongoose.connect(dbConnection);

    // Intializing the counter object

    // const existingCounter = await Counter.findById('leadIndex');
    // if (!existingCounter) {
    //     await Counter.create({ _id: 'leadIndex', sequenceValue: 0 });
    //     console.log('Counter initialized');
    // } else {
    //     console.log('Counter already exists');
    // }

  console.log("MongoDb is connected")
    return { Connection };
  }
  module.exports = Db;
  