// Import Mongoose to create the Customization Option Schema and model
import mongoose from "mongoose";

//Define the structure of a Customization Option for a customization group in Bakeau
const customizationOptionSchema = new mongoose.Schema({

    //Customization group that this option belongs to 
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomizationGroup",
        required: true
    },

    //Name of the customization option displayed to customers
    name: {
        type: String,
        required: true,
        trim: true
    },

    //Additional cost added to the product price when this option is selected
    additional_price: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
}, {
    //Automatically records when the customization option is created and last updated.
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Prevent duplicate customization option names within the same customization group
customizationOptionSchema.index(
    { group_id: 1, name: 1 },
    { unique: true }
);

//Create the Customization Option model using the Customization Option Schema
const CustomizationOption = mongoose.model(
    "CustomizationOption",
    customizationOptionSchema
);

//Export the Customization Option model so it can be used in other files
export default CustomizationOption;