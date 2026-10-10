//Import Express to create authentication routes
import express from "express";

//Import the authentication controller functions
import {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail,
    getMyAccount,
    updateMyAccount,
    changeMyPassword
} from "../controllers/authController.js";

//Import body to validate request fields and validationResult to check for validation errors
import { body, validationResult } from "express-validator";

//Importing the middlewares
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Validation rules for user registration
const registerValidation = [
    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain an uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain a lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain a number")
];

//Validation rules for user login
const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

//Validation rules for updating an account
const accountValidation = [

    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body("phone_number")
        .optional({
            values: "falsy"
        })
        .trim()
];


//Validation rules for changing a password
const passwordChangeValidation = [

    body("current_password")
        .notEmpty()
        .withMessage("Current password is required"),

    body("new_password")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({
            min: 8
        })
        .withMessage(
            "Password must be at least 8 characters long"
        )
        .matches(/[A-Z]/)
        .withMessage(
            "Password must contain an uppercase letter"
        )
        .matches(/[a-z]/)
        .withMessage(
            "Password must contain a lowercase letter"
        )
        .matches(/[0-9]/)
        .withMessage(
            "Password must contain a number"
        )
];

//Check the request for validation errors.
const validateRequest = (request, response, next) => {

    //Get any validation errors found in the request
    const errors = validationResult(request);

    //If validation errors exist, stop the request and return them
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors.array()
        });
    }

    //Continue to the next function if there are no validation errors
    next();
};

//Create a router for authentication routes
const router = express.Router();

// Register a new Bakery Owner
router.post(
    "/register/bakery-owner",
    registerValidation,
    validateRequest,
    (request, response) => {
        // The backend decides the account role, not the frontend
        request.body.role = "bakeryOwner";

        return registerUser(request, response);
    }
);

// Register a new Customer
router.post(
    "/register/customer",
    registerValidation,
    validateRequest,
    (request, response) => {
        // The backend decides the account role, not the frontend
        request.body.role = "customer";

        return registerUser(request, response);
    }
);

//Verify a user's email address
router.post(
    "/verify-email",
    verifyEmail
);

//Send a new verification email to an unverified user
router.post(
    "/resend-verification",
    resendVerificationEmail
);

//Login an existing user
router.post(
    "/login",
    loginValidation,
    validateRequest,
    loginUser
);


//Test route for authenticated Bakery Owners
router.get(
    "/bakery-owner-test",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    (request, response) => {
        //Return a success response with the authenticated user's information
        response.status(200).json({
            message: "Bakery Owner access granted",
            user: request.user
        });
    }
);

//Get the authenticated user's account
router.get(
    "/me",
    authenticateUser,
    getMyAccount
);


//Update the authenticated user's account
router.put(
    "/me",
    authenticateUser,
    accountValidation,
    validateRequest,
    updateMyAccount
);


//Change the authenticated user's password
router.patch(
    "/me/password",
    authenticateUser,
    passwordChangeValidation,
    validateRequest,
    changeMyPassword
);

//Export the authentication router so it can be used in the main server file
export default router;