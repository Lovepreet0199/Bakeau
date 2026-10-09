//Import Mongoose
import mongoose from "mongoose";


//Stores the history of changes made to an Order
const orderActivitySchema = new mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        activity_type: {
            type: String,
            required: true,
            enum: [
                "order_placed",
                "order_confirmed",
                "order_preparing",
                "order_ready",
                "order_completed",
                "order_cancelled"
            ]
        },

        description: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);


//Used for loading an Order's Activity timeline
orderActivitySchema.index({
    order_id: 1,
    created_at: 1
});


const OrderActivity = mongoose.model(
    "OrderActivity",
    orderActivitySchema
);


//Export Order Activity model
export default OrderActivity;