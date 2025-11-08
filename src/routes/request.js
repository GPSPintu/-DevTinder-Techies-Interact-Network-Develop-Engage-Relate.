// ============================================
//              IMPORTS
// ============================================

const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail"); // Optional email utility

// ============================================
//        ROUTE 1 → SEND A CONNECTION REQUEST
// ============================================

requestRouter.post(
  "/request/send/:status/:toUserId", 
  userAuth, 
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type: " + status });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).json({ message: "Connection request already exists!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      // Optional email notification
      /*
      const emailRes = await sendEmail.run(
        `New friend request from ${req.user.firstName}`,
        `${req.user.firstName} is ${status} in ${toUser.firstName}`
      );
      console.log(emailRes);
      */

      res.status(200).json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ============================================
//        ROUTE 2 → REVIEW A CONNECTION REQUEST
// ============================================

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.status(200).json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ============================================
//              EXPORT ROUTER
// ============================================

module.exports = requestRouter;
