//Import Express
import express from "express";

//Import Customer controller
import {
    getBakeryCustomers
} from "../controllers/customerController.js";

//Import authentication middleware
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware
import { authorizeRoles } from "../middleware/roleMiddleware.js";


//Create Customer router
const router = express.Router();


//Gets Customers belonging to Bakery Owner's Bakery
router.get(
    "/bakery",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    getBakeryCustomers
);


//Export Customer router
export default router;