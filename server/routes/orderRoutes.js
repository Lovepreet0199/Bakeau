//Import Express to create Order routes
import express from "express";

//Import Order controller functions
import {
    createOrder,
    getBakeryOrders,
    getBakeryOrderById,
    updateBakeryOrderStatus,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    updateMyPendingOrder
} from "../controllers/orderController.js";

//Import authentication middleware to protect Order routes
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict routes by user role
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Import express-validator to validate Order information
import { body, validationResult } from "express-validator";

//Create an Express router for Order routes
const router = express.Router();


//Validate basic Order information when creating an Order
const orderValidation = [

    body("bakery_id")
        .notEmpty()
        .withMessage("Bakery is required")
        .isMongoId()
        .withMessage("Bakery ID must be valid"),

    body("pickup_slot_id")
        .notEmpty()
        .withMessage("Pickup slot is required")
        .isMongoId()
        .withMessage("Pickup slot ID must be valid"),

    body("pickup_time")
        .notEmpty()
        .withMessage("Pickup time is required")
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
        .withMessage("Pickup time must use HH:mm format"),

    body("contact.first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("contact.last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("contact.email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid"),

    body("contact.phone_number")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required"),

    body("bakery_note")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Order note cannot be more than 300 characters"),

    body("items")
        .isArray({ min: 1 })
        .withMessage("Order must contain at least one product"),

    body("items.*.product_id")
        .notEmpty()
        .withMessage("Product ID is required")
        .isMongoId()
        .withMessage("Product ID must be valid"),

    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Product quantity must be at least 1"),

    body("items.*.customization_option_ids")
        .optional()
        .isArray()
        .withMessage("Customization options must be an array")
];


//Validate Bakery Owner Order status updates
const orderStatusValidation = [

    body("status")
        .notEmpty()
        .withMessage("Order status is required")
        .isIn([
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "completed",
            "cancelled"
        ])
        .withMessage("Order status is invalid")
];


//Check validation results
const validateRequest = (
    request,
    response,
    next
) => {

    //Get validation errors
    const errors = validationResult(request);

    //Return validation errors if any fields are invalid
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors.array()
        });
    }

    //Continue to the controller
    next();
};


//Create a new Order for the authenticated Customer
router.post(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    orderValidation,
    validateRequest,
    createOrder
);


//Get all Orders belonging to the authenticated Customer
router.get(
    "/mine",
    authenticateUser,
    authorizeRoles("customer"),
    getMyOrders
);


//Get one Order belonging to the authenticated Customer
router.get(
    "/mine/:id",
    authenticateUser,
    authorizeRoles("customer"),
    getMyOrderById
);


//Get all Orders belonging to the authenticated Bakery Owner
router.get(
    "/bakery",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryOrders
);


//Get one Order belonging to the authenticated Bakery Owner
router.get(
    "/bakery/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryOrderById
);


//Update the status of a Bakery Order
router.patch(
    "/:id/status",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    orderStatusValidation,
    validateRequest,
    updateBakeryOrderStatus
);

//Customer updates one pending Order
router.patch(
    "/mine/:id",
    authenticateUser,
    authorizeRoles("customer"),
    updateMyPendingOrder
);

//Customer cancels one pending Order
router.patch(
    "/mine/:id/cancel",
    authenticateUser,
    authorizeRoles("customer"),
    cancelMyOrder
);

//Export the Order router
export default router;