// Import Mongoose to create the Product Schema and model
import mongoose from "mongoose";

//Define the structure of a bakery product in Bakeau
const productSchema = new mongoose.Schema({

    //Bakery that owns and manages this product
    bakery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bakery",
        required: true
    },

    //Name of the product displayed to customers
    name: {
        type: String,
        required: true,
        trim: true
    },

    //Description of the product displayed to customers
    description: {
        type: String,
        required: true,
        trim: true
    },

    //String price of the product before any customization costs
    base_price: {
        type: Number,
        required: true,
        min: 0
    },

    //URL of the product image displayed to the customers
    image_url: {
        type: String,
        required: true,
        trim: true
    },

    //Public 
});