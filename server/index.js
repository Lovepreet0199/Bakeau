//Import Express to create Bakeau server/application
import express from "express";
//for ES6, this import makes the environment variables available THROUGHOUT the app
import "dotenv/config";

import connectDB from "./config/db.js";

//Import authentication routes
import authRoutes from "./routes/authRoutes.js";

//Import bakery routes
import bakeryRoutes from "./routes/bakeryRoutes.js";

// Create an Express app and store it in the app variable
const app = express();

//Allow Express to read JSON data send in request bodies
app.use(express.json());

//Use authentication routes for requests starting with /api/auth
app.use("/api/auth", authRoutes);

//User bakery routes for requests starting with /api/bakeries
app.use("/api/bakeries", bakeryRoutes);

//Connect to MongoDB
connectDB();

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
