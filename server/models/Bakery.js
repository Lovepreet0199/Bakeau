// Import Mongoose to create the Bakery Schema and model
import mongoose from "mongoose";

//Define the structure of a bakery account in Bakeau
const bakerySchema = new mongoose.Schema({

    //Bakery owner who owns and manages this bakery
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    //Name of the bakery displayed to customers
    name: {
        type: String,
        required: true,
        trim: true
    },

    //Unique URL-friendly name used to identify the bakery storefront
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    //Contact email displayed/used for bakery communication
    contact_email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    //Contact phone displayed/used for bakery communication
    contact_phone: {
        type: String,
        trim: true,
        default: null
    },

    //Description of the bakery displayed to customers
    description: {
        type: String,
        required: true,
        trim: true
    },

    //Instructions explaining how customers should pick up their order
    pickup_instructions: {
        type: String,
        required: true,
        trim: true
    },

    //URL of the bakery profile image
    profile_image_url: {
        type: String,
        trim: true,
        default: null
    },

    //Public ID used to manage the bakery profile image in Cloudinary
    profile_image_public_id: {
        type: String,
        default: null
    },

    //Current approval status of the bakery account
    account_status: {
        type: String,
        required: true,
        enum: ["Pending", "Approved", "Suspended"],
        default: "Pending"
    },

    //Optional theme selected by the bakery owner for their storefront
    storefront_theme: {
        type: String,
        default: null
    }
}, {
    //Automatically records when the bakery is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Create the Bakery model using the Bakery Schema
const Bakery = mongoose.model("Bakery", bakerySchema);

//Export the Bakery model so it can be used in other files
export default Bakery;