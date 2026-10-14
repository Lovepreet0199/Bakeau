//Import Express
import express from "express";

//Import Review controller functions
import {
    createReview,
    uploadReviewImage,
    getOrderReview,
    getPublicReviews,
    getBakeryReviews,
    replyToReview
} from "../controllers/reviewController.js";

//Import authentication middleware
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Import upload middleware for Review images
import upload from "../middleware/upload.js";

const router = express.Router();


//Public Bakery Reviews
router.get(
    "/public/:slug",
    getPublicReviews
);


//Customer submits Review
router.post(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    createReview
);


//Bakery Owner Reviews
router.get(
    "/bakery",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryReviews
);


//Bakery Owner replies to Review
router.patch(
    "/:reviewId/reply",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    replyToReview
);

//Gets Customer Review for one Order
router.get(
    "/order/:orderId",
    authenticateUser,
    authorizeRoles("customer"),
    getOrderReview
);

//Customer uploads optional Review image
router.post(
    "/uploads/image",
    authenticateUser,
    authorizeRoles("customer"),
    upload.single("review_image"),
    uploadReviewImage
);


export default router;