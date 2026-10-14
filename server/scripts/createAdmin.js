//Import environment variables
import "dotenv/config";

//Import Mongoose so the script can disconnect after finishing
import mongoose from "mongoose";

//Import bcryptjs for Password hashing
import bcrypt from "bcryptjs";

//Import existing MongoDB connection
import connectDB from "../config/db.js";

//Import User model
import User from "../models/User.js";


//Creates the Bakeau Platform Administrator
async function createAdmin() {

    try {

        //Connect using Bakeau's existing MongoDB connection
        //This also uses the public DNS workaround from config/db.js
        await connectDB();


        //Platform Admin credentials
        const adminEmail =
            "admin@bakeau.com";

        const adminPassword =
            "Admin1234";


        //Check if Platform Admin already exists
        const existingAdmin =
            await User.findOne({
                email:
                    adminEmail
            });


        if (existingAdmin) {

            console.log(
                "Platform Admin already exists."
            );

            return;
        }


        //Hash Platform Admin password
        const passwordHash =
            await bcrypt.hash(
                adminPassword,
                10
            );


        //Create Platform Admin account
        await User.create({

            first_name:
                "Bakeau",

            last_name:
                "Admin",

            email:
                adminEmail,

            password_hash:
                passwordHash,

            role:
                "platformAdmin",

            //Admin is created internally,
            //so Email verification is already complete
            email_verified:
                true,

            email_verification_token_hash:
                null,

            email_verification_expires_at:
                null
        });


        console.log(
            "Platform Admin created successfully."
        );

        console.log(
            `Email: ${adminEmail}`
        );


    } catch (error) {

        console.error(
            "Create Admin error:",
            error.message
        );

    } finally {

        //Disconnect after the script finishes
        await mongoose.disconnect();
    }
}


//Run Platform Admin creation
createAdmin();