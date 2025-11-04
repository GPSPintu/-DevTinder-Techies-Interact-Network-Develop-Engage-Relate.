Here’s your corrected and properly formatted **DevTinder API specification**, with consistent naming conventions, spelling, and RESTful URL patterns:

---

### **DevTinder API Endpoints (Corrected)**

#### **Auth Routes**

* **POST** `/signup` — Register a new user
* **POST** `/login` — Log in an existing user
* **POST** `/logout` — Log out the current user

---

#### **Profile Routes**

* **GET** `/profile/view` — View your profile
* **PATCH** `/profile/edit` — Edit your profile details
* **PATCH** `/profile/password` — Update/change your password

---

#### **Requests / Interactions**

* **POST** `/request/send/interest/:userId` — Send an "Interested" request to a user
* **POST** `/request/send/ignore/:userId` — Ignore a user
* **GET** `/request/review/accepted` — Get all accepted requests
* **GET** `/request/review/rejected` — Get all rejected requests

---

#### **Connections and Feed**

* **GET** `/users/connections` — Get your current connections
* **GET** `/requests/received` — View all received requests
* **GET** `/feed` — Get the feed (profiles of other users on the platform)

---

#### **Request Status Values**

`Status:`

* `IGNORED`
* `INTERESTED`
* `ACCEPTED`
* `REJECTED`


devtinder-backend/
│
├── server.js
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── requestController.js
│   └── feedController.js
├── models/
│   ├── User.js
│   └── Request.js
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── requestRoutes.js
│   ├── feedRoutes.js
│   └── connectionRoutes.js
└── middleware/
    └── authMiddleware.js

Perfect 🔥 — here’s a **Node.js + Express backend** implementation of your **DevTinder APIs** with clean structure and comments, ready to use as a foundation for your project.

This includes **auth routes**, **profile management**, **requests/interactions**, and **feed/connections**, following the corrected API design.

---

## 🧱 Project Structure

```
devtinder-backend/
│
├── server.js
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── requestController.js
│   └── feedController.js
├── models/
│   ├── User.js
│   └── Request.js
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── requestRoutes.js
│   ├── feedRoutes.js
│   └── connectionRoutes.js
└── middleware/
    └── authMiddleware.js
```

---

## 🚀 Step 1: Install Dependencies

```bash
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
```

---

## ⚙️ Step 2: MongoDB Connection (`config/db.js`)

```js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
```

---

## 👤 User Model (`models/User.js`)

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio:      { type: String },
  skills:   [{ type: String }],
});

export default mongoose.model("User", userSchema);
```

---

## 💌 Request Model (`models/Request.js`)

```js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["IGNORED", "INTERESTED", "ACCEPTED", "REJECTED"],
    default: "INTERESTED"
  }
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
```

---

## 🧠 Auth Middleware (`middleware/authMiddleware.js`)

```js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
```

---

## 🔐 Auth Controller (`controllers/authController.js`)

```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(400).json({ message: "Signup failed", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};
```

---

## 👤 Profile Controller (`controllers/profileController.js`)

```js
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const viewProfile = async (req, res) => {
  res.json(req.user);
};

export const editProfile = async (req, res) => {
  const { name, bio, skills } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, bio, skills }, { new: true });
  res.json(user);
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(400).json({ message: "Incorrect old password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password updated successfully" });
};
```

---

## 💬 Request Controller (`controllers/requestController.js`)

```js
import Request from "../models/Request.js";

export const sendInterest = async (req, res) => {
  const receiverId = req.params.userId;
  const existing = await Request.findOne({ sender: req.user._id, receiver: receiverId });
  if (existing) return res.status(400).json({ message: "Request already sent" });

  const request = await Request.create({ sender: req.user._id, receiver: receiverId, status: "INTERESTED" });
  res.json(request);
};

export const sendIgnore = async (req, res) => {
  const receiverId = req.params.userId;
  const request = await Request.create({ sender: req.user._id, receiver: receiverId, status: "IGNORED" });
  res.json(request);
};

export const getAcceptedRequests = async (req, res) => {
  const requests = await Request.find({ sender: req.user._id, status: "ACCEPTED" });
  res.json(requests);
};

export const getRejectedRequests = async (req, res) => {
  const requests = await Request.find({ sender: req.user._id, status: "REJECTED" });
  res.json(requests);
};

export const getReceivedRequests = async (req, res) => {
  const requests = await Request.find({ receiver: req.user._id }).populate("sender", "username email");
  res.json(requests);
};
```

---

## 🌐 Feed Controller (`controllers/feedController.js`)

```js
import User from "../models/User.js";

export const getFeed = async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
  res.json(users);
};
```

---

## 🛠 Routes Setup (`routes/*.js`)

### Auth Routes

```js
import express from "express";
import { signup, login, logout } from "../controllers/authController.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
```

### Profile Routes

```js
import express from "express";
import { viewProfile, editProfile, updatePassword } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/view", protect, viewProfile);
router.patch("/edit", protect, editProfile);
router.patch("/password", protect, updatePassword);

export default router;
```

### Request Routes

```js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendInterest, sendIgnore, getAcceptedRequests, getRejectedRequests, getReceivedRequests } from "../controllers/requestController.js";

const router = express.Router();

router.post("/send/interest/:userId", protect, sendInterest);
router.post("/send/ignore/:userId", protect, sendIgnore);
router.get("/review/accepted", protect, getAcceptedRequests);
router.get("/review/rejected", protect, getRejectedRequests);
router.get("/received", protect, getReceivedRequests);

export default router;
```

### Feed Routes

```js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getFeed } from "../controllers/feedController.js";

const router = express.Router();
router.get("/", protect, getFeed);

export default router;
```

---

## 🧩 Server Setup (`server.js`)

```js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/signup", authRoutes);
app.use("/login", authRoutes);
app.use("/logout", authRoutes);
app.use("/profile", profileRoutes);
app.use("/request", requestRoutes);
app.use("/feed", feedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

---

## ✅ Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/devtinder
JWT_SECRET=your_super_secret_key
```

---

Would you like me to add **Swagger UI documentation** (so you can test APIs visually at `/api-docs`)?
