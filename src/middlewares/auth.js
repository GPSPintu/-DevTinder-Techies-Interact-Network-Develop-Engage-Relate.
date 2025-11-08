






































































































































// Perfect ✅ — Here’s the **complete, fully commented step-by-step guide + code** for implementing **JWT authentication using cookies** in **Node.js + Express + MongoDB**.

// This includes:

// * Installing packages
// * Creating a user model with password hashing and JWT methods
// * Middleware for authentication
// * Routes for register, login, profile, send cookie, and connection request
// * Cookie setup (with expiry of 7 days)

// ---

// ## 🧩 STEP 1: Install Required Packages

// Run this in your terminal 👇

// ```bash
// npm init -y
// npm install express mongoose cookie-parser jsonwebtoken bcrypt
// ```

// ---

// ## ⚙️ STEP 2: `server.js`

// This is the **entry point** of your app.

```js
// server.js
// ===============================
// MAIN SERVER SETUP
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/jwtDemo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

// Use user-related routes
app.use("/api", userRoutes);

// Start the server
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
```

// ---

// ## 👤 STEP 3: `models/user.js`

// This defines the **User schema**, with:

// * Password hashing before saving
// * Methods to generate a JWT
// * Method to compare passwords

```js
// models/user.js
// ===============================
// USER MODEL
// ===============================

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

// Hash password before saving to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT token valid for 7 days
userSchema.methods.getJWT = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET || "mysecret",
    { expiresIn: "7d" } // token expiry: 7 days
  );
};

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

// Export model
module.exports = mongoose.model("User", userSchema);
```

// ---

// ## 🔐 STEP 4: `middleware/userAuth.js`

// Middleware to verify the JWT token stored in cookies and attach the user to the `req` object.

// ```js
// middleware/userAuth.js
// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const userAuth = async (req, res, next) => {
//   try {
//     // Get token from cookies
//     const { token } = req.cookies;

//     // If no token found
//     if (!token) {
//       return res.status(401).send("Please login first!");
//     }

//     // Verify token
//     const decodedObj = await jwt.verify(token, process.env.JWT_SECRET || "mysecret");
//     const { _id } = decodedObj;

//     // Find user by ID
//     const user = await User.findById(_id);
//     if (!user) throw new Error("User not found");

//     // Attach user to request
//     req.user = user;

//     // Continue to next middleware or route
//     next();
//   } catch (err) {
//     res.status(400).send("ERROR: " + err.message);
//   }
// };

// module.exports = { userAuth };
// ```

// ---

// ## 🛠️ STEP 5: `routes/userRoutes.js`

// All user-related routes:

// * **Register**
// * **Login**
// * **Profile (protected)**
// * **Dummy cookie**
// * **Send connection request (protected)**

// ```js
// // routes/userRoutes.js
// // ===============================
// // USER ROUTES
// // ===============================

// const express = require("express");
// const router = express.Router();
// const User = require("../models/user");
// const { userAuth } = require("../middleware/userAuth");

// // 📝 Register a new user
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Create new user
//     const user = new User({ name, email, password });
//     await user.save();

//     res.status(201).send("✅ User registered successfully");
//   } catch (err) {
//     res.status(400).send("❌ Error: " + err.message);
//   }
// });

// // 🔑 Login user and send JWT in cookie
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).send("Invalid email or password");

//     // Compare password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(400).send("Invalid email or password");

//     // Generate JWT token
//     const token = user.getJWT();

//     // Send token in HTTP-only cookie (valid for 7 days)
//     res.cookie("token", token, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     res.send("✅ Login successful, token stored in cookie");
//   } catch (err) {
//     res.status(400).send("❌ Error: " + err.message);
//   }
// });

// // 🍪 Send a dummy cookie to user
// router.get("/send-cookie", (req, res) => {
//   res.cookie("dummy", "hello_cookie", { httpOnly: true });
//   res.send("🍪 Dummy cookie sent!");
// });

// // 👤 Protected Profile route (requires login)
// router.get("/profile", userAuth, async (req, res) => {
//   res.send(`👋 Welcome ${req.user.name}, your email is ${req.user.email}`);
// });

