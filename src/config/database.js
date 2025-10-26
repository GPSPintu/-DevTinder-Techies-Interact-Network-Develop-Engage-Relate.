const mongoose = require('mongoose');
// const config = require('./config'); // only if you have a config.js file

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://infopintuwork_db_user:51RHkZX1uLp26HS9@cluster0.qpjhid0.mongodb.net/DevTinder"
    );
};

module.exports = connectDB;



