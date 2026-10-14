//Import Mongoose
import mongoose from "mongoose";


//Defines the structure of a Customer Review
const reviewSchema = new mongoose.Schema(
    {
        //Order being reviewed
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true
        },

        //Customer who submitted the Review
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        //Bakery receiving the Review
        bakery_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bakery",
            required: true
        },

        //Customer rating from 1 to 5
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        //Customer Review message
        comment: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000
        },

        //Optional Customer Review image
        image_url: {
            type: String,
            default: null
        },

        //Cloudinary ID used to manage Review image
        image_public_id: {
            type: String,
            default: null
        },

        //Optional reply from Bakery Owner
        owner_reply: {
            type: String,
            trim: true,
            default: null,
            maxLength: 1000
        },

        //Date Bakery Owner replied
        owner_reply_at: {
            type: Date,
            default: null
        },

        //Tracks whether Admin removed the Review
        is_removed: {
            type: Boolean,
            default: false
        },

        //Admin who removed the Review
        removed_by_admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        //Date Review was removed
        removed_at: {
            type: Date,
            default: null
        }
    },
    {
        //Creates created_at and updated_at
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);


//Create Review model
const Review = mongoose.model("Review", reviewSchema);

export default Review;