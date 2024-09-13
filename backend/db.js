// const mongoose = require('mongoose');
// require('dotenv').config();
// const mongoURI = process.env.MONGO_URI; // Use the environment variable

// module.exports = function (callback) {
//     mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true ,connectTimeoutMS: 30000, socketTimeoutMS: 45000, }, async (err, result) => {
//         if (err) {
//             console.log("---" + err);
//             callback(err);
//         } else {
//             console.log("Connected to MongoDB");
//             const foodCollection = await mongoose.connection.db.collection("food_items");
//             foodCollection.find({}).toArray(async function (err, data) {
//                 const categoryCollection = await mongoose.connection.db.collection("foodCategory");
//                 categoryCollection.find({}).toArray(async function (err, Catdata) {
//                     const SliderCollection = await mongoose.connection.db.collection("SliderImage");
//                     SliderCollection.find({}).toArray(async function (err, slideData) {
//                         callback(err, data, Catdata, slideData);
//                     });
//                 });
//             });
//         }
//     });
// };
const axios = require('axios');
require('dotenv').config();

const dataApiUrl = process.env.MONGO_DATA_API_URL;
const dataApiKey = process.env.MONGO_DATA_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'api-key': dataApiKey,
};

module.exports = async function(callback) {
  try {
    // Fetching food_items data
    const foodItemsResponse = await axios.post(
      `${dataApiUrl}/find`,
      {
        dataSource: "Cluster0", // Your cluster name
        database: "test", // Your database name
        collection: "food_items",
        filter: {}
      },
      { headers }
    );
    const foodItems = foodItemsResponse.data.documents;

    // Fetching foodCategory data
    const categoryResponse = await axios.post(
      `${dataApiUrl}/find`,
      {
        dataSource: "Cluster0", // Your cluster name
        database: "test", // Your database name
        collection: "foodCategory",
        filter: {}
      },
      { headers }
    );
    const foodCategories = categoryResponse.data.documents;

    // Fetching SliderImage data
    const sliderImageResponse = await axios.post(
      `${dataApiUrl}/find`,
      {
        dataSource: "Cluster0", // Your cluster name
        database: "test", // Your database name
        collection: "SliderImage",
        filter: {}
      },
      { headers }
    );
    const sliderImages = sliderImageResponse.data.documents;

    // Pass all data to callback
    callback(null, foodItems, foodCategories, sliderImages);

  } catch (err) {
    console.error('Error fetching data:', err);
    callback(err);
  }
};
