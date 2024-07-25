```javascript
const leadSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    maxlength: 255
  },
  mobile_number: {
    type: String,
    required: true,
    maxlength: 20
  },
  flights: [flightSchema],
  hotels: [hotelSchema],
  landActivities: [landActivitiesSchema],
  visas: [visaSchema],
  insurances: [insuranceSchema],
  travelPackage: [{
    serviceType: String, // E.g., 'flight', 'hotel', 'landActivity', 'visa', 'insurance'
    service: {
      type: Schema.Types.ObjectId,
      refPath: 'travelPackage.serviceType'
    }
  }]
});

const Lead = mongoose.model('Lead', leadSchema);

```


**Example Object**
-

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true });

const Lead = mongoose.model('Lead');

// Example: Creating a new lead with embedded services
const newLead = new Lead({
  name: 'John Doe',
  email: 'john.doe@example.com',
  mobile_number: '123-456-7890',
  flights: [
    {
      airline: 'Delta',
      flightNumber: 'DL123',
      departure: new Date('2024-08-01T10:00:00Z'),
      arrival: new Date('2024-08-01T14:00:00Z')
    }
  ],
  hotels: [
    {
      name: 'Hilton',
      location: 'New York',
      checkIn: new Date('2024-08-01T15:00:00Z'),
      checkOut: new Date('2024-08-10T11:00:00Z')
    }
  ],
  landActivities: [
    {
      activityName: 'City Tour',
      location: 'New York',
      date: new Date('2024-08-05T09:00:00Z')
    }
  ],
  visas: [
    {
      country: 'USA',
      type: 'Tourist',
      issueDate: new Date('2024-07-01T00:00:00Z'),
      expiryDate: new Date('2024-10-01T00:00:00Z')
    }
  ],
  insurances: [
    {
      provider: 'Allianz',
      policyNumber: 'AX123456789',
      coverage: 'Comprehensive',
      startDate: new Date('2024-08-01T00:00:00Z'),
      endDate: new Date('2024-08-10T00:00:00Z')
    }
  ],
  travelPackage: [
    {
      serviceType: 'flights',
      service: newLead.flights[0]._id
    },
    {
      serviceType: 'hotels',
      service: newLead.hotels[0]._id
    },
    {
      serviceType: 'landActivities',
      service: newLead.landActivities[0]._id
    },
    {
      serviceType: 'visas',
      service: newLead.visas[0]._id
    },
    {
      serviceType: 'insurances',
      service: newLead.insurances[0]._id
    }
  ]
});

newLead.save()
  .then(lead => {
    console.log('Lead created:', lead);
  })
  .catch(err => {
    console.error('Error creating lead:', err);
  });

