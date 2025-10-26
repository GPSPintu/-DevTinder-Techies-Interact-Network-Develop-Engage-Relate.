const mongoose = require('mongoose');
// const config = require('./config'); // only if you have a config.js file

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://Namastevdev:1wAIChozbleEa9Uv@namastenode.blddkgp.mongodb.net/DevTinder"
    );
};

module.exports = connectDB;