// ➕ Example: Send Connection Request (protected)
// router.post("/sendConnectionRequest", userAuth, async (req, res) => {
//   res.send(`📨 Connection request sent by ${req.user.name}`);
// });

// module.exports = router;
// ```

// ---

// ## 🧪 STEP 6: Test the APIs

// Use **Postman** or any REST client:

// ### 1️⃣ Register a user

// **POST** → `http://localhost:3000/api/register`
// Body (JSON):

// ```json
// {
//   "name": "John",
//   "email": "john@example.com",
//   "password": "123456"
// }
// ```

// ---

// ### 2️⃣ Login user

// **POST** → `http://localhost:3000/api/login`
// Body (JSON):

// ```json
// {
//   "email": "john@example.com",
//   "password": "123456"
// }
// ```

// ✅ You’ll get a cookie named `token` in response.

// ---

// ### 3️⃣ Check profile (with cookie)

// **GET** → `http://localhost:3000/api/profile`
// ✅ If you’re logged in, you’ll see:

// ```
// Welcome John, your email is john@example.com
// ```

// ---

// ### 4️⃣ Dummy cookie test

// **GET** → `http://localhost:3000/api/send-cookie`
// ✅ You’ll get a cookie named `dummy`.

// ---

// ### 5️⃣ Send Connection Request

// **POST** → `http://localhost:3000/api/sendConnectionRequest`
// ✅ Works only if logged in (token present in cookies).

// ---

// ## ✅ BONUS (Optional): Logout API

// You can add this to `userRoutes.js` to clear the cookie:

// ```js
// // 🚪 Logout user (clear JWT cookie)
// router.post("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.send("👋 Logged out successfully");
// });
// ```

// ---

// ### 🎯 Summary

// | Step | File                     | Purpose                                |
// | ---- | ------------------------ | -------------------------------------- |
// | 1    | Install Packages         | Setup dependencies                     |
// | 2    | `server.js`              | Server entry point                     |
// | 3    | `models/user.js`         | User model with JWT + password methods |
// | 4    | `middleware/userAuth.js` | Middleware to verify JWT               |
// | 5    | `routes/userRoutes.js`   | Register, login, profile routes        |
// | 6    | Test APIs                | Use Postman to verify cookies + JWT    |

// ---

// Would you like me to add **frontend (React)** code to log in and handle these cookies too?





// middleware/userAuth.js
// ==========================================
// 🔐 USER AUTHENTICATION MIDDLEWARE
// ==========================================

// Import required modules
const jwt = require("jsonwebtoken");   // For verifying JWT tokens
const User = require("../models/user"); // Import User model to fetch user data from MongoDB

// Middleware function to authenticate users
const userAuth = async (req, res, next) => {
  try {
    // ================================
    // STEP 1: Get token from cookies
    // ================================
    // When the user logs in, a JWT token is sent and stored in the browser as a cookie.
    // We can access it here through req.cookies (cookie-parser must be used in your app)
    const { token } = req.cookies;

    // If token not found → user is not logged in
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    // ================================
    // STEP 2: Verify the token
    // ================================
    // Decode the token using jwt.verify()
    // It also checks whether the token is valid and not expired
    // process.env.JWT_SECRET should be the same secret used when creating the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    // ================================
    // STEP 3: Extract user ID from token
    // ================================
    // The payload (data) inside the token contains the user’s _id
    const { _id } = decodedObj;

    // ================================
    // STEP 4: Find the user in the database
    // ================================
    // Use the _id from the token to find the actual user document in MongoDB
    const user = await User.findById(_id);

    // If no user found → invalid token or user deleted
    if (!user) {
      throw new Error("User not found");
    }

    // ================================
    // STEP 5: Attach user to the request object
    // ================================
    // Now that the user is verified, attach the user data to req.user
    // So that next middleware or route can access logged-in user info easily
    req.user = user;

    // ================================
    // STEP 6: Call next() to continue
    // ================================
    // If everything is fine, move on to the next middleware or route handler
    next();

  } catch (err) {
    // ================================
    // STEP 7: Handle errors
    // ================================
    // If token is invalid, expired, or user not found, catch the error and respond
    res.status(400).send("ERROR: " + err.message);
  }
};

// Export the middleware so it can be used in routes
module.exports = {
  userAuth,
};
