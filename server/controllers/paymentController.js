//Import Payment model to create and manage Order payments
import Payment from "../models/Payment.js";

//Import Order model to validate the Customer's Order
import Order from "../models/Order.js";

//Import Bakery model to check Bakery payment settings
import Bakery from "../models/Bakery.js";


//Creates a Manual payment for an authenticated Customer Order
const createManualPayment = async (request, response) => {

    try {

        //Get authenticated Customer ID
        const customerId = request.user.userId;

        //Get Payment information from request
        const {
            order_id,
            payment_choice
        } = request.body;


        //Find the Order only if it belongs to this Customer
        const order = await Order.findOne({
            _id: order_id,
            customer_id: customerId
        });


        //Stop if Order does not exist
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }


        //Find the Bakery that owns this Order
        const bakery = await Bakery.findById(
            order.bakery_id
        );


        //Stop if Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Make sure this Bakery accepts Manual payments
        if (!bakery.allow_manual_payment) {
            return response.status(400).json({
                message: "Manual payment is not available for this Bakery"
            });
        }


        //Prevent another Checkout payment from being created for this Order
        const existingPayment = await Payment.findOne({
            order_id: order._id,
            payment_status: {
                $in: ["Pending", "Received"]
            }
        });


        if (existingPayment) {
            return response.status(409).json({
                message: "A payment already exists for this Order"
            });
        }


        //Full Order amount is used by default
        let paymentAmount = order.total_price;
        let paymentType = "Full Payment";


        //Allow Customer to pay only the required Deposit
        if (
            order.deposit_required &&
            payment_choice === "deposit"
        ) {

            paymentAmount = order.amount_due_now;
            paymentType = "Deposit";
        }


        //Deposit cannot be selected when this Order requires full payment
        if (
            !order.deposit_required &&
            payment_choice === "deposit"
        ) {

            return response.status(400).json({
                message: "This Order requires full payment"
            });
        }


        //Create the Manual Payment
        const payment = await Payment.create({

            order_id: order._id,

            payment_type: paymentType,

            payment_method: "Manual",

            amount: paymentAmount,

            payment_status: "Pending"
        });


        //Return created Payment
        return response.status(201).json({

            message: "Manual payment created successfully",

            payment: payment,

            order: {
                _id: order._id,
                order_number: order.order_number,
                total_price: order.total_price,
                amount_due_now: order.amount_due_now,
                deposit_required: order.deposit_required
            }
        });


    } catch (error) {

        console.error(
            "Create Manual payment error:",
            error.message
        );


        return response.status(500).json({
            message: "Unable to create Manual payment"
        });
    }
};


//Export Payment controller functions
export {
    createManualPayment
};