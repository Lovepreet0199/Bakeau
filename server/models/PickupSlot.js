// Import Mongoose to create the Pickup Slot Schema and model
import mongoose from "mongoose";

//Define the structure of a pickup slot for a bakery in Bakeau
const pickupSlotSchema = new mongoose.Schema({

    //Bakery that this pickup slot belongs to
    bakery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bakery",
        required: true
    },

    //Date when the customer can pick up the order
    pickup_date: {
        type: Date,
        required: true
    },

    //Time when the customer can pickup the order
    pickup_time: {
        type: String,
        required: true,
        trim: true
    },

    //Indicates whether this pickup slot is available for customers to select
    is_available: {
        type: Boolean,
        required: true,
        default: true
    }
}, {

    //Automatically records when the pickup slot is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

//Prevent duplicate pickup slots for the same bakery, date, and time
pickupSlotSchema.index(
    { bakery_id: 1, pickup_date: 1, pickup_time: 1 },
    { unique: true }
);

//Create the Pickup Slot model using the Pickup Slot Schema
const PickupSlot = mongoose.model(
    "PickupSlot",
    pickupSlotSchema
);

//Export the Pickup Slot model so it can be used in other files
export default PickupSlot;