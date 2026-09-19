// Import Mongoose to create the Notification Schema and model
import mongoose from "mongoose";

//Define the structure of a notification for a user in Bakeau
const notificationSchema = new mongoose.Schema({

    //Order that this notification is related to
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    //User who will receive this notification
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    //Message displayed to the user
    message: {
        type: String,
        required: true,
        trim: true
    },

    //Indicates whether the user has read the notification
    is_read: {
        type: Boolean,
        required: true,
        default: false
    },

    //Date and time when the notification was created
    created_at: {
        type: Date,
        default: Date.now
    }

});

//Create the Notification model using the Notification Schema
const Notification = mongoose.model("Notification", notificationSchema);

//Export the Notification model so it can be used in other files
export default Notification;
