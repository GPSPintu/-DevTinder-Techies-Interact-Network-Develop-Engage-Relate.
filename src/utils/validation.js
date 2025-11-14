// Import the 'validator' library for validating strings like emails and passwords
const validator = require("validator");


// Function to validate user data during sign-up
const validateSignUpData = (req) => {
  // Destructure the required fields from the request body
  const { firstName, lastName, emailId, password } = req.body;

  // Check if the user's first and last name are provided
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");             // Throw error if name fields are missing
  } 
  // Check if the provided email is valid
  else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");            // Throw error if email is invalid
  } 
  // Check if the password is strong enough (uppercase, lowercase, number, symbol)
  else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!"); // Throw error if password is weak
  }
};


// Function to validate which fields can be edited in a user profile
const validateEditProfileData = (req) => {
  // Define the list of allowed fields that can be updated
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  // Check that every field in the request body is part of the allowed fields
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  // Return true if all fields are allowed; false otherwise
  return isEditAllowed;
};


// Export both validation functions for use in other files
module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
