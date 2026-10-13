// Import Mongoose to create the Order Item Schema and model
import mongoose from "mongoose";

//Define the structure of a product included in an order in Bakeau
const orderItemSchema = new mongoose.Schema({

    //Order that this order item belongs to
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    //Product included in this order item
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    //Name of the product at the time the order was placed
    product_name: {
        type: String,
        required: true,
        trim: true
    },

    //Product image saved when the Order was placed
    product_image_url: {
        type: String,
        trim: true,
        default: ""
    },

    //Number of this product included in the order
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },

    //Base price of the product at the time the order was placed
    base_price: {
        type: Number,
        required: true,
        min: 0
    },

    //Payment rule used by the Product when the order was placed
    payment_rule: {
        type: String,
        required: true,
        enum: ["full_payment", "deposit"]
    },

    //Deposit percentage used when the order was placed
    deposit_percentage: {
        type: Number,
        default: null,
        min: 1,
        max: 100
    },

    //Optional special instructions provided by the customer for this order item
    special_notes: {
        type: String,
        trim: true,
        default: null
    },

    //Final total price for this order item including quantity and customizations
    item_total: {
        type: Number,
        required: true,
        min: 0
    }

});

//Helps load all items belonging to an Order
orderItemSchema.index({
    order_id: 1
});

//Create the Order Item model using the Order Item Schema
const OrderItem = mongoose.model("OrderItem", orderItemSchema);

//Export the Order Item model so it can be used in other files
export default OrderItem;