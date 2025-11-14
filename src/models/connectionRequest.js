// Import Express framework
const express = require("express");                  // Loads the Express library used to create the server

// Import database connection function
const connectDB = require("./config/database");      // Custom function that connects your app to MongoDB

// Load environment variables from .env file
require("dotenv").config();                          // Loads variables like PORT, MONGO_URL into process.env

// Create an Express application instance
const app = express();                               // Creates the main Express app


// ---------------------- MIDDLEWARE ----------------------
app.use(express.json());                             // Middleware to parse JSON in request bodies


// ---------------------- SIMPLE ROUTE ----------------------
app.get("/", (req, res) => {                         // Defines a GET route at "/"
  res.send("Server is running!");                    // Sends back a simple confirmation message
});


// ---------------------- DATABASE & SERVER ----------------------
connectDB()                                           // Calls the function to connect to MongoDB
  .then(() => {                                       // If connection is successful:
    console.log("Database connection established...");

    const PORT = process.env.PORT || 7777;           // Load port from .env OR default to 7777

    app.listen(PORT, () => {                         // Start the express server on selected port
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {                                   // If DB connection fails:
    console.error("Database cannot be connected!!", err);   // Log the error
  });
