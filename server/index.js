//Import Express to create Bakeau server/application
import express from "express";

//for ES6, this import makes the environment variables available THROUGHOUT the app
import "dotenv/config";

// Create an Express app and store it in the app variable
const app = express();

//Port used by the Bakeau backend
const port = process.env.PORT || 3000;

// Test route
app.get("/", (request, response) => {
    response.send("Bakeau API is running with Nodemon");
});

// Start the server
app.listen(port, () => {
    console.log(`Bakeau server is running on port ${port}`);
});
