//Import Express to create products routes
import express from "express";

//Import upload middleware to receive product image files
import upload from "../middleware/upload.js";

//Import the product controller functions
import {
    createProduct,
    uploadProductImage,
    getMyProducts,
    getMyProductById,
    updateProductStatus,
    updateProductAvailability,
    updateProductFeatured,
    updateMyProduct,
    deleteMyProduct
} from "../controllers/productController.js";

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

    body("category")
        .trim()
        .notEmpty()
        .withMessage("Product category is required"),

    body("status")
        .notEmpty()
        .withMessage("Product status is required")
        .isIn(["draft", "active", "hidden"])
        .withMessage("Product status must be draft, active, or hidden"),

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
        .if(body("stock_type").equals("track_inventory"))
        .notEmpty()
        .withMessage("Inventory quantity is required")
        .isInt({ min: 0 })
        .withMessage("Inventory quantity must be 0 or greater"),


    body("is_available")
        .isBoolean()
        .withMessage("Product availability must be true or false"),

    body("is_featured")
        .isBoolean()
        .withMessage("Featured value must be true or false"),

    body("low_inventory_threshold")
        .if(body("stock_type").equals("track_inventory"))
        .notEmpty()
        .withMessage("Low inventory threshold is required")
        .isInt({ min: 0 })
        .withMessage("Low inventory threshold must be 0 or greater"),

    body("stock_type")
        .notEmpty()
        .withMessage("Stock type is required")
        .isIn(["made_to_order", "track_inventory"])
        .withMessage("Stock type must be made to order or track inventory"),

    body("minimum_preparation_notice")
        .isInt({ min: 0 })
        .withMessage("Minimum preparation notice must be 0 or greater"),

    body("maximum_orders_per_day")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Maximum orders per day must be at least 1"),

    body("available_pickup_days")
        .isArray()
        .withMessage("Available pickup days must be an array"),

    body("available_pickup_days.*")
        .isIn([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday"
        ])
        .withMessage("Please select valid pickup days"),
];

//Validate a product publishing status update
const productStatusValidation = [
    body("status")
        .notEmpty()
        .withMessage("Product status is required")
        .isIn(["draft", "active", "hidden"])
        .withMessage("Product status must be draft, active, or hidden")
];

//Validate a product availability update
const productAvailabilityValidation = [
    body("is_available")
        .isBoolean()
        .withMessage("Product availability must be true or false")
];

//Validate a product featured update
const productFeaturedValidation = [
    body("is_featured")
        .isBoolean()
        .withMessage("Featured value must be true or false")
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

//Get all products belonging to the authenticated Bakery Owner's bakery
router.get(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getMyProducts
);

//Upload a product image for the authenticated Bakery Owner
router.post(
    "/uploads/image",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    upload.single("product_image"),
    uploadProductImage
);

//Get one product belonging to the authenticated Bakery Owner's bakery
router.get(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getMyProductById
);

//Create a product for the authenticated Bakery Owner's bakery
router.post(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    productValidation,
    validateRequest,
    createProduct
);

//Update only a product's publishing status
router.patch(
    "/:id/status",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    productStatusValidation,
    validateRequest,
    updateProductStatus
);

//Update only a product's availability
router.patch(
    "/:id/availability",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    productAvailabilityValidation,
    validateRequest,
    updateProductAvailability
);

//Update only a product's featured state
router.patch(
    "/:id/featured",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    productFeaturedValidation,
    validateRequest,
    updateProductFeatured
);

//Update a product belonging to the authenticated Bakery Owner's bakery
router.put(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    productValidation,
    validateRequest,
    updateMyProduct
);

//Delete a product belonging to the authenticated Bakery Owner's bakery
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    deleteMyProduct
);

//Export the product router so it can be used in the main server file
export default router;