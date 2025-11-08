// ============================================
//              IMPORTS
// ============================================

const express = require("express");
const authRouter = express.Router(); // Creating a new Express router instance

const { validateSignUpData } = require("../utils/validation"); // Validation utility
const User = require("../models/user"); // Mongoose User model
const bcrypt = require("bcrypt"); // For password hashing

// ============================================
//              SIGNUP ROUTE
// ============================================

authRouter.post("/signup", async (req, res) => {
  try {
    // ✅ Step 1: Validate the request data (throws error if invalid)
    validateSignUpData(req);

    // ✅ Step 2: Extract user data from request body
    const { firstName, lastName, emailId, password } = req.body;

    // ✅ Step 3: Check if a user already exists with this email
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    // ✅ Step 4: Encrypt the password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Step 5: Create a new user instance
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    // ✅ Step 6: Save user in the database
    const savedUser = await user.save();

    // ✅ Step 7: Generate JWT token (method defined in User model)
    const token = await savedUser.getJWT();

    // ✅ Step 8: Store JWT in a cookie (expires in 8 hours)
    res.cookie("token", token, {
      httpOnly: true, // helps protect from XSS attacks
      secure: process.env.NODE_ENV === "production", // only send via HTTPS in production
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });

    // ✅ Step 9: Send success response
    res.status(201).json({
      message: "User registered successfully!",
      data: savedUser,
    });
  } catch (err) {
    // ❌ Error handling
    res.status(400).send("ERROR: " + err.message);
  }
});

// ============================================
//              LOGIN ROUTE
// ============================================

authRouter.post("/login", async (req, res) => {
  try {
    // ✅ Step 1: Extract email & password
    const { emailId, password } = req.body;

    // ✅ Step 2: Find user by email
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // ✅ Step 3: Validate password using model method
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // ✅ Step 4: Generate JWT token
    const token = await user.getJWT();

    // ✅ Step 5: Store JWT in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    // ✅ Step 6: Send success response
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

authRouter.post("/logout", (req, res) => {
  try {
    // ✅ Step 1: Clear authentication token
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // ✅ Step 2: Send logout success response
    res.status(200).json({ message: "Logout successful!" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ============================================
//              EXPORT ROUTER
// ============================================

module.exports = authRouter;

