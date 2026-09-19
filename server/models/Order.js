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
            "Pending",
            "Confirmed",
            "In Progress",
            "Ready for Pickup",
            "Completed",
            "Cancelled"
        ],
        default: "Pending"
    },

    //Indicates whether a deposit is required for this order
    deposit_required: {
        type: Boolean,
        required: true,
        default: false
    }

}, {
    //Automatically records when the order is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Create the Order model using the Order Schema
const Order = mongoose.model("Order", orderSchema);

//Export the Order model so it can be used in other files
export default Order;