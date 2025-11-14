// Importing required modules
const express = require("express");                       // Express framework
const userRouter = express.Router();                      // Create user-specific router

// Importing authentication middleware and Mongoose models
const { userAuth } = require("../middlewares/auth");      // Auth middleware (verifies JWT)
const ConnectionRequest = require("../models/connectionRequest");  // Model for connection requests
const User = require("../models/user");                   // User model

// Defining which user fields are safe to expose in API responses
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";


/**
 * ---------------------------------------
 * ROUTE 1: Get all pending connection requests received by the logged-in user
 * ---------------------------------------
 */
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;                        // User data extracted from JWT by middleware

    // Find all connection requests WITH:
    // - toUserId = logged-in user (means they received the request)
    // - status = "interested" (someone expressed interest)
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);            // Populate sender user info (safe fields only)

    // Send successful response with pending requests
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);        // Error handling
  }
});


/**
 * ---------------------------------------
 * ROUTE 2: Get all accepted connections of the logged-in user
 * ---------------------------------------
 */
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Find all accepted requests WHERE:
    // - Logged-in user is the sender OR receiver
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)             // Populate sender data
      .populate("toUserId", USER_SAFE_DATA);              // Populate receiver data

    // For each connection request, return the OTHER user (not the logged-in one)
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;                              // If you sent request → return the receiver
      }
      return row.fromUserId;                              // If you received request → return the sender
    });

    res.json({ data });                                   // Send final list of connections
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});


/**
 * ---------------------------------------
 * ROUTE 3: Get the user feed (list of users to show)
 * ---------------------------------------
 */
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Setup pagination (defaults if missing)
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Prevent heavy API load by limiting max number of users per request
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    // Fetch all connection records involving logged-in user
    // This helps exclude them from the feed (already interacted)
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");                     // Select only IDs, not whole objects

    // Build a set of user IDs to hide from the feed
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req
