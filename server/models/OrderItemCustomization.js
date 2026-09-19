// Import Mongoose to create the Order Item Customization Schema and model
import mongoose from "mongoose";

//Define the structure of a customization selected for an order item in Bakeau
const orderItemCustomizationSchema = new mongoose.Schema({

    //Order item that this customization belongs to
    order_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true
    },

    //Customization option selected by the customer
    customization_option_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomizationOption",
        required: true
    },

    //Name of the customization option at the time the order was placed
    option_name: {
        type: String,
        required: true,
        trim: true
    },

    //Additional price of the customization option at the time the order was placed
    additional_price: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }

});

//Prevent the same customization option from being added twice to the same order item
orderItemCustomizationSchema.index(
    { order_item_id: 1, customization_option_id: 1 },
    { unique: true }
);

//Create the Order Item Customization model using the Order Item Customization Schema
const OrderItemCustomization = mongoose.model(
    "OrderItemCustomization",
    orderItemCustomizationSchema
);

//Export the Order Item Customization model so it can be used in other files
export default OrderItemCustomization;