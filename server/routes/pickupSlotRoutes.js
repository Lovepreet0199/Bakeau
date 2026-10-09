//Import Express to create Pickup Slot routes
import express from "express";

//Import the Pickup Slot controller functions
import {
    createPickupSlot,
    getBakeryPickupSlots,
    getPublicPickupSlots,
    updatePickupSlot,
    deletePickupSlot
} from "../controllers/pickupSlotController.js";

//Import authentication middleware to protect Bakery Owner routes
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict routes by user role
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Import express-validator to validate Pickup Slot information
import { body, validationResult } from "express-validator";

//Create an Express router for Pickup Slot routes
const router = express.Router();

//Validate Pickup Slot information when creating a Pickup Slot
const pickupSlotValidation = [

    body("pickup_date")
        .notEmpty()
        .withMessage("Pickup date is required")
        .isISO8601()
        .withMessage("Pickup date must be a valid date"),

    body("pickup_time")
        .trim()
        .notEmpty()
        .withMessage("Pickup time is required")
];


//Validate fields when updating a Pickup Slot
const pickupSlotUpdateValidation = [

    body("pickup_date")
        .optional()
        .isISO8601()
        .withMessage("Pickup date must be a valid date"),

    body("pickup_time")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Pickup time cannot be empty"),

    body("is_available")
        .optional()
        .isBoolean()
        .withMessage("Pickup Slot availability must be true or false")
];


//Check the Pickup Slot validation results
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


//Get available Pickup Slots for a public Bakery storefront
router.get(
    "/public/:bakeryId",
    getPublicPickupSlots
);


//Get all Pickup Slots belonging to the authenticated Bakery Owner
router.get(
    "/bakery",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryPickupSlots
);


//Create a Pickup Slot for the authenticated Bakery Owner
router.post(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    pickupSlotValidation,
    validateRequest,
    createPickupSlot
);


//Update a Pickup Slot belonging to the authenticated Bakery Owner
router.patch(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    pickupSlotUpdateValidation,
    validateRequest,
    updatePickupSlot
);


//Delete a Pickup Slot belonging to the authenticated Bakery Owner
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    deletePickupSlot
);


//Export the Pickup Slot router so it can be used in the main server file
export default router;