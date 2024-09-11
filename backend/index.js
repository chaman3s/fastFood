global.foodData = require('./db')(function call(err, data, CatData, slideData) {
  if (err) console.log(err);
  global.foodData = data;
  global.foodCategory = CatData;
  global.sliderdata = slideData;
  console.log("Slider Data Loaded:", slideData);
});

const express = require('express');
const cors = require('cors'); // Import cors
const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'] // Allow specific headers
}));

// Middleware for parsing JSON requests
app.use(express.json());

// Simple route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Route for authentication API
app.use('/api/auth', require('./Routes/Auth'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
