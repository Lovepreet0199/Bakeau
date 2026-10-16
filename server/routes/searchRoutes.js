//Import Express
import express from "express";

//Import Search controller
import {
    searchBakeryDashboard
} from "../controllers/searchController.js";

//Import authentication middleware
import {
    authenticateUser
} from "../middleware/authMiddleware.js";

//Import role middleware
import {
    authorizeRoles
} from "../middleware/roleMiddleware.js";


//Create Search router
const router =
    express.Router();


//Search Bakery dashboard
router.get(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    searchBakeryDashboard
);


//Export Search router
export default router;