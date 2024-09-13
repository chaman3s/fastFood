const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetch = require('../middleware/fetchdetails');
const router = express.Router();

// Environment Variables
const jwtSecret = process.env.JWT_SECRET ;
const mongoDataAPIEndpoint = process.env.MONGO_DATA_API_URL 
const mongoDataAPIKey = process.env.MONGO_DATA_API_KEY 
const foodCollection = 'food_items';
const ordersCollection = 'orders';

// Create User
app.post('/createuser', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const securePass = await bcrypt.hash(req.body.password, salt);

        // Store the new user in MongoDB using Data API
        const userPayload = {
            dataSource: 'Cluster0',
            database: dbName,
            collection: 'users',
            document: {
                name: req.body.name,
                password: securePass,
                email: req.body.email,
                location: req.body.location,
            },
        };

        const userResponse = await axios.post(`${mongoDataAPIEndpoint}/insertOne`, userPayload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': mongoDataAPIKey,
            },
        });

        const data = { user: { id: userResponse.data.insertedId } };
        const authToken = jwt.sign(data, jwtSecret);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Login User
app.post('/login', [
    body('email').isEmail(),
    body('password').exists(),
], async (req, res) => {
    const { email, password } = req.body;
    try {
        // Fetch the user from MongoDB using Data API
        const userPayload = {
            dataSource: 'Cluster0',
            database: dbName,
            collection: 'users',
            filter: { email },
        };

        const userResponse = await axios.post(`${mongoDataAPIEndpoint}/findOne`, userPayload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': mongoDataAPIKey,
            },
        });

        const user = userResponse.data.document;
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const data = { user: { id: user._id } };
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success: true, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Get Food Data using MongoDB Data API
app.post('/foodData', async (req, res) => {
    try {
        const foodDataPayload = {
            dataSource: 'Cluster0',
            database: dbName,
            collection: foodCollection,
        };

        const foodDataResponse = await axios.post(`${mongoDataAPIEndpoint}/find`, foodDataPayload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': mongoDataAPIKey,
            },
        });

        res.json(foodDataResponse.data.documents);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Place Order using MongoDB Data API
app.post('/orderData', async (req, res) => {
    const data = req.body.order_data;
    const email = req.body.email;
    await data.unshift({ Order_date: req.body.order_date });

    try {
        // Find if email exists
        const orderFindPayload = {
            dataSource: 'Cluster0',
            database: dbName,
            collection: ordersCollection,
            filter: { email },
        };

        const orderFindResponse = await axios.post(`${mongoDataAPIEndpoint}/findOne`, orderFindPayload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': mongoDataAPIKey,
            },
        });

        if (!orderFindResponse.data.document) {
            // Insert a new order
            const newOrderPayload = {
                dataSource: 'Cluster0',
                database: dbName,
                collection: ordersCollection,
                document: {
                    email,
                    order_data: [data],
                },
            };

            await axios.post(`${mongoDataAPIEndpoint}/insertOne`, newOrderPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': mongoDataAPIKey,
                },
            });

            res.json({ success: true });
        } else {
            // Update existing order
            const updateOrderPayload = {
                dataSource: 'Cluster0',
                database: dbName,
                collection: ordersCollection,
                filter: { email },
                update: {
                    $push: { order_data: data },
                },
            };

            await axios.post(`${mongoDataAPIEndpoint}/updateOne`, updateOrderPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': mongoDataAPIKey,
                },
            });

            res.json({ success: true });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Fetch User Orders using MongoDB Data API
app.post('/myOrderData', async (req, res) => {
    try {
        const email = req.body.email;

        const myOrderPayload = {
            dataSource: 'Cluster0',
            database: dbName,
            collection: ordersCollection,
            filter: { email },
        };

        const orderResponse = await axios.post(`${mongoDataAPIEndpoint}/findOne`, myOrderPayload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': mongoDataAPIKey,
            },
        });

        res.json({ orderData: orderResponse.data.document });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});