
// ============================================
//              IMPORTS
// ============================================

const express = require("express");                     // Importing Express framework
const authRouter = express.Router();                   // Creating a new Router instance for auth routes

const { validateSignUpData } = require("../utils/validation");  // Importing custom input validation function
const User = require("../models/user");                // Importing Mongoose User model
const bcrypt = require("bcrypt");                      // Library for hashing passwords

// ============================================
//              SIGNUP ROUTE
// ============================================

authRouter.post("/signup", async (req, res) => {       // POST route for signing up a new user
  try {
    // Step 1: Validate input — throws error if invalid
    validateSignUpData(req);

    // Step 2: Extract user details from request body
    const { firstName, lastName, emailId, password } = req.body;

    // Step 3: Check if a user already exists with the given email
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    // Step 4: Hash the user's password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    // Step 5: Create a new user document to store in DB
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    // Step 6: Save newly created user to MongoDB
    const savedUser = await user.save();

    // Step 7: Generate JWT token using the method defined in User model
    const token = await savedUser.getJWT();

    // Step 8: Save JWT in a secure HTTP cookie (expires in 8 hours)
    res.cookie("token", token, {
      httpOnly: true,                                  // Prevents access via JavaScript
      secure: process.env.NODE_ENV === "production",   // Only secure in production
      expires: new Date(Date.now() + 8 * 3600000),     // 8 hours expiry
    });

    // Step 9: Send success message back to client
    res.status(201).json({
      message: "User registered successfully!",
      data: savedUser,
    });
  } catch (err) {
    // Error handling for signup failures
    res.status(400).send("ERROR: " + err.message);
  }
});

// ============================================
//              LOGIN ROUTE
// ============================================

authRouter.post("/login", async (req, res) => {        // POST route for user login
  try {
    // Step 1: Extract email and password from request body
    const { emailId, password } = req.body;

    // Step 2: Check if the user exists in DB
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Step 3: Validate password using User model's method
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Step 4: Generate a JWT token for authenticated user
    const token = await user.getJWT();

    // Step 5: Send token back through a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 8 * 3600000),     // 8 hours expiry
    });

    // Step 6: Send success response
    res.status(200).json({
      message: "Login successful!",
      data: user,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ============================================
//              LOGOUT ROUTE
// ============================================

authRouter.post("/logout", (req, res) => {             // POST route to log the user out
  try {
    // Step 1: Clear the token cookie by setting it to null
    res.cookie("token", null, {
      expires: new Date(Date.now()),                   // Expire immediately
      httpOnly: true,
    });

    // Step 2: Return logout success message
    res.status(200).json({ message: "Logout successful!" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ============================================
//              EXPORT ROUTER
// ============================================

module.exports = authRouter;                           // Export router for use in the main app

