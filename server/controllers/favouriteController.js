//Import Favourite model
import Favourite from "../models/Favourite.js";

//Import Product model
import Product from "../models/Product.js";


//Gets all Favourite Products for the logged-in Customer
const getMyFavourites = async (
    request,
    response
) => {

    try {

        //Get authenticated Customer ID
        const customerId =
            request.user.userId;


        //Find all Favourites belonging to Customer
        const favourites =
            await Favourite.find({
                customer_id:
                    customerId
            })
                .populate(
                    "product_id"
                )
                .sort({
                    created_at:
                        -1
                });


        //Return Customer Favourites
        return response.status(200).json({
            message:
                "Favourites retrieved successfully",

            favourites:
                favourites
        });


    } catch (error) {

        console.error(
            "Get Favourites error:",
            error
        );


        return response.status(500).json({
            message:
                "Unable to get favourites"
        });
    }
};


//Adds a Product to Customer Favourites
const addFavourite = async (
    request,
    response
) => {

    try {

        //Get authenticated Customer ID
        const customerId =
            request.user.userId;


        //Get Product ID from URL
        const productId =
            request.params.productId;


        //Check if Product exists
        const product =
            await Product.findById(
                productId
            );


        //Stop if Product does not exist
        if (!product) {

            return response.status(404).json({
                message:
                    "Product not found"
            });
        }


        //Check if Product is already a Favourite
        const existingFavourite =
            await Favourite.findOne({
                customer_id:
                    customerId,

                product_id:
                    productId
            });


        //Stop duplicate Favourite
        if (existingFavourite) {

            return response.status(400).json({
                message:
                    "Product is already in your favourites"
            });
        }


        //Create Favourite
        const favourite =
            await Favourite.create({
                customer_id:
                    customerId,

                product_id:
                    productId
            });


        //Return newly created Favourite
        return response.status(201).json({
            message:
                "Product added to favourites",

            favourite:
                favourite
        });


    } catch (error) {

        console.error(
            "Add Favourite error:",
            error
        );


        return response.status(500).json({
            message:
                "Unable to add favourite"
        });
    }
};


//Removes a Product from Customer Favourites
const removeFavourite = async (
    request,
    response
) => {

    try {

        //Get authenticated Customer ID
        const customerId =
            request.user.userId;


        //Get Product ID from URL
        const productId =
            request.params.productId;


        //Find and remove Customer Favourite
        const favourite =
            await Favourite.findOneAndDelete({
                customer_id:
                    customerId,

                product_id:
                    productId
            });


        //Stop if Favourite does not exist
        if (!favourite) {

            return response.status(404).json({
                message:
                    "Favourite not found"
            });
        }


        //Return success
        return response.status(200).json({
            message:
                "Product removed from favourites"
        });


    } catch (error) {

        console.error(
            "Remove Favourite error:",
            error
        );


        return response.status(500).json({
            message:
                "Unable to remove favourite"
        });
    }
};


//Export Favourite controller functions
export {
    getMyFavourites,
    addFavourite,
    removeFavourite
};