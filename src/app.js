// Import Express framework
const express = require("express");

// Import database connection function
const connectDB = require("./config/database");

// Load environment variables from .env file
require("dotenv").config();

// Create an Express application instance
const app = express();

// ---------------------- MIDDLEWARE ----------------------
app.use(express.json()); // Parse incoming JSON requests

// ---------------------- SIMPLE ROUTE ----------------------
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ---------------------- DATABASE & SERVER ----------------------
connectDB()
  .then(() => {
    console.log("Database connection established...");

    const PORT = process.env.PORT || 7777;
    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });

