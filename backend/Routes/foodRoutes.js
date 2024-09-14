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

const headers = {
  'Content-Type': 'application/json',
  'api-key': dataApiKey,
};

// Utility function to query the MongoDB Data API
async function apiPostRequest(action, body) {
  const response = await axios.post(`${dataApiUrl}/${action}`, body, { headers });
  return response.data;
}
router.post('/getfoodData', async (req, res) => {
    try {
      res.send([global.foodData, global.foodCategory, global.sliderdata]);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });
  
  // Create or update order data
  router.post('/orderData', async (req, res) => {
    const { order_data, order_date, email } = req.body;
    try {
      const existingOrder = await apiPostRequest('findOne', {
        dataSource: "Cluster0",
        database: "test",
        collection: "Orders",
        filter: { email }
      });
  
      // Insert a new order
      if (!existingOrder.document) {
        await apiPostRequest('insertOne', {
          dataSource: "Cluster0",
          database: "test",
          collection: "Orders",
          document: {
            email,
            order_data: [{ Order_date: order_date, ...order_data }]
          }
        });
      } else {
        // Update the existing order
        await apiPostRequest('updateOne', {
          dataSource: "Cluster0",
          database: "test",
          collection: "Orders",
          filter: { email },
          update: {
            $push: { order_data: { Order_date: order_date, ...order_data } }
          }
        });
      }
      res.json({ success: true });
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });
  
  // Fetch order data for a specific user
  router.post('/myOrderData', async (req, res) => {
    try {
      const { email } = req.body;
      const userOrders = await apiPostRequest('findOne', {
        dataSource: "Cluster0",
        database: "test",
        collection: "Orders",
        filter: { email }
      });
  
      if (userOrders.document) {
        res.json({ orderData: userOrders.document.order_data });
      } else {
        res.status(404).json({ error: "No orders found" });
      }
  
    } catch (error) {
      res.status(500).send("Server Error");
    }
  });
  module.exports = router;  