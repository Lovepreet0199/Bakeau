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

//Import Ingredient routes
import ingredientRoutes from "./routes/ingredientRoutes.js";

//Import Payment routes
import paymentRoutes from "./routes/paymentRoutes.js";

//Import Customer routes
import customerRoutes from "./routes/customerRoutes.js";

//Import Reviews routes
import reviewRoutes from "./routes/reviewRoutes.js";

//Import Platform Administrator routes
import adminRoutes from "./routes/adminRoutes.js";

//Import Dashboard routes
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Create an Express app and store it in the app variable
const app = express();

//Allowed frontend websites
const allowedOrigins = [
    "http://localhost:5173",
    "https://bakeau.pages.dev",
    "https://bakeau.com",
    "https://www.bakeau.com"
];


//Allow requests from approved frontend websites
app.use(
    cors({
        origin: function (
            origin,
            callback
        ) {

            //Allow requests without an Origin header
            //such as Postman or server requests
            if (!origin) {

                return callback(
                    null,
                    true
                );
            }


            //Allow approved frontend websites
            if (
                allowedOrigins.includes(
                    origin
                )
            ) {

                return callback(
                    null,
                    true
                );
            }


            //Block unknown websites
            return callback(
                new Error(
                    "Not allowed by CORS"
                )
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
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

//Use Ingredient routes for Bakery inventory requests
app.use("/api/ingredients", ingredientRoutes);

//Use Payment routes for Bakery payment requests
app.use("/api/payments", paymentRoutes);

//Customers routes 
app.use("/api/customers", customerRoutes);

//Review Routes
app.use("/api/reviews", reviewRoutes);

//Use Platform Administrator routes
app.use("/api/admin", adminRoutes);

//Use Dashboard routes for Bakery Owner dashboard requests
app.use("/api/dashboard", dashboardRoutes);

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
