// Import Express framework
const express = require("express");

// Import database connection function
const connectDB = require("./config/database");

// Create an Express application instance
const app = express();

// Import cookie-parser middleware to parse cookies from requests
const cookieParser = require("cookie-parser");

// Import CORS middleware to handle cross-origin requests
const cors = require("cors");

// Import HTTP module to create a server (required for Socket.io)
const http = require("http");

// Load environment variables from .env file
require("dotenv").config();

// Import the cron job script (runs automatically once imported)
require("./utils/cronjob");

// ---------------------- MIDDLEWARE ----------------------

// Enable CORS for frontend running on localhost:5173 and allow cookies
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies in incoming requests
app.use(cookieParser());

// ---------------------- ROUTES ----------------------

// Import route modules
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

// Mount route modules on root path
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// ---------------------- SOCKET.IO ----------------------

// Create an HTTP server from Express app (required for socket.io)
const server = http.createServer(app);

// Initialize Socket.io and attach it to the server
initializeSocket(server);

// ---------------------- DATABASE & SERVER ----------------------

// Connect to MongoDB using the connectDB function
connectDB()
  .then(() => {
    console.log("Database connection established...");

    // Start the HTTP server on the port specified in .env
    server.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    // Log error if database connection fails
    console.error("Database cannot be connected!!");
  });
