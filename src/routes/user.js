// Importing required modules
const express = require("express");
const userRouter = express.Router();

// Importing authentication middleware and Mongoose models
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Defining which user fields are safe to expose in API responses
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

/**
 * ---------------------------------------
 * ROUTE 1: Get all pending connection requests received by the logged-in user
 * ---------------------------------------
 */
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user; // Get the logged-in user's info (from middleware)

    // Find all connection requests where the logged-in user is the receiver
    // and the sender has shown interest (status = 'interested')
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); // Populate sender info safely

    // Send successful response with the data
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    // Handle errors
    res.status(400).send("ERROR: " + err.message);
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

    // Find all connection requests where the logged-in user is either the sender or receiver
    // and the request has been accepted
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // Map over the connection requests and return the other user in each connection
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        // If the logged-in user sent the request, return the receiver
        return row.toUserId;
      }
      // Otherwise, return the sender
      return row.fromUserId;
    });

    // Send response with all connected users
    res.json({ data });
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

    // Pagination setup (default: page=1, limit=10)
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // Cap limit to 50 to avoid heavy load
    const skip = (page - 1) * limit;

    // Find all connection requests involving the logged-in user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Build a list of users to hide from the feed (already connected/interacted)
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // Fetch users excluding:
    // 1. Logged-in user themselves
    // 2. Users already in any connection request with them
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA) // Only return safe fields
      .skip(skip) // Skip for pagination
      .limit(limit); // Limit the number of users returned

    // Send feed data
    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Exporting the router to be used in main app
module.exports = userRouter;
