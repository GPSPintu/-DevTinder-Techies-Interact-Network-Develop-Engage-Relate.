// Import mongoose (MongoDB object modeling tool)
const mongoose = require('mongoose');

// Define the structure (schema) for the "User" collection
const userSchema = new mongoose.Schema({

    // First name of the user
    firstName: {
        type: String,   // Data type is String
        required: true  // This field is mandatory (optional but good practice)
    },

    // Last name of the user
    lastName: {
        type: String,   // Data type is String
        required: true
    },

    // User's email address
    email: {
        type: String,   // Data type is String
        unique: true,   // Ensures that no two users have the same email
        required: true, // Must be provided
        trim: true,     // Removes spaces before/after the email
        lowercase: true // Automatically converts email to lowercase
    },

    // Hashed user password (never store plain text passwords!)
    password: {
        type: String,
        required: true
    },

    // Age of the user
    age: {
        type: Number,
        min: 0,         // Minimum allowed value
        max: 120        // Maximum allowed value
    },

    // Gender of the user
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Restrict allowed values
        default: 'Other'                    // Default value if not provided
    }

}, { 
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Export the model so it can be used in other parts of the app
// The first argument ('User') is the collection name (it will become 'users' in MongoDB)
module.exports = mongoose.model('User', userSchema);
