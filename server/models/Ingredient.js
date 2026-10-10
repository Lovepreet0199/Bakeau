//Import Mongoose to create the Ingredient Schema and model
import mongoose from "mongoose";


//Define the structure of a Bakery Ingredient in Bakeau
const ingredientSchema = new mongoose.Schema({

    //Bakery that owns and manages this Ingredient
    bakery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bakery",
        required: true
    },

    //Name of the Ingredient
    name: {
        type: String,
        required: true,
        trim: true
    },

    //Unit used to measure the Ingredient
    unit: {
        type: String,
        required: true,
        trim: true
    },

    //Current Ingredient quantity available
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    //Quantity at which Bakeau should show a low stock warning
    low_stock_threshold: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }

}, {

    //Automatically records when the Ingredient is created and updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});


//Prevent duplicate Ingredient names inside the same Bakery
ingredientSchema.index(
    {
        bakery_id: 1,
        name: 1
    },
    {
        unique: true
    }
);


//Create the Ingredient model
const Ingredient = mongoose.model(
    "Ingredient",
    ingredientSchema
);


//Export the Ingredient model
export default Ingredient;