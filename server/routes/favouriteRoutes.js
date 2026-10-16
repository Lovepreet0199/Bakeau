//Import Express
import express from "express";

//Import Favourite controller functions
import {
    getMyFavourites,
    addFavourite,
    removeFavourite
} from "../controllers/favouriteController.js";

//Import authentication middleware
import {
    authenticateUser
} from "../middleware/authMiddleware.js";

//Import role middleware
import {
    authorizeRoles
} from "../middleware/roleMiddleware.js";


//Create Favourite router
const router =
    express.Router();


//Get all Favourites for logged-in Customer
router.get(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    getMyFavourites
);


//Add Product to Customer Favourites
router.post(
    "/:productId",
    authenticateUser,
    authorizeRoles("customer"),
    addFavourite
);


//Remove Product from Customer Favourites
router.delete(
    "/:productId",
    authenticateUser,
    authorizeRoles("customer"),
    removeFavourite
);


//Export Favourite router
export default router;