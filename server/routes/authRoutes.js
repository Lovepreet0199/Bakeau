//Import Express to create authentication routes
import express from "express";

//Import the authentication controller functions
import { registerUser, loginUser } from "../controllers/authController.js";

//Import body to validate request fields and validationResult to check for validation errors
import { body, validationResult } from "express-validator";

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
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("role")
        .notEmpty()
        .withMessage("Account type is required")
        .isIn(["customer", "bakeryOwner"])
        .withMessage("Account type must be Customer or Bakery Owner")
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

//Register a new Customer or a Bakery Owner.
router.post("/register", registerValidation, validateRequest, registerUser);

//Login an existing user
router.post("/login", loginValidation, validateRequest, loginUser);

//Export the authentication router so it can be used in the main server file
export default router;