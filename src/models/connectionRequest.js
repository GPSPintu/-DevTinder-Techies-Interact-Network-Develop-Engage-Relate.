// Import Mongoose for schema and model creation
const mongoose = require("mongoose");

// Define the Connection Request schema
const connectionRequestSchema = new mongoose.Schema(
  {
    // The user who sent the connection request
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },

    // The user who received the connection request
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },

    // The current status of the connection request
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is an incorrect status type", // Custom error message for invalid status
      },
      default: "interested", // Optional: set a default value
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ✅ Compound index to ensure a user cannot send multiple requests to the same user
// This improves query performance and prevents duplicate connections.
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// ✅ Pre-save hook to prevent a user from sending a connection request to themselves
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  // Check if sender and receiver are the same
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("❌ Cannot send a connection request to yourself!");
  }

  next(); // Continue with save if validation passes
});

// ✅ Create and export the model
const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
