// Import Mongoose to create the Payment Schema and model
import mongoose from "mongoose";

//Define the structure of a payment for an order in Bakeau
const paymentSchema = new mongoose.Schema({

    //Order that this payment belongs to
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    //Type of payment made for the order
    payment_type: {
        type: String,
        required: true,
        enum: ["Deposit", "Balance", "Full Payment"]
    },

    //Method used to process or record the payment
    payment_method: {
        type: String,
        required: true,
        enum: ["Manual", "Stripe"]
    },

    //Amount of money recorded for this payment
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },

    //Current status of the payment
    payment_status: {
        type: String,
        required: true,
        enum: ["Pending", "Received", "Failed"],
        default: "Pending"
    },

    //Stripe payment identifier when the payment is processed through Stripe
    stripe_payment_id: {
        type: String,
        trim: true,
        default: null
    },

    //Date and time when the payment was received
    received_at: {
        type: Date,
        default: null
    }
}, {

    //Automatically records when the payment is created and last updated
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }

});

//Create the Payment model using the Payment Schema
const Payment = mongoose.model("Payment", paymentSchema);

//Export the Payment model so it can be used in other files
export default Payment;