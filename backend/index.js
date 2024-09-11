const express = require('express');
const cors = require('cors'); // Import cors middleware
const app = express();
const port = 5000;

// Use CORS middleware to allow requests from all origins
app.use(cors({
  origin: '*', // Allows all websites (including localhost) to access the API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: false // Set to false if you do not need to send credentials (cookies or HTTP authentication)
}));

// Middleware for parsing JSON
app.use(express.json());

// Example route
global.foodData = require('./db')(function call(err, data, CatData, slideData) {
  if (err) console.log(err);
  global.foodData = data;
  global.foodCategory = CatData;
  global.sliderdata = slideData;
  console.log("Slider Data Loaded:", slideData);
});

// Test route
app.get('/', (req, res) => {
  res.send('Hello World, CORS is enabled for all websites!');
});

// Auth routes
app.use('/api/auth', require('./Routes/Auth'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
