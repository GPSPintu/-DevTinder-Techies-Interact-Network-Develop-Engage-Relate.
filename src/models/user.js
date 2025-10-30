// Import required packages
const mongoose = require("mongoose"); // ODM for MongoDB
const validator = require("validator"); // Used for validating email, URLs, passwords, etc.
const jwt = require("jsonwebtoken"); // For creating authentication tokens
const bcrypt = require("bcrypt"); // For hashing passwords

// 1️⃣ Define the User Schema
const userSchema = new mongoose.Schema(
  {
    // First Name: Required, must have at least 4 characters and at most 50
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },

    // Last Name: Optional
    lastName: {
      type: String,
    },

    // Email: Required, unique, lowercase, trimmed, and validated with 'validator'
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },

    // Password: Required and must be strong according to validator's rules
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password: " + value);
        }
      },
    },

    // Age: Optional, must be at least 18 if provided
    age: {
      type: Number,
      min: 18,
    },

    // Gender: Must be one of the specified values
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`,
      },
    },

    // Whether user is a premium member
    isPremium: {
      type: Boolean,
      default: false,
    },

    // Membership type (optional)
    membershipType: {
      type: String,
    },

    // Profile Photo URL with a default value and validation
    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },

    // About section with a default message
    about: {
      type: String,
      default: "This is a default about of the user!",
    },

    // List of user skills (array of strings)
    skills: {
      type: [String],
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// 2️⃣ Pre-save Hook: Automatically hash password before saving user
userSchema.pre("save", async function (next) {
  const user = this;

  // Only hash password if it’s modified (important for updates)
  if (user.isModified("password")) {
    const saltRounds = 10; // You can adjust the salt rounds for stronger hashing
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  next(); // Move to the next middleware
});

// 3️⃣ Method to generate a JWT token for authentication
userSchema.methods.getJWT = async function () {
  const user = this;

  // Create a JWT token with user's ID and an expiration time of 7 days
  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
    expiresIn: "7d",
  });

  return token;
};

// 4️⃣ Method to validate a user's password
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;

  // Compare the input password with the hashed password stored in the DB
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    user.password
  );

  return isPasswordValid;
};

// 5️⃣ Export the model to use it in other files
module.exports = mongoose.model("User", userSchema);
