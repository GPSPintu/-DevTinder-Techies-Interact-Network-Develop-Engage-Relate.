// console.log("starting a new project")
// ;

const express = require('express');
const app = express();

// Example route
app.get('/', (req, res) => {
  res.send('Hello,from the server world Pintu Pandit!');
});

// Start the server
app.listen(7777, () => {
  console.log('Server is running on http://localhost:7777');
});



