const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetch = require('../middleware/fetchdetails');
const router = express.Router();

const dataApiUrl = process.env.MONGO_DATA_API_URL;
const apiKey = process.env.MONGO_DATA_API_KEY;
const jwtSecret = process.env.jwtSecret;

const headers = {
  'Content-Type': 'application/json',
  'api-key': apiKey
};

// Create a new user
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

  const salt = await bcrypt.genSalt(10);
  let securePass = await bcrypt.hash(req.body.password, salt);

  try {
    const response = await axios.post(`${dataApiUrl}/insertOne`, {
      dataSource: 'Cluster0',
      database: 'your_db',
      collection: 'users',
      document: {
        name: req.body.name,
        password: securePass,
        email: req.body.email,
        location: req.body.location
      }
    }, { headers });

    const data = {
      user: {
        id: response.data.insertedId
      }
    };

    const authToken = jwt.sign(data, jwtSecret);
    success = true;
    res.json({ success, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// User login
router.post('/login', [
  body('email', "Enter a valid email").isEmail(),
  body('password', "Password cannot be blank").exists()
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const response = await axios.post(`${dataApiUrl}/findOne`, {
      dataSource: 'Cluster0',
      database: 'your_db',
      collection: 'users',
      filter: { email }
    }, { headers });

    const user = response.data.document;

    if (!user) {
      return res.status(400).json({ success, error: "Try logging in with correct credentials" });
    }

    const pwdCompare = await bcrypt.compare(password, user.password);
    if (!pwdCompare) {
      return res.status(400).json({ success, error: "Try logging in with correct credentials" });
    }

    const data = {
      user: {
        id: user._id
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

// Fetch user details (Login required)
router.post('/getuser', fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await axios.post(`${dataApiUrl}/findOne`, {
      dataSource: 'Cluster0',
      database: 'your_db',
      collection: 'users',
      filter: { _id: { "$oid": userId } }
    }, { headers });

    const user = response.data.document;
    delete user.password; // Remove password before sending the response
    res.json(user);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Fetch location using lat/long
router.post('/getlocation', async (req, res) => {
  try {
    let lat = req.body.latlong.lat;
    let long = req.body.latlong.long;

    let location = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=YOUR_OPENCAGE_API_KEY`);
    const response = location.data.results[0].components;

    let { village, county, state_district, state, postcode } = response;
    res.send({ location: `${village}, ${county}, ${state_district}, ${state}, ${postcode}` });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
