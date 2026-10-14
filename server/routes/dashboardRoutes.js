//Import Express to create Dashboard routes
import express from "express";

//Import Dashboard controller functions
import {
    getBakeryDashboard
} from "../controllers/dashboardController.js";

//Import authentication middleware to protect Dashboard routes
import {
    authenticateUser
} from "../middleware/authMiddleware.js";

//Import role middleware to restrict Dashboard routes
import {
    authorizeRoles
} from "../middleware/roleMiddleware.js";


//Create an Express router for Dashboard routes
const router = express.Router();


//Get Dashboard information for the authenticated Bakery Owner
router.get(
    "/bakery",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryDashboard
);


//Export the Dashboard router
export default router;