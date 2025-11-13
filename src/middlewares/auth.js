// Import the 'jsonwebtoken' library to handle JSON Web Tokens (JWT)
const jwt = require("jsonwebtoken");

// Import the User model from the models folder
const User = require("../models/user");

// Define an asynchronous middleware function for authenticating users
const userAuth = async (req, res, next) => {
  try {
    // Extract the token from the user's cookies
    const { token } = req.cookies;

    // If no token is found, send a 401 (Unauthorized) response
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    // Verify the token using the secret key stored in environment variables
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    // Extract the user's ID (_id) from the decoded token
    const { _id } = decodedObj;

    // Find the user in the database using the ID from the token
    const user = await User.findById(_id);

    // If no user is found, throw an error
    if (!user) {
      throw new Error("User not found");
    }

    // Attach the authenticated user to the request object
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    // If any error occurs (invalid token, no user, etc.), send a 400 response
    res.status(400).send("ERROR: " + err.message);
  }
};

// Export the middleware function so it can be used in other files
module.exports = {
  userAuth,
};
