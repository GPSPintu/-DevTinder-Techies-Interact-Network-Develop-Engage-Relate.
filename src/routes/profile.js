// ============================================
//              IMPORTS
// ============================================

const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth"); // JWT auth middleware
const { validateEditProfileData } = require("../utils/validation");

// ============================================
//              VIEW PROFILE ROUTE
// ============================================

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    // Exclude sensitive fields like password before sending
    const { password, ...userData } = user.toObject();

    res.status(200).json({
      message: "Profile fetched successfully",
      data: userData,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
//              EDIT PROFILE ROUTE
// ============================================

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Step 1: Validate edit data
    if (!validateEditProfileData(req)) {
      return res.status(400).json({ error: "Invalid edit request" });
    }

    const loggedInUser = req.user;

    // Step 2: Only update allowed fields
    const allowedFields = ["firstName", "lastName", "bio", "profilePicture"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        loggedInUser[field] = req.body[field];
      }
    });

    // Step 3: Save updated user to DB
    await loggedInUser.save();

    // Step 4: Return updated profile
    const { password, ...userData } = loggedInUser.toObject();
    res.status(200).json({
      message: `${loggedInUser.firstName}, your profile was updated successfully!`,
      data: userData,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
//              EXPORT ROUTER
// ============================================

module.exports = profileRouter;

