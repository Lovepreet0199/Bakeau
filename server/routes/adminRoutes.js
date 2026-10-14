//Import Express Router
import express from "express";

//Import Admin controller
import {
    getAdminBakeries,
    updateBakeryStatus
} from "../controllers/adminController.js";

//Import authentication middleware
import {
    authenticateUser
} from "../middleware/authMiddleware.js";

//Import role middleware
import {
    authorizeRoles
} from "../middleware/roleMiddleware.js";


//Create Admin router
const router =
    express.Router();


//Get all Bakery accounts
router.get(
    "/bakeries",
    authenticateUser,
    authorizeRoles(
        "platformAdmin"
    ),
    getAdminBakeries
);

//Approve or suspend a Bakery account
router.patch(
    "/bakeries/:id/status",
    authenticateUser,
    authorizeRoles(
        "platformAdmin"
    ),
    updateBakeryStatus
);


//Export Admin routes
export default router;