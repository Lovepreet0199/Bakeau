//Import Express to create authentication routes
import express from "express";

//Import the registration controller function
import { registerUser } from "../controllers/authController.js";

//Create a router for authentication routes
const router = express.Router();

//Register a new Customer or a Bakery Owner.
router.post("/register", registerUser);

//Export the authentication router so it can be used in the main server file
export default router;