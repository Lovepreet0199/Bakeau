//Import the User model to work with user accounts in the database.
import User from "../models/User.js";

//Import bcrypt to securely hash user passwords
import bcrypt from "bcryptjs";

//Import jsonwebtoken to create authentication tokens after login
import jwt from "jsonwebtoken";

//Import Node's crypto module to create secure email verification tokens
import crypto from "crypto";

//Import email helpers
import {
    sendVerificationEmail,
    sendPasswordResetEmail
} from "../utils/email.js";

//Register a new Customer or Bakery Owner
const registerUser = async (request, response) => {
    try {
        //Get the registration information sent in the request
        //This is object destructuring.
        const {
            first_name,
            last_name,
            email,
            phone_number,
            password,
            role
        } = request.body;

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
            phone_number: phone_number || null,
            password_hash: password_hash,
            role: role,
            email_verification_token_hash: emailVerificationTokenHash,
            email_verification_expires_at: emailVerificationExpiresAt
        });

        //Create the link the user will click to verify their email address
        const verificationUrl =
            `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

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
                phone_number: newUser.phone_number,
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
            `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

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

//Creates and emails a password reset link
const forgotPassword = async (
    request,
    response
) => {

    try {

        //Get email and optional Bakery slug
        const {
            email,
            bakery_slug
        } = request.body;


        //Normalize the email address
        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        //Find the User account
        const user =
            await User.findOne({
                email:
                    normalizedEmail
            });


        /*
            Always return the same response.

            This prevents someone from using
            the Forgot Password form to check
            which email addresses have Bakeau accounts.
        */
        if (!user) {

            return response.status(200).json({

                message:
                    "If an account exists with that email, a password reset link has been sent."
            });
        }


        //Create a secure random password reset token
        const passwordResetToken =
            crypto
                .randomBytes(32)
                .toString("hex");


        //Hash the token before storing it in MongoDB
        const passwordResetTokenHash =
            crypto
                .createHash("sha256")
                .update(
                    passwordResetToken
                )
                .digest("hex");


        //Password reset link expires after 1 hour
        const passwordResetExpiresAt =
            new Date(
                Date.now() +
                60 * 60 * 1000
            );


        //Store the hashed reset token
        user.password_reset_token_hash =
            passwordResetTokenHash;

        user.password_reset_expires_at =
            passwordResetExpiresAt;


        //Save reset information
        await user.save();


        //Create Customer or Bakery Owner reset URL
        const resetUrl =
            bakery_slug
                ? `${process.env.CLIENT_URL}/store/${encodeURIComponent(
                    bakery_slug
                )}/reset-password?token=${passwordResetToken}`
                : `${process.env.CLIENT_URL}/reset-password?token=${passwordResetToken}`;


        try {

            //Email the reset link
            await sendPasswordResetEmail(
                user.email,
                resetUrl
            );

        } catch (emailError) {

            //Remove reset token if the email failed
            user.password_reset_token_hash =
                null;

            user.password_reset_expires_at =
                null;

            await user.save();


            console.error(
                "Password reset email error:",
                emailError.message
            );


            return response.status(500).json({

                message:
                    "Unable to send password reset email"
            });
        }


        //Return generic success message
        return response.status(200).json({

            message:
                "If an account exists with that email, a password reset link has been sent."
        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error.message
        );


        return response.status(500).json({

            message:
                "Unable to process password reset request"
        });
    }
};

//Resets a User password using a valid reset token
const resetPassword = async (
    request,
    response
) => {

    try {

        //Get reset token and new password
        const {
            token,
            password
        } = request.body;


        //Hash the token received from the reset link
        const passwordResetTokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        //Find User with matching token that has not expired
        const user =
            await User.findOne({

                password_reset_token_hash:
                    passwordResetTokenHash,

                password_reset_expires_at: {
                    $gt:
                        new Date()
                }
            });


        //Stop if token is invalid or expired
        if (!user) {

            return response.status(400).json({

                message:
                    "Password reset link is invalid or has expired"
            });
        }


        //Hash the new password
        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );


        //Save the new password
        user.password_hash =
            passwordHash;


        //Remove reset token so it cannot be reused
        user.password_reset_token_hash =
            null;

        user.password_reset_expires_at =
            null;


        //Save updated User
        await user.save();


        return response.status(200).json({

            message:
                "Password reset successfully"
        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error.message
        );


        return response.status(500).json({

            message:
                "Unable to reset password"
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

//Gets the authenticated user's account information
const getMyAccount = async (request, response) => {

    try {

        //Get the authenticated user's ID
        const userId =
            request.user.userId;


        //Find the user without returning their password
        const user = await User.findById(userId)
            .select(
                "first_name last_name email phone_number role email_verified"
            );


        //Stop if the user no longer exists
        if (!user) {

            return response.status(404).json({
                message: "User account not found"
            });
        }


        //Return safe account information
        return response.status(200).json({
            user: user
        });


    } catch (error) {

        //Log the account loading error
        console.error(
            "Get account error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message: "Unable to load account"
        });
    }
};


//Updates the authenticated user's account information
const updateMyAccount = async (request, response) => {

    try {

        //Get the authenticated user's ID
        const userId =
            request.user.userId;


        //Get the account information sent by the frontend
        const {
            first_name,
            last_name,
            email,
            phone_number
        } = request.body;


        //Find the authenticated user
        const user =
            await User.findById(userId);


        //Stop if the user no longer exists
        if (!user) {

            return response.status(404).json({
                message: "User account not found"
            });
        }


        //Normalize the new email address
        const normalizedEmail =
            email.trim().toLowerCase();


        //Check whether the email address is changing
        const emailChanged =
            normalizedEmail !== user.email;


        //Check whether another account already uses the new email
        if (emailChanged) {

            const existingUser =
                await User.findOne({
                    email: normalizedEmail,
                    _id: {
                        $ne: userId
                    }
                });


            //Stop if another user already owns the email
            if (existingUser) {

                return response.status(400).json({
                    message:
                        "An account with this email already exists."
                });
            }
        }


        //Update the user's personal information
        user.first_name =
            first_name.trim();

        user.last_name =
            last_name.trim();

        user.email =
            normalizedEmail;

        user.phone_number =
            phone_number?.trim() || null;


        //Require verification again if the email changed
        if (emailChanged) {

            //Create a secure email verification token
            const emailVerificationToken =
                crypto.randomBytes(32).toString("hex");


            //Hash the verification token before storing it
            const emailVerificationTokenHash =
                crypto
                    .createHash("sha256")
                    .update(emailVerificationToken)
                    .digest("hex");


            //Set the verification token expiry
            const emailVerificationExpiresAt =
                new Date(
                    Date.now() +
                    24 * 60 * 60 * 1000
                );


            //Mark the new email as unverified
            user.email_verified = false;

            user.email_verification_token_hash =
                emailVerificationTokenHash;

            user.email_verification_expires_at =
                emailVerificationExpiresAt;


            //Create the verification link
            const verificationUrl =
                `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;


            try {

                //Send verification to the new email address
                await sendVerificationEmail(
                    normalizedEmail,
                    verificationUrl
                );

            } catch (emailError) {

                //Log email errors without losing the account update
                console.error(
                    "Account email verification error:",
                    emailError.message
                );
            }
        }


        //Save the updated user
        await user.save();


        //Return safe updated account information
        return response.status(200).json({

            message:
                emailChanged
                    ? "Account updated. Please verify your new email address."
                    : "Account updated successfully",

            emailChanged: emailChanged,

            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
                email_verified: user.email_verified
            }
        });


    } catch (error) {

        //Log the account update error
        console.error(
            "Update account error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message: "Unable to update account"
        });
    }
};


//Changes the authenticated user's password
const changeMyPassword = async (request, response) => {

    try {

        //Get the authenticated user's ID
        const userId =
            request.user.userId;


        //Get the current and new passwords
        const {
            current_password,
            new_password
        } = request.body;


        //Find the authenticated user
        const user =
            await User.findById(userId);


        //Stop if the user no longer exists
        if (!user) {

            return response.status(404).json({
                message: "User account not found"
            });
        }


        //Check the current password
        const passwordMatches =
            await bcrypt.compare(
                current_password,
                user.password_hash
            );


        //Stop if the current password is incorrect
        if (!passwordMatches) {

            return response.status(400).json({
                message: "Current password is incorrect"
            });
        }


        //Prevent reusing the same password
        const samePassword =
            await bcrypt.compare(
                new_password,
                user.password_hash
            );


        //Stop if the new password matches the old password
        if (samePassword) {

            return response.status(400).json({
                message:
                    "New password must be different from your current password"
            });
        }


        //Hash the new password
        const passwordHash =
            await bcrypt.hash(
                new_password,
                10
            );


        //Store the new password
        user.password_hash =
            passwordHash;


        //Save the user
        await user.save();


        //Return successful password change
        return response.status(200).json({
            message: "Password changed successfully"
        });


    } catch (error) {

        //Log the password change error
        console.error(
            "Change password error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message: "Unable to change password"
        });
    }
};

//Export authentication controller functions
export {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    getMyAccount,
    updateMyAccount,
    changeMyPassword
};