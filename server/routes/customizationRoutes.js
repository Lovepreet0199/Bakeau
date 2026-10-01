//Import Express to create customization routes
import express from "express";

//Import express-validator to validate customization information
import { body, validationResult } from "express-validator";

//Import customization controller functions to manage product customization groups
import {
    createCustomizationGroup,
    getCustomizationGroups,
    updateCustomizationGroup,
    deleteCustomizationGroup
} from "../controllers/customizationController.js";

//Import authentication middleware to verify the logged-in user
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict customization management to Bakery Owners
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Create an Express router for customization routes
const router = express.Router();

const customizationGroupValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Customization group name is required"),

    body("is_required")
        .isBoolean()
        .withMessage("is_required must be true or false")
];

//Check the request for validation errors before continuing
const validateRequest = (request, response, next) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors.array()
        });
    }

    next();
};

//Create a customization group for a product owned by the authenticated Bakery Owner
router.post(
    "/products/:productId/groups",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    customizationGroupValidation,
    validateRequest,
    createCustomizationGroup
);

//Get all customization groups for a product owned by the authenticated Bakery Owner
router.get(
    "/products/:productId/groups",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getCustomizationGroups
);

//Update a customization group owned by the authenticated Bakery Owner
router.put(
    "/groups/:groupId",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    customizationGroupValidation,
    validateRequest,
    updateCustomizationGroup
);

//Delete a customization group owned by the authenticated Bakery Owner
router.delete(
    "/groups/:groupId",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    deleteCustomizationGroup
);

//Export the router so it can be used in the main server file
export default router;