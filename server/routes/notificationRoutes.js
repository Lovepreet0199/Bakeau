//Import Express
import express from "express";

//Import Notification controller functions
import {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "../controllers/notificationController.js";

//Import authentication middleware
import {
    authenticateUser
} from "../middleware/authMiddleware.js";

//Import role authorization middleware
import {
    authorizeRoles
} from "../middleware/roleMiddleware.js";


//Create Notification router
const router = express.Router();


//Gets Notifications for the authenticated user
router.get(
    "/",
    authenticateUser,
    authorizeRoles(
        "bakeryOwner",
        "customer"
    ),
    getMyNotifications
);


//Marks all Notifications as read
router.patch(
    "/read-all",
    authenticateUser,
    authorizeRoles(
        "bakeryOwner",
        "customer"
    ),
    markAllNotificationsRead
);


//Marks one Notification as read
router.patch(
    "/:id/read",
    authenticateUser,
    authorizeRoles(
        "bakeryOwner",
        "customer"
    ),
    markNotificationRead
);


export default router;