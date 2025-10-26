const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "Rohit ",
    lastName: "Virat",
    email: "kholi@gmail.com",
    password: "Kholi123456",
    age: 37,
  });

  try {
    await user.save();
    res.send("User signed up successfully!");
  } catch (err) {
    res.status(500).send("Error signing up user: " + err.message);
  }
});




// Connect to the database
connectDB()
  .then(() => {
    console.log("Database connection established..");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777..");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });

  