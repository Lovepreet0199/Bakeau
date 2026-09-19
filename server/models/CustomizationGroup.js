// Import Mongoose to create the Customization Group Schema and model
import mongoose from "mongoose";

//Define the structure of a customization group for a product in Bakeau
const customizationGroupSchema = new mongoose.Schema({

    //Product that this customization group belongs to
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    //Name of the customization group displayed to Customers
    name: {
        type: String,
        required: true,
        trim: true
    },

    //Indicates whether the customer must select an option from this customization group
    is_required: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    //Automatically records when the customization group  is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Prevent duplicate customization group names for the same product
customizationGroupSchema.index(
    { product_id: 1, name: 1 },
    { unique: true }
);

//Create the Customization Group model using the Customization Group Schema
const CustomizationGroup = mongoose.model(
    "CustomizationGroup",
    customizationGroupSchema
);

//Export the Customization Group model so it can be used in other files
export default CustomizationGroup;