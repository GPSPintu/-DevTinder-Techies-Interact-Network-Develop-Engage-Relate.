// ============================================
//              IMPORTS
// ============================================

const express = require("express");                                     // Import Express
const requestRouter = express.Router();                                 // Create router instance

const { userAuth } = require("../middlewares/auth");                    // JWT auth middleware
const ConnectionRequest = require("../models/connectionRequest");       // Model for storing connection requests
const User = require("../models/user");                                 // User model
const sendEmail = require("../utils/sendEmail");                        // Utility for optional email notifications

// ============================================
//        ROUTE 1 → SEND A CONNECTION REQUEST
// ============================================

requestRouter.post(
  "/request/send/:status/:toUserId",                                    // Dynamic params: status + recipient user ID
  userAuth,                                                             // Protect route using user authentication
  async (req, res) => {
    try {
      const fromUserId = req.user._id;                                  // Sender ID from logged-in user
      const toUserId = req.params.toUserId;                             // Receiver user ID from URL params
      const status = req.params.status;                                 // Status passed: interested / ignored

      const allowedStatus = ["ignored", "interested"];                  // Valid statuses for sending a request
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type: " + status });
      }

      const toUser = await User.findById(toUserId);                     // Check if recipient exists
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      // Check if a request already exists between these two users (in either direction)
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).json({ message: "Connection request already exists!" });
      }

      // Create a new request object
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();                      // Save the request in DB

      // OPTIONAL EMAIL NOTIFICATION (commented out)
      /*
      const emailRes = await sendEmail.run(
        `New friend request from ${req.user.firstName}`,
        `${req.user.firstName} is ${status} in ${toUser.firstName}`
      );
      console.log(emailRes);
      */

      // Send success response
      res.status(200).json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });                    // Error handler
    }
  }
);

// ============================================
//        ROUTE 2 → REVIEW A CONNECTION REQUEST
// ============================================

requestRouter.post(
  "/request/review/:status/:requestId",                                 // Dynamic params: status + requestId
  userAuth,                                                             // Protected route
  async (req, res) => {
    try {
      const loggedInUser = req.user;                                    // Current authenticated user
      const { status, requestId } = req.params;                         // Get parameters from URL

      const allowedStatus = ["accepted", "rejected"];                   // Valid statuses for reviewing
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }

      // Ensure the request is sent TO the logged-in user and is still in "interested" state
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;                                // Update the status
      const data = await connectionRequest.save();                      // Save changes

      res.status(200).json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ============================================
//              EXPORT ROUTER
// ============================================

module.exports = requestRouter;                                        // Export router for use in main app
