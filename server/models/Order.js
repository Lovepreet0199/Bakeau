// Import Mongoose to create the Order Schema and model
import mongoose from "mongoose";

//Define the structure of a customer order in Bakeau
const orderSchema = new mongoose.Schema({

    //Customer who placed this order
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    //Human-readable order number used to identify the order
    order_number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    //Bakery that this order belongs to
    bakery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bakery",
        required: true
    },

    //Pickup slot selected by the customer for this order
    pickup_slot_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PickupSlot",
        required: true
    },

    //Pickup date selected when the order was placed
    pickup_date: {
        type: Date,
        required: true
    },

    //Pickup time selected when the order was placed
    pickup_time: {
        type: String,
        required: true,
        trim: true
    },

    //Final total price of the order
    total_price: {
        type: Number,
        required: true,
        min: 0
    },

    //Current status of the order
    status: {
        type: String,
        required: true,
        enum: [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "completed",
            "cancelled"
        ],
        default: "pending"
    },

    //Indicates whether a deposit is required for this order
    deposit_required: {
        type: Boolean,
        required: true,
        default: false
    },

    //Amount the customer must pay when placing the order
    amount_due_now: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    //Amount already paid by the customer
    amount_paid: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    //Current payment state of the order
    payment_status: {
        type: String,
        required: true,
        enum: [
            "unpaid",
            "partially_paid",
            "paid",
            "refunded"
        ],
        default: "unpaid"
    }

}, {
    //Automatically records when the order is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Helps load Bakery Owner orders efficiently
orderSchema.index({
    bakery_id: 1,
    status: 1,
    created_at: -1
});

//Helps load a customer's order history efficiently
orderSchema.index({
    customer_id: 1,
    created_at: -1
});

//Create the Order model using the Order Schema
const Order = mongoose.model("Order", orderSchema);

//Export the Order model so it can be used in other files
export default Order;