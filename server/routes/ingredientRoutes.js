//Import Express to create Ingredient routes
import express from "express";

//Import the Ingredient controller functions
import {
    createIngredient,
    getBakeryIngredients,
    updateIngredient,
    deleteIngredient
} from "../controllers/ingredientController.js";

//Import authentication middleware to protect Bakery Owner routes
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict routes by user role
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Import express-validator to validate Ingredient information
import {
    body,
    validationResult
} from "express-validator";


//Create an Express router for Ingredient routes
const router = express.Router();


//Validate Ingredient information when creating an Ingredient
const ingredientValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Ingredient name is required"),

    body("unit")
        .trim()
        .notEmpty()
        .withMessage("Ingredient unit is required"),

    body("quantity")
        .notEmpty()
        .withMessage("Ingredient quantity is required")
        .isFloat({
            min: 0
        })
        .withMessage(
            "Ingredient quantity must be 0 or greater"
        ),

    body("low_stock_threshold")
        .notEmpty()
        .withMessage(
            "Low stock threshold is required"
        )
        .isFloat({
            min: 0
        })
        .withMessage(
            "Low stock threshold must be 0 or greater"
        )
];


//Validate fields when updating an Ingredient
const ingredientUpdateValidation = [

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Ingredient name cannot be empty"
        ),

    body("unit")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Ingredient unit cannot be empty"
        ),

    body("quantity")
        .optional()
        .isFloat({
            min: 0
        })
        .withMessage(
            "Ingredient quantity must be 0 or greater"
        ),

    body("low_stock_threshold")
        .optional()
        .isFloat({
            min: 0
        })
        .withMessage(
            "Low stock threshold must be 0 or greater"
        )
];


//Check Ingredient validation results
const validateRequest = (
    request,
    response,
    next
) => {

    //Get any validation errors from the request
    const errors =
        validationResult(request);


    //Return validation errors if any fields are invalid
    if (!errors.isEmpty()) {

        return response.status(400).json({
            errors: errors.array()
        });
    }


    //Continue to the controller
    next();
};


//Get all Ingredients belonging to the authenticated Bakery Owner
router.get(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryIngredients
);


//Create an Ingredient for the authenticated Bakery Owner
router.post(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    ingredientValidation,
    validateRequest,
    createIngredient
);


//Update an Ingredient belonging to the authenticated Bakery Owner
router.patch(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    ingredientUpdateValidation,
    validateRequest,
    updateIngredient
);


//Delete an Ingredient belonging to the authenticated Bakery Owner
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    deleteIngredient
);


//Export the Ingredient router
export default router;