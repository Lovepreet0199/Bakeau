//Import Express to create Notification routes
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

//Import role middleware
import {
    authorizeRoles
} from "../middleware/roleMiddleware.js";


//Create Notification router
const router =
    express.Router();


//Get Notifications for Bakery Owner
router.get(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getMyNotifications
);


//Mark all Notifications as read
router.patch(
    "/read-all",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    markAllNotificationsRead
);


//Mark one Notification as read
router.patch(
    "/:id/read",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    markNotificationRead
);


//Export Notification router
export default router;