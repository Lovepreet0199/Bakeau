// Import Mongoose to create the Review Schema and model
import mongoose from "mongoose";

//Define the structure of a customer review for an order in Bakeau
const reviewSchema = new mongoose.Schema({

    //Order that this review belongs to
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true
    },

    //Customer who submitted this review
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    //Bakery that this review belongs to
    bakery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bakery",
        required: true
    },

    //Rating given by the customer for the bakery
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    //Written review provided by the customer
    comment: {
        type: String,
        required: true,
        trim: true
    },

    //Optional reply from the bakery owner to the customer review
    owner_reply: {
        type: String,
        trim: true,
        default: null
    },

    //Indicates whether the review has been removed by a Platform Administrator
    is_removed: {
        type: Boolean,
        required: true,
        default: false
    },

    //Platform Administrator who removed the review
    removed_by_admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    //Date and time when the review was removed by a Platform Administrator
    removed_at: {
        type: Date,
        default: null
    }
}, {

    //Automatically records when the review is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

//Create the Review model using the Review Schema
const Review = mongoose.model("Review", reviewSchema);

//Export the Review model so it can be used in other files
export default Review;