// server.js
// ==========================================
// 🚀 MAIN SERVER FILE
// ==========================================

// Import core and third-party dependencies
const express = require("express");           // Express framework for building the API
const connectDB = require("./config/database"); // MongoDB connection setup
const cookieParser = require("cookie-parser"); // Middleware to parse cookies
require('./utils/cronjob');
               // Middleware to handle Cross-Origin Resource Sharing
const http = require("http");                 // Node's HTTP module (needed for socket.io)
require("dotenv").config();                   // Load environment variables from .env file

// Import and initialize background jobs
require("./utils/cronjob"); // Executes scheduled tasks (like cleanup, notifications, etc.)

// Create Express app
const app = express();

// ==========================================
// 🛡️ MIDDLEWARE CONFIGURATION
// ==========================================

// Enable CORS to allow requests from the frontend (React app on localhost:5173)
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,               // Allow cookies and authentication headers
  })
);

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse cookies in incoming requests
app.use(cookieParser());

// ==========================================
// 🧭 ROUTES IMPORT
// ==========================================

// Import all route modules
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

// Socket initialization utility
const initializeSocket = require("./utils/socket");

// ==========================================
// 🚏 REGISTER ROUTES
// ==========================================
// All routes are mounted at the root level (“/”)
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// ==========================================
// 🔌 SERVER + SOCKET.IO INITIALIZATION
// ==========================================

// Create an HTTP server (required for integrating Socket.io)
const server = http.createServer(app);

// Initialize WebSocket connections
initializeSocket(server);

// ==========================================
// 🗄️ DATABASE CONNECTION & SERVER STARTUP
// ==========================================

connectDB()
  .then(() => {
    console.log("✅ Database connection established...");

    // Start the server only after the database is connected
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server is successfully listening on port ${process.env.PORT}...`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed!", err);
  });

















































// // server.js

// // ===============================
// // 1️⃣ IMPORT REQUIRED MODULES
// // ===============================
// const express = require("express"); // Import Express framework
// const connectDB = require("./config/database"); // Import MongoDB connection function
// const User = require("./models/user"); // Import Mongoose User model
// const { validateSignUpData } = require("./utils/validation"); // Import signup validation
// const bcrypt = require("bcrypt"); // Library for password hashing

// // Create an Express application instance
// const app = express();


// // ===============================
// // 2️⃣ MIDDLEWARE
// // ===============================
// // Parse JSON bodies for POST, PATCH requests
// app.use(express.json());


// // ===============================
// // 3️⃣ CREATE - Signup a new user
// // POST /signup
// // ===============================
// app.post("/signup", async (req, res) => {
//   try {
//     // ✅ Step 1: Validate request data
//     validateSignUpData(req);

//     // ✅ Step 2: Extract fields from request body
//     const { firstName, lastName, email, password } = req.body;

//     // ✅ Step 3: Check if email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).send({ error: "⚠️ Email already registered" });
//     }

//     // ✅ Step 4: Hash the password securely
//     const passwordHash = await bcrypt.hash(password, 10);

//     // ✅ Step 5: Create a new User instance
//     const user = new User({
//       firstName,
//       lastName,
//       email,
//       password: passwordHash,
//     });

//     // ✅ Step 6: Save the user to MongoDB
//     await user.save();

//     // ✅ Step 7: Return success response (excluding password)
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(201).send({
//       message: "✅ User signed up successfully!",
//       user: userResponse,
//     });
//   } catch (err) {
//     res.status(500).send({ error: "❌ Error signing up user: " + err.message });
//   }
// });


// // ===============================
// // 4️⃣ LOGIN - Authenticate user
// // POST /login
// // ===============================
// app.post("/login", async (req, res) => {
//   try {
//     // ✅ Step 1: Extract login credentials
//     const { email, password } = req.body;

//     // ✅ Step 2: Check if both fields are provided
//     if (!email || !password) {
//       return res.status(400).send({ error: "⚠️ Email and password are required" });
//     }

//     // ✅ Step 3: Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).send({ error: "❌ Invalid credentials (user not found)" });
//     }

//     // ✅ Step 4: Compare provided password with stored hash
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).send({ error: "❌ Invalid credentials (wrong password)" });
//     }

//     // ✅ Step 5: Login successful — return basic user info
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(200).send({
//       message: "✅ Login successful!",
//       user: userResponse,
//     });
//   } catch (err) {
//     res.status(500).send({ error: "❌ Error logging in: " + err.message });
//   }
// });


// // ===============================
// // 5️⃣ READ - Get all users
// // GET /feed
// // ===============================
// app.get("/feed", async (req, res) => {
//   try {
//     // Fetch all users (excluding password field)
//     const users = await User.find({}, { password: 0 });
//     res.send(users);
//   } catch (err) {
//     res.status(400).send({ error: "❌ Something went wrong: " + err.message });
//   }
// });


// // ===============================
// // 6️⃣ READ - Get single user by email
// // GET /user?email=<email>
// // ===============================
// app.get("/user", async (req, res) => {
//   const userEmail = req.query.email; // Get email from query string

//   if (!userEmail) {
//     return res.status(400).send({ error: "⚠️ Email is required" });
//   }

//   try {
//     // Find user by email (excluding password)
//     const user = await User.findOne({ email: userEmail }, { password: 0 });

//     if (!user) {
//       return res.status(404).send({ message: "❌ User not found" });
//     }

//     res.send(user);
//   } catch (err) {
//     res.status(500).send({ error: "❌ Error fetching user: " + err.message });
//   }
// });


// // ===============================
// // 7️⃣ UPDATE - Update user by ID
// // PATCH /user
// // ===============================
// app.patch("/user", async (req, res) => {
//   const { userId, ...updateData } = req.body;

//   console.log("🔄 Update request for userId:", userId, "with data:", updateData);

//   try {
//     if (!userId) {
//       return res.status(400).send("⚠️ userId is required");
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//       runValidators: true,
//       projection: { password: 0 },
//     });

//     if (!updatedUser) {
//       return res.status(404).send("❌ User not found");
//     }

//     res.json(updatedUser);
//   } catch (err) {
//     console.error("❌ Update error:", err);
//     res.status(500).send("Something went wrong: " + err.message);
//   }
// });


// // ===============================
// // 8️⃣ DELETE - Delete user by ID
// // DELETE /user/:id
// // ===============================
// app.delete("/user/:id", async (req, res) => {
//   const userId = req.params.id;

//   try {
//     const deletedUser = await User.findByIdAndDelete(userId);

//     if (!deletedUser) {
//       return res.status(404).send({ message: "❌ User not found" });
//     }

//     res.send({ message: "✅ User deleted successfully" });
//   } catch (err) {
//     res.status(400).send({ error: "❌ Error deleting user: " + err.message });
//   }
// });


// // ===============================
// // 9️⃣ CONNECT DATABASE & START SERVER
// // ===============================
// connectDB()
//   .then(() => {
//     console.log("✅ Database connection established.");
//     app.listen(7777, () => {
//       console.log("🚀 Server is running on http://localhost:7777");
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err);
//   });


// // Export app for testing or reusability
// module.exports = app;
