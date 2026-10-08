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

    //Category used to organize products on the bakery storefront
    category: {
        type: String,
        required: true,
        trim: true
    },

    //Controls how the product is published on the storefront
    status: {
        type: String,
        enum: ["draft", "active", "hidden"],
        default: "draft",
        required: true
    },

    //Starting price of the product before any customization costs
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

    //Public ID used to manage the product image in Cloudinary
    image_public_id: {
        type: String,
        default: null
    },

    //Indicates whether the product is currently available for customers to order
    is_available: {
        type: Boolean,
        required: true,
        default: true
    },

    //Indicates whether the product is visible on the bakery storefront
    is_visible: {
        type: Boolean,
        required: true,
        default: true
    },

    //Number of this product currently available in inventory
    inventory_quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    //Inventory level at which the bakery should receive a low inventory warning
    low_inventory_threshold: {
        type: Number,
        required: true,
        default: 5,
        min: 0
    },

    //Indicates whether the product should be highlighted as a featured product
    is_featured: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    //Automatically records when the product is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

//Create the Product model using the Product Schema
const Product = mongoose.model("Product", productSchema);

//Export the Product model so it can be used in other files
export default Product;