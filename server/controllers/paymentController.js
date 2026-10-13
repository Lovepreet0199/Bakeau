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


//Marks a Manual Payment as received by the Bakery Owner
const receiveManualPayment = async (request, response) => {

    try {

        //Get authenticated Bakery Owner ID
        const ownerId = request.user.userId;

        //Get Payment ID from URL
        const paymentId = request.params.id;


        //Find the Bakery belonging to this Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Find the Manual Payment
        const payment = await Payment.findOne({
            _id: paymentId,
            payment_method: "Manual"
        });


        //Stop if Payment does not exist
        if (!payment) {
            return response.status(404).json({
                message: "Manual payment not found"
            });
        }


        //Find the Order and make sure it belongs to this Bakery
        const order = await Order.findOne({
            _id: payment.order_id,
            bakery_id: bakery._id
        });


        //Stop if the Order does not belong to this Bakery
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }


        //Stop if Payment was already received
        if (payment.payment_status === "Received") {

            return response.status(400).json({
                message: "Payment has already been received"
            });
        }


        //Only Pending payments can be marked received
        if (payment.payment_status !== "Pending") {

            return response.status(400).json({
                message: "Only Pending payments can be received"
            });
        }


        //Mark Payment as received
        payment.payment_status = "Received";
        payment.received_at = new Date();

        await payment.save();


        //Find all received Payments for this Order
        const receivedPayments = await Payment.find({
            order_id: order._id,
            payment_status: "Received"
        });


        //Calculate how much has been paid
        const totalAmountPaid = receivedPayments.reduce(
            (total, currentPayment) =>
                total + currentPayment.amount,
            0
        );


        //Update amount paid on the Order
        order.amount_paid = Math.min(
            totalAmountPaid,
            order.total_price
        );


        //Order is fully paid
        if (order.amount_paid >= order.total_price) {

            order.payment_status = "paid";

            //Order has received only part of the total
        } else if (order.amount_paid > 0) {

            order.payment_status = "partially_paid";

            //No Payment has been received
        } else {

            order.payment_status = "unpaid";
        }


        //Save updated Order
        await order.save();


        //Return updated Payment and Order information
        return response.status(200).json({

            message: "Manual payment marked as received",

            payment: payment,

            order: {
                _id: order._id,
                order_number: order.order_number,
                total_price: order.total_price,
                amount_paid: order.amount_paid,
                payment_status: order.payment_status
            }
        });


    } catch (error) {

        console.error(
            "Receive Manual payment error:",
            error.message
        );


        return response.status(500).json({
            message: "Unable to receive Manual payment"
        });
    }
};

//Changes a received Manual Payment back to Pending
const revertManualPayment = async (request, response) => {

    try {

        //Get authenticated Bakery Owner ID
        const ownerId = request.user.userId;

        //Get Payment ID from URL
        const paymentId = request.params.id;


        //Find the Bakery belonging to this Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Find the Manual Payment
        const payment = await Payment.findOne({
            _id: paymentId,
            payment_method: "Manual"
        });


        //Stop if Payment does not exist
        if (!payment) {
            return response.status(404).json({
                message: "Manual payment not found"
            });
        }


        //Find the Order and make sure it belongs to this Bakery
        const order = await Order.findOne({
            _id: payment.order_id,
            bakery_id: bakery._id
        });


        //Stop if Order does not belong to this Bakery
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }


        //Only received Payments can be changed back to Pending
        if (payment.payment_status !== "Received") {
            return response.status(400).json({
                message: "Only received payments can be changed back to Pending"
            });
        }


        //Change Payment back to Pending
        payment.payment_status = "Pending";
        payment.received_at = null;

        await payment.save();


        //Find all remaining received Payments for this Order
        const receivedPayments = await Payment.find({
            order_id: order._id,
            payment_status: "Received"
        });


        //Recalculate how much has actually been received
        const totalAmountPaid = receivedPayments.reduce(
            (total, currentPayment) =>
                total + currentPayment.amount,
            0
        );


        //Update Order amount paid
        order.amount_paid = Math.min(
            totalAmountPaid,
            order.total_price
        );


        //Update Order Payment status
        if (order.amount_paid >= order.total_price) {

            order.payment_status = "paid";

        } else if (order.amount_paid > 0) {

            order.payment_status = "partially_paid";

        } else {

            order.payment_status = "unpaid";
        }


        //Save updated Order
        await order.save();


        //Return updated information
        return response.status(200).json({

            message: "Manual payment changed back to Pending",

            payment: payment,

            order: {
                _id: order._id,
                order_number: order.order_number,
                total_price: order.total_price,
                amount_paid: order.amount_paid,
                payment_status: order.payment_status
            }
        });


    } catch (error) {

        console.error(
            "Revert Manual payment error:",
            error.message
        );


        return response.status(500).json({
            message: "Unable to revert Manual payment"
        });
    }
};

//Export Payment controller functions
export {
    createManualPayment,
    receiveManualPayment,
    revertManualPayment
};