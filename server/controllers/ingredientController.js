//Import the Ingredient model to manage Bakery Ingredient inventory
import Ingredient from "../models/Ingredient.js";

//Import the Bakery model to identify the authenticated Bakery Owner's Bakery
import Bakery from "../models/Bakery.js";


//Creates an Ingredient for the authenticated Bakery Owner
const createIngredient = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;


        //Get Ingredient information from the request
        const {
            name,
            unit,
            quantity,
            low_stock_threshold
        } = request.body;


        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if the Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Create the Ingredient
        const ingredient = await Ingredient.create({

            bakery_id:
                bakery._id,

            name:
                name,

            unit:
                unit,

            quantity:
                quantity,

            low_stock_threshold:
                low_stock_threshold
        });


        //Return the created Ingredient
        return response.status(201).json({

            message:
                "Ingredient created successfully",

            ingredient:
                ingredient
        });


    } catch (error) {

        //Handle duplicate Ingredient names
        if (error.code === 11000) {

            return response.status(409).json({
                message:
                    "An ingredient with this name already exists"
            });
        }


        //Log the Ingredient creation error
        console.error(
            "Create ingredient error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message:
                "Unable to create ingredient"
        });
    }
};


//Gets all Ingredients belonging to the authenticated Bakery Owner
const getBakeryIngredients = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;


        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if the Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Find all Ingredients belonging to the Bakery
        const ingredients = await Ingredient.find({
            bakery_id: bakery._id
        }).sort({
            name: 1
        });


        //Return the Bakery Ingredients
        return response.status(200).json({
            ingredients: ingredients
        });


    } catch (error) {

        //Log the Ingredient loading error
        console.error(
            "Get bakery ingredients error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message:
                "Unable to get ingredients"
        });
    }
};


//Updates an Ingredient belonging to the authenticated Bakery Owner
const updateIngredient = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;


        //Get the Ingredient ID from the URL
        const ingredientId =
            request.params.id;


        //Get the fields that may be updated
        const {
            name,
            unit,
            quantity,
            low_stock_threshold
        } = request.body;


        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if the Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Update the Ingredient only if it belongs to this Bakery
        const ingredient =
            await Ingredient.findOneAndUpdate(

                {
                    _id:
                        ingredientId,

                    bakery_id:
                        bakery._id
                },

                {
                    $set: {

                        ...(name !== undefined && {
                            name: name
                        }),

                        ...(unit !== undefined && {
                            unit: unit
                        }),

                        ...(quantity !== undefined && {
                            quantity: quantity
                        }),

                        ...(low_stock_threshold !== undefined && {
                            low_stock_threshold:
                                low_stock_threshold
                        })
                    }
                },

                {
                    returnDocument: "after",
                    runValidators: true
                }
            );


        //Stop if the Ingredient does not exist
        if (!ingredient) {

            return response.status(404).json({
                message: "Ingredient not found"
            });
        }


        //Return the updated Ingredient
        return response.status(200).json({

            message:
                "Ingredient updated successfully",

            ingredient:
                ingredient
        });


    } catch (error) {

        //Handle duplicate Ingredient names
        if (error.code === 11000) {

            return response.status(409).json({
                message:
                    "An ingredient with this name already exists"
            });
        }


        //Log the Ingredient update error
        console.error(
            "Update ingredient error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message:
                "Unable to update ingredient"
        });
    }
};


//Deletes an Ingredient belonging to the authenticated Bakery Owner
const deleteIngredient = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;


        //Get the Ingredient ID from the URL
        const ingredientId =
            request.params.id;


        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if the Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Delete the Ingredient only if it belongs to this Bakery
        const ingredient =
            await Ingredient.findOneAndDelete({

                _id:
                    ingredientId,

                bakery_id:
                    bakery._id
            });


        //Stop if the Ingredient does not exist
        if (!ingredient) {

            return response.status(404).json({
                message: "Ingredient not found"
            });
        }


        //Return successful delete response
        return response.status(200).json({
            message:
                "Ingredient deleted successfully"
        });


    } catch (error) {

        //Log the Ingredient delete error
        console.error(
            "Delete ingredient error:",
            error.message
        );


        //Return a server error
        return response.status(500).json({
            message:
                "Unable to delete ingredient"
        });
    }
};


//Export Ingredient controller functions
export {
    createIngredient,
    getBakeryIngredients,
    updateIngredient,
    deleteIngredient
};