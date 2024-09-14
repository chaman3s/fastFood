const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetch = require('../middleware/fetchdetails');
require("dotenv").config();

const router = express.Router();
const jwtSecret = process.env.jwtSecret;

const dataApiUrl = process.env.MONGO_DATA_API_URL;
const dataApiKey = process.env.MONGO_DATA_API_KEY;
const location_API_KEY= process.env.location_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'api-key': dataApiKey,
};

// Utility function to query the MongoDB Data API
async function apiPostRequest(action, body) {
  const response = await axios.post(`${dataApiUrl}/${action}`, body, { headers });
  return response.data;
}

// Create a User
router.post('/createuser', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { email, name, password, location } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(password, salt);

    // Check if the user already exists
    const existingUser = await apiPostRequest('findOne', {
      dataSource: "Cluster0", 
      database: "test", 
      collection: "User", 
      filter: { email }
    });

    if (existingUser.document) {
      return res.status(400).json({ error: "Please enter a unique value." });
    }

    // Create the new user
    await apiPostRequest('insertOne', {
      dataSource: "Cluster0",
      database: "test",
      collection: "User",
      document: {
        name,
        password: securePass,
        email,
        location
      }
    });

    const data = {
      user: {
        id: email, // Use email as the unique identifier
      }
    };
    const authToken = jwt.sign(data, jwtSecret);
    success = true;
    res.json({ success, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Login a User
router.post('/login', [
  body('email', "Enter a Valid Email").isEmail(),
  body('password', "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await apiPostRequest('findOne', {
      dataSource: "Cluster0",
      database: "test",
      collection: "User",
      filter: { email }
    });

    if (!user.document) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }

    const pwdCompare = await bcrypt.compare(password, user.document.password);
    if (!pwdCompare) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }

    const data = {
      user: {
        id: user.document.email
      }
    };
    const authToken = jwt.sign(data, jwtSecret);
    success = true;
    res.json({ success, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Get logged-in User details
router.post('/getuser', fetch, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the user details
    const user = await apiPostRequest('findOne', {
      dataSource: "Cluster0",
      database: "test",
      collection: "User",
      filter: { email: userId }
    });

    if (user.document) {
      const { password, ...userData } = user.document; // Exclude the password
      res.json(userData);
    } else {
      res.status(404).json({ error: "User not found" });
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Get location data from OpenCageData API
router.post('/getlocation', async (req, res) => {
  try {
    const { lat, long } = req.body.latlong;
    const location = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=${location_API_KEY}`);
    const response = location.data.results[0].components;
    const { village, county, state_district, state, postcode } = response;
    const fullLocation = `${village}, ${county}, ${state_district}, ${state}\n${postcode}`;
    res.send({ location: fullLocation });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Fetch food data (using global variables)

module.exports = router;
