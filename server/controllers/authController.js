//Import the User model to work with user accounts in the database.
import User from "../models/User.js";

//Import bcrypt to securely hash user passwords
import bcrypt from "bcryptjs";

//Import jsonwebtoken to create authentication tokens after login
import jwt from "jsonwebtoken";

//Import Node's crypto module to create secure email verification tokens
import crypto from "crypto";

//Import the email helper to send verification emails
import { sendVerificationEmail } from "../utils/email.js";

//Register a new Customer or Bakery Owner
const registerUser = async (request, response) => {
    try {
        //Get the registration information sent in the request
        //This is object destructuring.
        const { first_name, last_name, email, password, role } = request.body;

        //Only Customer & Bakery accounts can register publicly.
        if (role !== "customer" && role !== "bakeryOwner") {
            return response.status(400).json({
                message: "Invalid account type"
            });
        }

        //Check if an account with this email already exists.
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return response.status(400).json({
                message: "An account with this email already exists."
            });
        }

        //Hash the password before storing in the database
        const password_hash = await bcrypt.hash(password, 10);

        //Create a secure random token for email verification
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");

        //Hash the email verification token before storing it in the database
        const emailVerificationTokenHash = crypto
            .createHash("sha256")
            .update(emailVerificationToken)
            .digest("hex");

        //Set the email verification token to expire after 24 hours
        const emailVerificationExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        //Create the new user account in the database.
        const newUser = await User.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password_hash: password_hash,
            role: role,
            email_verification_token_hash: emailVerificationTokenHash,
            email_verification_expires_at: emailVerificationExpiresAt
        });

        //Create the link the user will click to verify their email address
        const verificationUrl =
            `http://localhost:5173/verify-email?token=${emailVerificationToken}`;

        try {
            //Send the verification email to the newly registered user
            await sendVerificationEmail(
                newUser.email,
                verificationUrl
            );

        } catch (emailError) {
            //Log the email error without incorrectly reporting that registration failed
            console.error("Verification email error:", emailError.message);
        }

        //Send the newly created user's safe account information to the client.
        response.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        //Log error in the server terminal for debugging.
        console.error("Registration error: ", error.message);

        //Send a server error response to the client.
        return response.status(500).json({
            message: "Unable to register user"
        });
    }
};

//Verify a user's email address using the verification token
const verifyEmail = async (request, response) => {
    try {

        //Get the email verification token sent by the frontend
        const { token } = request.body;

        //Stop if no verification token was provided
        if (!token) {
            return response.status(400).json({
                message: "Verification token is required"
            });
        }

        //Hash the token so it can be compared with the hashed token stored in MongoDB
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        //Find the user with this verification token and make sure the token has not expired
        const user = await User.findOne({
            email_verification_token_hash: tokenHash,
            email_verification_expires_at: { $gt: new Date() }
        });

        //Stop if the verification token is invalid or has expired
        if (!user) {
            return response.status(400).json({
                message: "Verification link is invalid or has expired"
            });
        }

        //Mark the user's email address as verified
        user.email_verified = true;

        //Remove the verification token because it should only be used once
        user.email_verification_token_hash = null;
        user.email_verification_expires_at = null;

        //Save the email verification changes to MongoDB
        await user.save();

        //Tell the frontend that the email was verified successfully
        return response.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {

        //Log the error for debugging on the server
        console.error("Email verification error:", error.message);

        //Return a generic error message to the frontend
        return response.status(500).json({
            message: "Unable to verify email"
        });
    }
};

//Send a new email verification link to an unverified user
const resendVerificationEmail = async (request, response) => {
    try {

        //Get the email address sent by the frontend
        const { email } = request.body;

        //Stop if no email address was provided
        if (!email) {
            return response.status(400).json({
                message: "Email is required"
            });
        }

        //Find the user account with the provided email
        const user = await User.findOne({
            email: email
        });

        //Stop if no account exists with the provided email
        if (!user) {
            return response.status(404).json({
                message: "User account not found"
            });
        }

        //Stop if the user's email address is already verified
        if (user.email_verified) {
            return response.status(400).json({
                message: "Email is already verified"
            });
        }

        //Create a new secure random token for email verification
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");

        //Hash the new verification token before storing it in the database
        const emailVerificationTokenHash = crypto
            .createHash("sha256")
            .update(emailVerificationToken)
            .digest("hex");

        //Set the new verification token to expire after 24 hours
        const emailVerificationExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        //Replace the old verification token with the new token
        user.email_verification_token_hash = emailVerificationTokenHash;
        user.email_verification_expires_at = emailVerificationExpiresAt;

        //Save the new verification token and expiry time to MongoDB
        await user.save();

        //Create a new verification link using the new verification token
        const verificationUrl =
            `http://localhost:5173/verify-email?token=${emailVerificationToken}`;

        //Send the new verification email to the user
        await sendVerificationEmail(
            user.email,
            verificationUrl
        );

        //Tell the frontend that a new verification email was sent successfully
        return response.status(200).json({
            message: "Verification email sent successfully"
        });

    } catch (error) {

        //Log the error for debugging on the server
        console.error("Resend verification email error:", error.message);

        //Return a generic error message to the frontend
        return response.status(500).json({
            message: "Unable to resend verification email"
        });

    }
};

//Login an existing user
const loginUser = async (request, response) => {
    try {

        //Get the email and password sent in the login request
        const { email, password } = request.body;

        //Find the user account with the provided email
        const user = await User.findOne({ email: email });

        //Check if the user account exists.
        if (!user) {
            return response.status(400).json({
                message: "Invalid email or password"
            });
        }

        //Compare the entered password with the hashed password stored in the database
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        //Check if the entered password matches the user's password
        if (!passwordMatches) {
            return response.status(400).json({
                message: "Invalid email or password"
            });
        }

        //Stop normal login if the user's email address has not been verified
        if (!user.email_verified) {
            return response.status(403).json({
                message: "Please verify your email before continuing",
                emailVerified: false
            });
        }

        //Create a JWT for the successfully authenticated user
        const token = jwt.sign({
            userId: user._id,
            role: user.role
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "6h"
            }
        );

        //Send the JWT and safe user information to the client.
        response.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        //Log the error in the server terminal for debugging
        console.error("Login error: ", error.message);

        //Send a server error response to the client
        return response.status(500).json({
            message: "Unable to login"
        });
    }
};


//Export the authentication controller functions so they can be used in the authentication routes
export {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail
};