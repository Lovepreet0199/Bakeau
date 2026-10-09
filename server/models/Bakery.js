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
        trim: true,
        default: ""
    },

    //Explains the Bakery's order cancellation rules
    cancellation_policy: {
        type: String,
        trim: true,
        default: ""
    },

    //Explains requirements for custom or special orders
    custom_order_policy: {
        type: String,
        trim: true,
        default: ""
    },

    //Stores any additional policy information shown to customers
    additional_policy_information: {
        type: String,
        trim: true,
        default: ""
    },

    //Physical address where customers can pick up their orders
    address: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        province: {
            type: String,
            required: true,
            trim: true
        },
        postal_code: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true,
            default: "Canada"
        }
    },

    //URL of the bakery logo displayed on the storefront
    logo_image_url: {
        type: String,
        trim: true,
        default: null
    },

    //Public ID used to manage the bakery logo in Cloudinary
    logo_image_public_id: {
        type: String,
        default: null
    },

    //URL of the bakery image displayed on the About section
    bakery_image_url: {
        type: String,
        trim: true,
        default: null
    },

    //Public ID used to manage the bakery image in Cloudinary
    bakery_image_public_id: {
        type: String,
        default: null
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
    },
    //Primary color used for buttons, links, and important storefront accents
    primary_color: {
        type: String,
        trim: true,
        default: "#C65F3A"
    },

    //Secondary color used for softer storefront backgrounds and accents
    secondary_color: {
        type: String,
        trim: true,
        default: "#F4E8DF"
    },

    //Dark color used for areas such as the footer and announcement bar
    dark_color: {
        type: String,
        trim: true,
        default: "#432C23"
    },
    //Minimum number of hours customers must order in advance
    minimum_order_notice: {
        type: Number,
        min: 1,
        default: 72
    },

    //Timezone used for pickup times and order deadlines
    timezone: {
        type: String,
        trim: true,
        default: "America/Toronto"
    },

    //Currency used for product prices and customer payments
    currency: {
        type: String,
        enum: ["CAD", "USD", "INR", "GBP", "EUR"],
        default: "CAD",
        trim: true,
        uppercase: true
    },

    //Maximum number of orders the bakery can accept each day
    maximum_orders_per_day: {
        type: Number,
        min: 1,
        default: 10
    },

    //Controls whether customers can currently place new orders
    accepting_orders: {
        type: Boolean,
        default: true
    },

    //Payment rule used for customer orders
    payment_rule: {
        type: String,
        enum: ["full", "deposit"],
        default: "full"
    },

    //Percentage customers must pay when deposit payments are enabled
    deposit_percentage: {
        type: Number,
        min: 1,
        max: 100,
        default: 25
    },

    //Allows the bakery to accept payments outside Bakeau, such as at pickup
    allow_manual_payment: {
        type: Boolean,
        default: false
    },
    //Stripe connected account used to receive online payments
    stripe_account_id: {
        type: String,
        trim: true,
        default: null
    },

    //Tracks whether the bakery owner has submitted the required Stripe onboarding details
    stripe_details_submitted: {
        type: Boolean,
        default: false
    },

    //Tracks whether Stripe currently allows this bakery to accept payments
    stripe_charges_enabled: {
        type: Boolean,
        default: false
    },

    //Tracks whether Stripe currently allows payouts to the bakery
    stripe_payouts_enabled: {
        type: Boolean,
        default: false
    },

    //Tracks whether the Bakery Owner completed the setup process
    setup_completed: {
        type: Boolean,
        default: false
    },
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