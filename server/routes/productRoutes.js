//Import Express to create products routes
import express from "express";

//Import the product controller functions
import { createProduct } from "../controllers/productController.js";

//Import authentication middleware to protect product routes
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict routes by user role
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Import express-validator to validate product information
import { body, validationResult } from "express-validator";

//Create an Express router for product routes
const router = express.Router();

//Validate product information when creating a product
const productValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Product description is required"),

    body("base_price")
        .notEmpty()
        .withMessage("Base price is required")
        .isFloat({ min: 0 })
        .withMessage("Base price must be 0 or greater"),

    body("image_url")
        .trim()
        .notEmpty()
        .withMessage("Product image is required"),

    body("inventory_quantity")
        .notEmpty()
        .withMessage("Inventory quantity is required")
        .isInt({ min: 0 })
        .withMessage("Inventory quantity must be 0 or greater"),

    body("low_inventory_threshold")
        .notEmpty()
        .withMessage("Low inventory threshold is required")
        .isInt({ min: 0 })
        .withMessage("Low inventory threshold must be 0 or greater")
];

//Check the product validation results
const validateRequest = (request, response, next) => {

    //Get any validation errors from the request
    const errors = validationResult(request);

    //Return the validation errors if any fields are invalid
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors.array()
        });
    }

    //Continue to the controller if validation was successful
    next();
};

//Create a product for the authenticated Bakery Owner's bakery
router.post(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    productValidation,
    validateRequest,
    createProduct
);

//Export the product router so it can be used in the main server file
export default router;