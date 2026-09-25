//Import Express to create bakery routes
import express from "express";

//Import the bakery controller functions
import { createBakery } from "../controllers/bakeryController.js";

//Import authentication middleware to protect bakery routes
import { authenticateUser } from "../middleware/authMiddleware.js";

//Import role middleware to restrict routes by user role
import { authorizeRoles } from "../middleware/roleMiddleware.js";

//Create an Express router for bakery routes
const router = express.Router();

//Create a bakery -only authenticated Bakery Owners can access this route
router.post(
    "/",
    authenticateUser,
    authorizeRoles("bakeryOwner"),
    createBakery
);

//Export the bakery router so it can be connected to the main Express application
export default router;