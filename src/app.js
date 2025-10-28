// server.js

// ===============================
// 1️⃣ IMPORT REQUIRED MODULES
// ===============================
const express = require("express");                  // Import Express framework
const connectDB = require("./config/database");      // Import database connection function
const User = require("./models/user");               // Import User model (Mongoose schema)

const app = express(); // Create an Express application

// ===============================
// 2️⃣ MIDDLEWARE
// ===============================
// Parse JSON bodies for POST, PATCH requests
app.use(express.json());


// ===============================
// 3️⃣ CREATE - Signup a new user
// POST /signup
// ===============================
app.post("/signup", async (req, res) => {
  try {
    // Create new user from request body
    const user = new User(req.body);

    // Save user to MongoDB
    await user.save();

    // Return success response
    res.status(201).send({ message: "✅ User signed up successfully!", user });
  } catch (err) {
    // Handle errors (e.g., duplicate email, validation issues)
    res.status(500).send({ error: "❌ Error signing up user: " + err.message });
  }
});


// ===============================
// 4️⃣ READ - Get all users
// GET /feed
// ===============================
app.get("/feed", async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send({ error: "❌ Something went wrong: " + err.message });
  }
});


// ===============================
// 5️⃣ READ - Get single user by email
// GET /user?email=<email>
// ===============================
app.get("/user", async (req, res) => {
  const userEmail = req.query.email; // Get email from query string

  if (!userEmail) {
    return res.status(400).send({ error: "⚠️ Email is required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ message: "❌ User not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send({ error: "❌ Error fetching user: " + err.message });
  }
});


// ===============================
// 6️⃣ UPDATE - Update user by ID
// PATCH /user
// ===============================
// ⚠️ FIXED BUG: You wrote `user.findByIdAndUpdate` (lowercase). It should be `User.findByIdAndUpdate`
app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;

  console.log("🔄 Update request for userId:", userId, "with data:", data);

  try {
    if (!userId) {
      return res.status(400).send("⚠️ userId is required");
    }

    // Update user by ID
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    });

    if (!updatedUser) {
      return res.status(404).send("❌ User not found");
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).send("Something went wrong: " + err.message);
  }
});


// ===============================
// 7️⃣ DELETE - Delete user by ID
// DELETE /user/:id
// ===============================
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send({ message: "❌ User not found" });
    }
    res.send({ message: "✅ User deleted successfully" });
  } catch (err) {
    res.status(400).send({ error: "❌ Error deleting user: " + err.message });
  }
});


// ===============================
// 8️⃣ CONNECT DATABASE & START SERVER
// ===============================
connectDB()
  .then(() => {
    console.log("✅ Database connection established.");
    app.listen(7777, () => {
      console.log("🚀 Server is running on http://localhost:7777");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });


// Export for testing or other files
module.exports = app;
