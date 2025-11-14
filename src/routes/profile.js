// ============================================
//              IMPORTS
// ============================================

const express = require("express");                     // Import Express framework
const profileRouter = express.Router();                 // Create a new router for profile-related routes

const { userAuth } = require("../middlewares/auth");    // Import custom middleware that verifies JWT and sets req.user
const { validateEditProfileData } = require("../utils/validation"); // Validation function for profile updates

// ============================================
//              VIEW PROFILE ROUTE
// ============================================

profileRouter.get("/profile/view", userAuth, async (req, res) => {  // Protected GET route to view a user's profile
  try {
    const user = req.user;                             // The authenticated user's data provided by userAuth middleware

    // Exclude sensitive fields before sending response
    const { password, ...userData } = user.toObject(); // Remove password from the user object

    res.status(200).json({
      message: "Profile fetched successfully",
      data: userData,                                  // Send only safe user fields
    });
  } catch (err) {
    res.status(400).json({ error: err.message });      // Send error response
  }
});

// ============================================
//              EDIT PROFILE ROUTE
// ============================================

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {  // Protected PATCH route for updating profile
  try {
    // Step 1: Validate user input for editing profile
    if (!validateEditProfileData(req)) {
      return res.status(400).json({ error: "Invalid edit request" });
    }

    const loggedInUser = req.user;                     // Access authenticated user data

    // Step 2: Specify which fields are allowed to be edited
    const allowedFields = ["firstName", "lastName", "bio", "profilePicture"];

    // Loop through allowed fields and update only if user sent them
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {              // Only update if the field is provided
        loggedInUser[field] = req.body[field];          // Apply update to the user object
      }
    });

    // Step 3: Save updated user back into the database
    await loggedInUser.save();

    // Step 4: Remove password before responding
    const { password, ...userData } = loggedInUser.toObject();

    res.status(200).json({
      message: `${loggedInUser.firstName}, your profile was updated successfully!`,
      data: userData,                                  // Return updated user data
    });
  } catch (err) {
    res.status(400).json({ error: err.message });      // Error handling
  }
});

// ============================================
//              EXPORT ROUTER
// ============================================

module.exports = profileRouter;                         // Export router so it can be used in main server
