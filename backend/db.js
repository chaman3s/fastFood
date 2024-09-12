const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI; // Use the environment variable

module.exports = function (callback) {
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true ,connectTimeoutMS: 30000, socketTimeoutMS: 45000, }, async (err, result) => {
        if (err) {
            console.log("---" + err);
            callback(err);
        } else {
            console.log("Connected to MongoDB");
            const foodCollection = await mongoose.connection.db.collection("food_items");
            foodCollection.find({}).toArray(async function (err, data) {
                const categoryCollection = await mongoose.connection.db.collection("foodCategory");
                categoryCollection.find({}).toArray(async function (err, Catdata) {
                    const SliderCollection = await mongoose.connection.db.collection("SliderImage");
                    SliderCollection.find({}).toArray(async function (err, slideData) {
                        callback(err, data, Catdata, slideData);
                    });
                });
            });
        }
    });
};
