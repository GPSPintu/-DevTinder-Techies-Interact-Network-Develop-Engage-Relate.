// Import Express framework
const express = require("express");                  // Loads Express library

// Import database connection function
const connectDB = require("./config/database");      // Function that connects to MongoDB

// Load environment variables from .env file
require("dotenv").config();                          // Makes variables like PORT available

// Create an Express application instance
const app = express();                               // Initialize Express app


// ---------------------- MIDDLEWARE ----------------------
app.use(express.json());                             // Middleware to parse JSON request bodies


// ---------------------- SIMPLE ROUTE ----------------------
app.get("/", (req, res) => {                         // Basic GET route for homepage
  res.send("Server is running!");                    // Respond with a simple message
});


// ---------------------- DATABASE & SERVER ----------------------
connectDB()                                           // Attempt to connect to the database
  .then(() => {                                       // If database connection is successful...
    console.log("Database connection established...");

    const PORT = process.env.PORT || 7777;           // Get PORT from .env or default to 7777

    app.listen(PORT, () => {                         // Start the server
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {                                   // If DB connection fails...
    console.error("Database cannot be connected!!", err);
  });