```


## Example of Lead details

```json
{
    "fname": "John",
    "lname" : "Doe",
    "email": "john.doe@example.com",
    "mobile": "123-456-7890",
    "destination": "Paris",
    "totalPerson": 2,
    "age": 30,
    "travelStartDate": "2024-08-01T00:00:00.000Z",
    "travelEndDate": "2024-08-10T00:00:00.000Z",
    "dateFlexibility": true,
    "hotelPreference": "5-star",
    "address": "123 Main St",
    "city": "New York",
    "duration": "10 days",
    "budget": "2000 USD",
    "transport": "Car",
    "visa": "Required",
    "leadStatus": "New",
    "flights": [
        {
            "flightName": "Delta",
            "flightBookingSite": "Expedia",
            "flightDate": "2024-08-01T10:00:00.000Z",
            "flightType": "Economy",
            "status": "Confirmed",
            "pickTime": "2024-08-01T08:00:00.000Z",
            "dropTime": "2024-08-01T12:00:00.000Z",
            "country": "USA",
            "PNRno": "ABC123",
            "totalPeople": 2,
            "returnFlightName": "Delta",
            "returnFlightBookingSite": "Expedia",
            "returnFlightDate": "2024-08-10T18:00:00.000Z",
            "returnFlightType": "Economy",
            "returncountry": "USA",
            "returnStatus": "Confirmed",
            "returnPickTime": "2024-08-10T16:00:00.000Z",
            "returnDropTime": "2024-08-10T20:00:00.000Z",
            "returnPNRno": "XYZ456",
            "returnTotalPeople": 2,
            "purchasePrice": 500,
            "costPrice": 450
        }
    ],
    "hotels": [
        {
            "hotelName": "Hilton",
            "hotelBookingDate": "2024-08-01T15:00:00.000Z",
            "hotelType": "Luxury",
            "checkInDate": "2024-08-01T15:00:00.000Z",
            "checkOutDate": "2024-08-10T11:00:00.000Z",
            "city": "Paris",
            "numberOfPeople": 2,
            "country": "France",
            "roomType": "Suite",
            "purchasePrice": 1500,
            "costPrice": 1400
        }
    ],
    "transfers": [
        {
            "airportName": "JFK",
            "pickTime": "2024-08-01T06:00:00.000Z",
            "hotelName": "Hilton",
            "dropTime": "2024-08-01T08:00:00.000Z",
            "newAirportName": "CDG",
            "newPickTime": "2024-08-10T14:00:00.000Z",
            "newDropTime": "2024-08-10T16:00:00.000Z",
            "newhotelName": "Hilton"
        }
    ],
    "visas": [
        {
            "visaName": "Schengen Visa",
            "passport": "X1234567",
            "id": "123456789"
        }
    ],
    "insurances": [
        {
            "insuranceName": "Allianz",
            "policyNo": "AX123456789"
        }
    ],
    "travelPackage": [
        {
            "serviceType": "flights",
            "serviceDetails": {
                "flightName": "Delta",
                "flightBookingSite": "Expedia",
                "flightDate": "2024-08-01T10:00:00.000Z",
                "flightType": "Economy",
                "status": "Confirmed",
                "pickTime": "2024-08-01T08:00:00.000Z",
                "dropTime": "2024-08-01T12:00:00.000Z",
                "country": "USA",
                "PNRno": "ABC123",
                "totalPeople": 2,
                "returnFlightName": "Delta",
                "returnFlightBookingSite": "Expedia",
                "returnFlightDate": "2024-08-10T18:00:00.000Z",
                "returnFlightType": "Economy",
                "returncountry": "USA",
                "returnStatus": "Confirmed",
                "returnPickTime": "2024-08-10T16:00:00.000Z",
                "returnDropTime": "2024-08-10T20:00:00.000Z",
                "returnPNRno": "XYZ456",
                "returnTotalPeople": 2,
                "purchasePrice": 500,
                "costPrice": 450
            }
        },
        {
            "serviceType": "hotels",
            "serviceDetails": {
                "hotelName": "Hilton",
                "hotelBookingDate": "2024-08-01T15:00:00.000Z",
                "hotelType": "Luxury",
                "checkInDate": "2024-08-01T15:00:00.000Z",
                "checkOutDate": "2024-08-10T11:00:00.000Z",
                "city": "Paris",
                "numberOfPeople": 2,
                "country": "France",
                "roomType": "Suite",
                "purchasePrice": 1500,
                "costPrice": 1400
            }
        },
        {
            "serviceType": "transfers",
            "serviceDetails": {
                "airportName": "JFK",
                "pickTime": "2024-08-01T06:00:00.000Z",
                "hotelName": "Hilton",
                "dropTime": "2024-08-01T08:00:00.000Z",
                "newAirportName": "CDG",
                "newPickTime": "2024-08-10T14:00:00.000Z",
                "newDropTime": "2024-08-10T16:00:00.000Z",
                "newhotelName": "Hilton"
            }
        },
        {
            "serviceType": "visas",
            "serviceDetails": {
                "visaName": "Schengen Visa",
                "passport": "X1234567",
                "id": "123456789"
            }
        },
        {
            "serviceType": "insurances",
            "serviceDetails": {
                "insuranceName": "Allianz",
                "policyNo": "AX123456789"
            }
        }
    ]
}

```


