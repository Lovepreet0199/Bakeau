//Import Express to create bakery routes
import express from "express";

//Import express-validator to validate bakery information
import { body, validationResult, param } from "express-validator";

//Import upload middleware to receive bakery image files
import upload from "../middleware/upload.js";

//Import the Stripe controller functions used for bakery payment setup
import {
    connectStripeAccount,
    getStripeStatus
} from "../controllers/stripeController.js";

//Import the bakery controller functions
import {
    createBakery,
    completeBakerySetup,
    getMyBakery,
    updateMyBakery,
    updateBakeryPaymentSettings,
    uploadBakeryLogo,
    uploadBakeryImage,
    getPublicBakery,
    getPublicBakeryProducts,
    getPublicBakeryProduct,
    getPublicBakeryProductQuote,
    getPublicBakeryCartQuote
} from "../controllers/bakeryController.js";

//Import authentication middleware to protect bakery routes
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict routes by user role
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Create an Express router for bakery routes
const router = express.Router();

//Validate bakery information when creating or updating a bakery
const bakeryValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Bakery name is required"),

    body("contact_email")
        .trim()
        .notEmpty()
        .withMessage("Contact email is required")
        .isEmail()
        .withMessage("Please enter a valid contact email"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Bakery description is required"),

    body("pickup_instructions")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Pickup instructions cannot exceed 1000 characters"),

    body("cancellation_policy")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Cancellation policy cannot exceed 1000 characters"),

    body("custom_order_policy")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Custom order policy cannot exceed 1000 characters"),

    body("additional_policy_information")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Additional policy information cannot exceed 1000 characters"),

    body("address.street")
        .trim()
        .notEmpty()
        .withMessage("Street address is required"),

    body("address.city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

    body("address.province")
        .trim()
        .notEmpty()
        .withMessage("Province is required"),

    body("address.postal_code")
        .trim()
        .notEmpty()
        .withMessage("Postal code is required"),

    body("minimum_order_notice")
        .isInt({ min: 1 })
        .withMessage("Minimum order notice must be at least 1 hour"),

    body("timezone")
        .isIn([
            "America/Toronto",
            "America/Winnipeg",
            "America/Edmonton",
            "America/Vancouver",
            "America/Halifax",
            "America/St_Johns"
        ])
        .withMessage("Please select a valid timezone"),

    body("currency")
        .optional()
        .isIn(["CAD", "USD", "INR", "GBP", "EUR"])
        .withMessage("Please select a valid currency"),

    body("maximum_orders_per_day")
        .isInt({ min: 1 })
        .withMessage("Maximum orders per day must be at least 1"),

    body("accepting_orders")
        .isBoolean()
        .withMessage("Accepting orders must be true or false"),

    body("payment_rule")
        .isIn(["full", "deposit"])
        .withMessage("Payment rule must be full or deposit"),

    body("deposit_percentage")
        .if(body("payment_rule").equals("deposit"))
        .isFloat({ min: 1, max: 100 })
        .withMessage("Deposit percentage must be between 1 and 100"),

    body("allow_manual_payment")
        .isBoolean()
        .withMessage("Manual payment setting must be true or false")
];

//Validate bakery payment settings
const paymentSettingsValidation = [

    body("payment_rule")
        .isIn(["full", "deposit"])
        .withMessage("Payment rule must be full or deposit"),

    body("deposit_percentage")
        .if(body("payment_rule").equals("deposit"))
        .isFloat({ min: 1, max: 100 })
        .withMessage("Deposit percentage must be between 1 and 100"),

    body("allow_manual_payment")
        .isBoolean()
        .withMessage("Manual payment setting must be true or false")
];

//Validate information used to calculate a public Product price quote
const productQuoteValidation = [

    //Make sure the Product ID from the URL is a valid MongoDB ID
    param("productId")
        .isMongoId()
        .withMessage("Invalid Product ID"),

    //Make sure the Customer orders at least one Product
    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    //Make sure customization Option IDs are sent as an array
    body("customization_option_ids")
        .optional()
        .isArray()
        .withMessage("Customization options must be an array"),

    //Make sure every selected customization Option has a valid MongoDB ID
    body("customization_option_ids.*")
        .optional()
        .isMongoId()
        .withMessage("Invalid customization option")
];

//Validate public Cart quote information
const cartQuoteValidation = [

    //Make sure Cart items are sent as an array
    body("items")
        .isArray({ min: 1 })
        .withMessage("Cart must contain at least one Product"),


    //Make sure every Cart Product has a valid MongoDB ID
    body("items.*.product_id")
        .isMongoId()
        .withMessage("Invalid Product ID"),


    //Make sure every Cart Product has a valid quantity
    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Product quantity must be at least 1"),


    //Make sure customization Option IDs are sent as arrays
    body("items.*.customization_option_ids")
        .optional()
        .isArray()
        .withMessage("Customization options must be an array"),


    //Make sure every customization Option ID is valid
    body("items.*.customization_option_ids.*")
        .optional()
        .isMongoId()
        .withMessage("Invalid customization option")
];

//Check the bakery validation results
const validateRequest = (request, response, next) => {

    //Get any validation errors from the request
    const errors = validationResult(request);

    //Return the validation errors if any fields are invalid
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors.array()
        });
    }

    //Continue to the controller if the validation was successful
    next();
};

//Create a bakery -only authenticated Bakery Owners can access this route
router.post(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    bakeryValidation,
    validateRequest,
    createBakery
);

//Get the authenticated Bakery Owner's bakery
router.get(
    "/mine",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getMyBakery
);

//Update the authenticated Bakery Owner's bakery
router.put(
    "/mine",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    bakeryValidation,
    validateRequest,
    updateMyBakery
);

//Upload the authenticated Bakery Owner's storefront logo
router.post(
    "/uploads/logo",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    upload.single("logo"),
    uploadBakeryLogo
);

//Upload the Bakery Owner's image for the About section
router.post(
    "/uploads/bakery-image",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    upload.single("bakery_image"),
    uploadBakeryImage
);

//Create or continue Stripe onboarding for the authenticated Bakery Owner
router.post(
    "/stripe/connect",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    connectStripeAccount
);

//Update payment settings for the authenticated Bakery Owner
router.patch(
    "/mine/payment-settings",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    paymentSettingsValidation,
    validateRequest,
    updateBakeryPaymentSettings
);

//Marks the Bakery Owner setup process as completed
router.patch(
    "/mine/complete-setup",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    completeBakerySetup
);

//Get the Stripe connection status for the authenticated Bakery Owner
router.get(
    "/stripe/status",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getStripeStatus
);

//Get an approved bakery storefront using its public slug
router.get(
    "/public/:slug",
    getPublicBakery
);

//Get the public products for an approved bakery using its slug
router.get(
    "/public/:slug/products",
    getPublicBakeryProducts
);

//Get on public product and its customization details for an approved bakery
router.get(
    "/public/:slug/products/:productId",
    getPublicBakeryProduct
);

//Calculate a trusted backend price quote for a public Product
router.post(
    "/public/:slug/products/:productId/quote",
    productQuoteValidation,
    validateRequest,
    getPublicBakeryProductQuote
);

//Calculate a trusted backend price quote for the Customer Cart
router.post(
    "/public/:slug/cart/quote",
    cartQuoteValidation,
    validateRequest,
    getPublicBakeryCartQuote
);

//Export the bakery router so it can be connected to the main Express application
export default router;