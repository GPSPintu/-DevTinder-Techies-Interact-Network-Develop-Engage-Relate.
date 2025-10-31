// Import the 'validator' library to validate email and password formats
const validator = require('validator');

// Function to validate sign-up data from the request body
const validateSignUpData = (req) => {
    // Destructure required fields from the request body
    // NOTE: Corrected 'emmial' to 'email'
    const { firstName, lastName, email, password } = req.body;

    // 1️⃣ Check if first name and last name are provided
    if (!firstName || !lastName) {
        throw new Error("Name is not valid");
    }

    // 2️⃣ Check if the email is valid using validator's isEmail() function
    else if (!validator.isEmail(email)) {
        throw new Error("Email is not valid");
    }

    // 3️⃣ Check if the password is strong using validator's isStrongPassword()
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }

    // 4️⃣ If all checks pass, return true (optional)
    return true;
};

// Export the function so it can be used in other files
module.exports = {
    validateSignUpData,
};
