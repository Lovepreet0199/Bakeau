// Import Mongoose to create the User Schema and model
import mongoose from "mongoose";

//Define the structure of a user account in Bakeau
const userSchema = new mongoose.Schema({

    //First name of the registered user
    first_name: {
        type: String,
        required: true,
        trim: true
    },

    //Last name of the registered user
    last_name: {
        type: String,
        required: true,
        trim: true
    },

    //Email of the registered user
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    //Securely hashed password used for authentication
    password_hash: {
        type: String,
        required: true
    },

    //Role for the registered user
    role: {
        type: String,
        required: true,
        enum: ["customer", "bakeryOwner", "platformAdmin"]
    },

    //Stores the hashed password reset token when a password reset is required
    password_reset_token_hash: {
        type: String,
        default: null
    },

    //Stores when the password reset token expires
    password_reset_expires_at: {
        type: Date,
        default: null
    }

}, {

    //Automatically records when the user is created and last updated.
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Create the User model using the User Schema
const User = mongoose.model("User", userSchema);

//Export the User model so it can be used in other files
export default User;