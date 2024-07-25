## Multer
### Multer: A Brief Overview

**Multer** is a middleware for handling `multipart/form-data` in Node.js, which is primarily used for uploading files. It makes it easy to handle file uploads in an Express application by parsing incoming file data and storing it as per the configuration.

### Why Use Multer?

- **Handles File Uploads**: Simplifies the process of handling file uploads in Node.js applications.
- **Customizable Storage**: Allows custom storage destinations and file naming conventions.
- **Supports Multiple Files**: Can handle multiple file uploads at once.
- **Middleware Integration**: Easily integrates with Express middleware for seamless request handling.

### How to Use Multer

**1. Install Multer:**
```bash
npm install multer
```

**2. Basic Example Program:**

**index.js:**
```javascript
const express = require('express');
const multer = require('multer');
const app = express();
const PORT = 8000;

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

// Create the multer instance
const upload = multer({ storage: storage });

// Set up a route for file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  // Handle the uploaded file
  res.json({ message: 'File uploaded successfully!' });
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
```

**upload.js (Optional for separation of concerns):**
```javascript
const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;
```

**3. Creating the Upload Directory:**
Make sure you have a directory named `uploads` in your project root.

### Example Usage in Postman

- **URL**: `http://localhost:8000/upload`
- **Method**: `POST`
- **Body**: Select `form-data`
  - Key: `file` (set type to `File`)
  - Value: Choose a file to upload

### Summary

Multer is a powerful and flexible middleware for handling file uploads in Node.js applications, offering customizable storage options and easy integration with Express. By setting up a Multer instance and defining storage configurations, developers can efficiently manage file uploads.

## Firebase

