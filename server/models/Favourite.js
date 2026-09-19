// Import Mongoose to create the Favourite Schema and model
import mongoose from "mongoose";

//Define the structure of a customer's favourite product in Bakeau
const favouriteSchema = new mongoose.Schema({


    //Customer who saved this product as a favourite
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    //Product saved as a favourite by the customer
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    //Date and time when the product was added to the customer's favourites
    created_at: {
        type: Date,
        default: Date.now
    }

});

//Prevent the same customer from adding the same product to favourites more than once
favouriteSchema.index(
    { customer_id: 1, product_id: 1 },
    { unique: true }
);

//Create the Favourite model using the Favourite Schema
const Favourite = mongoose.model("Favourite", favouriteSchema);

//Export the Favourite model so it can be used in other files
export default Favourite;