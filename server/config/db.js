//Import Mongoose to connect this application to MongoDB
import mongoose from "mongoose";
import dns from "node:dns";

//Use public DNS servers for MongoDB Atlas SRV lookup
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Connect Bakeau to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed: ", error.message);
        process.exit(1);
    }
};

export default connectDB;