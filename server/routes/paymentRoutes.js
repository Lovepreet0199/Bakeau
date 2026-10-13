//Import Express to create Payment routes
import express from "express";

//Import Payment controller functions
import {
    createManualPayment,
    receiveManualPayment,
    revertManualPayment
} from "../controllers/paymentController.js";

//Import authentication middleware
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Import express-validator
import {
    body,
    param,
    validationResult
} from "express-validator";


//Create Payment router
const router = express.Router();


//Validate Manual Payment information
const manualPaymentValidation = [

    body("order_id")
        .notEmpty()
        .withMessage("Order is required")
        .isMongoId()
        .withMessage("Order ID must be valid"),

    body("payment_choice")
        .notEmpty()
        .withMessage("Payment choice is required")
        .isIn([
            "deposit",
            "full"
        ])
        .withMessage("Payment choice must be deposit or full")
];


//Validate Payment ID
const paymentIdValidation = [

    param("id")
        .isMongoId()
        .withMessage("Payment ID must be valid")
];


//Check validation results
const validateRequest = (
    request,
    response,
    next
) => {

    //Get validation errors
    const errors = validationResult(request);


    //Return validation errors
    if (!errors.isEmpty()) {
        return response.status(400).json({
            errors: errors.array()
        });
    }


    //Continue to Controller
    next();
};


//Create Manual Payment for Customer Order
router.post(
    "/manual",
    authenticateUser,
    authorizeRoles("customer"),
    manualPaymentValidation,
    validateRequest,
    createManualPayment
);


//Mark Manual Payment as received
router.patch(
    "/:id/receive",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    paymentIdValidation,
    validateRequest,
    receiveManualPayment
);

//Changes a received Manual Payment back to Pending
router.patch(
    "/:id/revert",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    paymentIdValidation,
    validateRequest,
    revertManualPayment
);

//Export Payment router
export default router;