// Allows the React frontend to communicate with the Express backend
import cors from "cors";

//Import Express to create Bakeau server/application
import express from "express";

//for ES6, this import makes the environment variables available THROUGHOUT the app
import "dotenv/config";

import connectDB from "./config/db.js";

//Import authentication routes
import authRoutes from "./routes/authRoutes.js";

//Import bakery routes
import bakeryRoutes from "./routes/bakeryRoutes.js";

//Import product routes
import productRoutes from "./routes/productRoutes.js";

//Import customization routes
import customizationRoutes from "./routes/customizationRoutes.js";

//Import Pickup Slot routes
import pickupSlotRoutes from "./routes/pickupSlotRoutes.js";

//Import Order routes
import orderRoutes from "./routes/orderRoutes.js";

// Create an Express app and store it in the app variable
const app = express();

// Allows requests from the Bakeau React frontend during development
app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

//Allow Express to read JSON data send in request bodies
app.use(express.json());

//Use authentication routes for requests starting with /api/auth
app.use("/api/auth", authRoutes);

//User bakery routes for requests starting with /api/bakeries
app.use("/api/bakeries", bakeryRoutes);

//Use product routes for product-related API requests
app.use("/api/products", productRoutes);

//Use customization routes for customization API requests
app.use("/api/customizations", customizationRoutes);

//Use Pickup Slot routes for Pickup Slot API requests
app.use("/api/pickup-slots", pickupSlotRoutes);

//Use Order routes for Customer and Bakery Owner order requests
app.use("/api/orders", orderRoutes);

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