### To upload files then use this url:
[https://firebasestorage.googleapis.com/v0/b/ocpl-4aca6.appspot.com/o?name=leads]()

pass the header `content-type: multipart/form-data`

### To get files name from the firebase database then use this url:
[https://firebasestorage.googleapis.com/v0/b/ocpl-4aca6.appspot.com/o?name=mytextfile]

### IMPORTANT NOTE:

If you want to perform the entire file upload process directly from Postman without writing any server-side code, you can only simulate the folder structure by including the folder path in the file name. Firebase Storage does not have an explicit folder creation method; folders are represented by prefixes in file paths.

Here's how you can upload a file to a specific "folder" in Firebase Storage using Postman:

### 1. Set Up Firebase Storage

Ensure you have Firebase Storage set up and accessible. Make sure you have the Firebase Storage URL and necessary access credentials (like API keys).

### 2. Obtain Firebase Storage Upload URL

To upload files directly to Firebase Storage, you'll need to use the Firebase Storage REST API. Here’s how you can do it:

1. **Get Firebase Storage Upload URL:**
   - The URL for uploading files typically looks like this:
     ```
     https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET_NAME/o
     ```
   - Replace `YOUR_BUCKET_NAME` with the name of your Firebase Storage bucket.

### 3. Set Up Postman for File Upload

1. **Create a POST Request in Postman:**
   - **URL:** Use the Firebase Storage Upload URL you obtained above.
   - **Method:** POST

2. **Add Query Parameters:**
   - Add a query parameter `name` with a value of the file path (including the folder name) and file name.
     - Example: `name=folderName/yourfile.txt`
     - This simulates folder creation by including `folderName` in the file path.

3. **Configure the Request Body:**
   - Switch to the `Body` tab.
   - Select `form-data`.
   - Add a key named `file` and set its type to `File`.
   - Choose the file you want to upload.

4. **Send the Request:**
   - Click "Send" to upload the file.

### Example Postman Request

1. **URL:** `https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET_NAME/o`
2. **Method:** POST

3. **Query Parameter:**
   - `name`: `folderName/yourfile.txt`

4. **Body:**
   - Select `form-data`.
   - Key: `file` (type: `File`)
   - Choose the file you want to upload.

### Important Notes

- Ensure that the Firebase Storage rules allow write access to your bucket. You may need to adjust your rules for testing:
  ```json
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if true; // Adjust this for production use
      }
    }
  }
  ```

- Make sure that your Firebase project and Storage bucket are correctly configured to accept file uploads.

This approach effectively simulates folder creation by including the folder name in the file path. Let me know if you need further assistance or run into any issues!

## Moment.js

**Moment.js**

**Overview:**
Moment.js is a popular JavaScript library used for parsing, manipulating, and formatting dates and times. It simplifies working with dates by providing an intuitive API and handling various date and time operations, including calculations and formatting.

**Why Use It:**
- **Ease of Use:** Simplifies date manipulation and formatting with a straightforward API.
- **Consistency:** Provides consistent behavior across different browsers and time zones.
- **Rich Features:** Supports a wide range of date formats, time zones, and localization options.

**How to Use:**

1. **Installation:**
   You can install Moment.js via npm:
   ```bash
   npm install moment
   ```

2. **Basic Usage Example:**

   ```javascript
   // Import Moment.js
   const moment = require('moment');
   
   // Get the current date and time
   const now = moment();
   console.log('Current Date and Time:', now.format('YYYY-MM-DD HH:mm:ss'));

   // Create a specific date
   const specificDate = moment('2024-07-20');
   console.log('Specific Date:', specificDate.format('MMMM D, YYYY'));

   // Add days to a date
   const futureDate = now.add(5, 'days');
   console.log('Date After 5 Days:', futureDate.format('YYYY-MM-DD'));

   // Subtract days from a date
   const pastDate = now.subtract(10, 'days');
   console.log('Date 10 Days Ago:', pastDate.format('YYYY-MM-DD'));

   // Calculate difference between two dates
   const diff = moment().diff(moment('2024-07-01'), 'days');
   console.log('Days Since July 1, 2024:', diff);
   ```

**Note:** As of September 2020, Moment.js is considered a legacy project, and its maintainers recommend considering alternatives like **Day.js** or **Luxon** for new projects due to their smaller size and modern features.

## Mongoose Aggregation Pipelines

Certainly! Let's break down the aggregation pipeline and how it works, particularly focusing on the `$group` stage you asked about.

### Aggregation Pipeline Overview

In MongoDB, an aggregation pipeline is a framework for data aggregation, modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.

### Breakdown of the Aggregation Pipeline

Here's the updated function and the aggregation pipeline used:

```javascript
const moment = require('moment');
const Lead = require('./models/Lead'); // Adjust the path according to your project structure

async function todaysLeads(req, res) {
	try {
		const now = moment();
		const startOfDay = now.clone().startOf('day');
		const endOfDay = now.clone().endOf('day');

		const results = await Lead.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfDay.toDate(),
						$lt: endOfDay.toDate()
					}
				}
			},
			{
				$group: {
					_id: null,
					names: { $push: "$name" },
					totalCount: { $sum: 1 }
				}
			}
		]);

		if (results.length > 0) {
			const { names, totalCount } = results[0];
			res.status(200).send({ names, totalCount });
		} else {
			res.status(200).send({ names: [], totalCount: 0 });
		}
	} catch (error) {
		return res.status(500).send("Error: " + error.message);
	}
}

module.exports = { todaysLeads };
```

### Stages Explained

1. **$match Stage:**

    ```javascript
    {
        $match: {
            createdAt: {
                $gte: startOfDay.toDate(),
                $lt: endOfDay.toDate()
            }
        }
    }
    ```

    - This stage filters documents based on the `createdAt` field. It matches all documents where `createdAt` is greater than or equal to the start of the day and less than the end of the day.
    - `startOfDay.toDate()` and `endOfDay.toDate()` convert moment objects to JavaScript `Date` objects, which are used for comparison.

2. **$group Stage:**

    ```javascript
    {
        $group: {
            _id: null,
            names: { $push: "$name" },
            totalCount: { $sum: 1 }
        }
    }
    ```

    - This stage groups the filtered documents. The `_id` field is set to `null`, meaning all documents will be grouped into a single group.
    - The `names` field is created and populated using `$push: "$name"`. The `$push` operator adds the `name` field of each document to an array.
    - The `totalCount` field is created and populated using `$sum: 1`. The `$sum` operator increments by 1 for each document, giving the total count of documents in the group.

### How the `names` Variable is Made

- The `$push` operator takes the value of the `name` field from each document and adds it to an array called `names`.
- If you have three documents with names "Alice", "Bob", and "Charlie", after the `$group` stage, `names` would be `["Alice", "Bob", "Charlie"]`.

### How the `totalCount` Variable is Made

- The `$sum` operator sums up the values it processes. Since we use `$sum: 1`, it increments the count by 1 for each document.
- If you have three documents, `totalCount` would be `3`.

### Result Handling

- The results from the aggregation pipeline are stored in the `results` variable. Since we're grouping all documents into a single group, `results` will be an array with a single object.
- We extract `names` and `totalCount` from this object and send them in the response.

### Full Example

Suppose the `Lead` collection has the following documents created today:

```json
[
    { "name": "Alice", "createdAt": "2024-07-22T08:00:00Z" },
    { "name": "Bob", "createdAt": "2024-07-22T10:00:00Z" },
    { "name": "Charlie", "createdAt": "2024-07-22T12:00:00Z" }
]
```

The aggregation pipeline would process these documents as follows:

1. **$match Stage:**

    Filters the documents to only those created today.

2. **$group Stage:**

    - `_id: null` means all documents are grouped into one group.
    - `names: { $push: "$name" }` results in `["Alice", "Bob", "Charlie"]`.
    - `totalCount: { $sum: 1 }` results in `3`.

The final result sent to the client would be:

```json
{
    "names": ["Alice", "Bob", "Charlie"],
    "totalCount": 3
}
```

We can also rename the output group and the required fields and eliminate other fields that are not required

``` javascript
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
```

## Creating a Global Search in Mongoose: A Step-by-Step Guide

#### Objective
To implement a global search functionality that queries all string fields in a Mongoose schema for a given search value.

#### Steps

1. **Extract the Search Value:**
   - **Purpose:** Retrieve the search value from the request body.
   - **Code:**
     ```javascript
     const searchValue = req.body.searchValue;
     ```
   - **Explanation:** This value is used to search across all fields in the schema.

   - **or you can extract from seach query:**
   - **Code**
        ```javascript
        const searchItem = req.query.search;
        if (!searchItem) {
            return res.status(400).send("Missing search parameter");
        }
        ```

2. **Validate Search Value:**
   - **Purpose:** Ensure that a search value is provided.
   - **Code:**
     ```javascript
     if (!searchValue) {
         return res.status(400).send('Search value is required.');
     }
     ```
   - **Explanation:** If no search value is provided, return an error response indicating that the search value is required.

3. **Get Schema Fields:**
   - **Purpose:** Identify all fields in the Mongoose schema.
   - **Code:**
     ```javascript
     const schemaPaths = Object.keys(User.schema.paths);
     ```
   - **Explanation:** Retrieve the keys of the schema paths to get all the fields defined in the schema.

4. **Filter String Fields:**
   - **Purpose:** Select only the fields of type `String` for regex searching.
   - **Code:**
     ```javascript
     const stringFields = schemaPaths.filter((field) => {
         return User.schema.paths[field].instance === 'String';
     });
     ```
   - **Explanation:** Use `User.schema.paths[field].instance` to check the type of each field and filter out non-string fields.

5. **Build Query Conditions:**
   - **Purpose:** Create search conditions using regex for each string field.
   - **Code:**
     ```javascript
     const orConditions = stringFields.map((field) => {
         return { [field]: { $regex: searchValue, $options: 'i' } };
     });
     ```
   - **Explanation:** Generate an array of conditions where each condition applies the `$regex` operator to the search value, making the search case-insensitive (`$options: 'i'`).

6. **Execute the Search Query:**
   - **Purpose:** Perform the search in the database using the conditions built.
   - **Code:**
     ```javascript
     const results = await User.find({ $or: orConditions });
     ```
   - **Explanation:** Use `User.find` with the `$or` operator to search across all string fields.

7. **Handle Results:**
   - **Purpose:** Respond to the client based on the search results.
   - **Code:**
     ```javascript
     if (!results.length) {
         return res.status(404).send('No matching records found.');
     } else {
         return res.status(200).json(results);
     }
     ```
   - **Explanation:** If no records are found, return a `404` status. Otherwise, return the search results with a `200` status.

8. **Error Handling:**
   - **Purpose:** Manage any errors that occur during the search process.
   - **Code:**
     ```javascript
     } catch (error) {
         console.error('Error:', error);
         return res.status(500).send(`Internal server error: ${error.message}`);
     }
     ```
   - **Explanation:** Catch any errors, log them, and return a `500` status with the error message.

### Summary

1. **Extract the search value** from the request body.
2. **Validate** that the search value is provided.
3. **Get schema fields** and **filter** to include only string fields.
4. **Build query conditions** using `$regex` for each string field.
5. **Execute the query** using Mongoose’s `find` method with `$or`.
6. **Handle the results** and return appropriate responses.
7. **Catch and handle errors** to ensure a smooth user experience.

This approach ensures that your global search is dynamic, adaptable, and searches across all relevant fields in your schema efficiently.


## Mongoose Auto Increment field

To give a schema an auto-generated serial number in MongoDB using Mongoose and Node.js, you can utilize the mongoose-sequence package. Here's how you can do it: Install the package.
```Code
npm install mongoose-sequence
```
Update your schema.

```JavaScript
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number
});

productSchema.plugin(AutoIncrement, {inc_field: 'serialNumber'});

const Product = mongoose.model('Product', productSchema);
```
Use the schema.
```JavaScript
   const newProduct = new Product({
     name: 'Example Product',
     price: 10
   });

   newProduct.save((err, product) => {
     if (err) {
       console.error(err);
     } else {
       console.log('Product saved with serial number:', product.serialNumber);
     }
   });
```
**Explanation:**
-
**mongoose-sequence:**

This package provides a plugin that adds auto-incrementing fields to your Mongoose schemas.

**plugin:**

The plugin method is used to attach the AutoIncrement plugin to your schema.

**inc_field:**

This option specifies the name of the field that will store the auto-incrementing serial number.

**save:**

When you save a new document using the schema, the serialNumber field will be automatically generated and incremented.

**Alternative Methods:**
-
**Counter Collection:**
You can create a separate collection in MongoDB to store the current serial number value. Then, before saving a new document, you can retrieve and increment the value from the counter collection.

**Aggregation Framework:**

You can use the MongoDB aggregation framework to find the maximum existing serial number and increment it.

**Important Considerations:**

**Concurrency:**
If you have multiple applications or processes writing to the database simultaneously, you need to ensure that the serial numbers are generated correctly without conflicts. You might need to use transactions or other synchronization mechanisms.

**Performance:**
Using a counter collection or aggregation framework can add some overhead to the saving process. If performance is a concern, you might want to consider alternative strategies.


**For Changing the counter sequence to 1**
-
```javascript
db.counters.updateOne( { id: 'index' }, { $set: { seq: 0 } } );
```