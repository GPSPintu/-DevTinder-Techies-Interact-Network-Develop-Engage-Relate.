// ==============================
// 1️⃣ Import Required Modules
// ==============================
const express = require("express");
const connectDB = require("./config/database"); 
const app = express();// Import the database connection function
const User = require("./models/user"); // Import the User model
// 4️⃣ User Signup Route (POST /signup)
// ==============================
app.post("/signup", async (req, res) => {
  
    // Create a new user instance (for now hardcoded values, can be replaced with req.body)
    const user = new User({
      firstName: "Sachin",
      lastName: "Tendulkar",
      email: "sachin@gmail.com",
      password: "sachin321@",
      age: 50,  
      gender: "Male"  
    });

    // Save the user to the database
    try {
      await user.save();
          res.send(" User Added successful!");
    } catch (error) {
      console.error(" Error adding user:", error);  
      res.status(500).send(" Internal Server Error");
    }
  

    
    // Send a success response
    
  
  
});

// ==============================
// 5️⃣ Connect to Database and Start Server
// ==============================
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully...");
    
    // Start the server on port 7777
    app.listen(7777, () => {
      console.log("🚀 Server is running on port 7777...");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
