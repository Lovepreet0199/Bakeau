//Import Payment model to create and manage Order payments
import Payment from "../models/Payment.js";


//Import Order model to validate the Customer's Order
import Order from "../models/Order.js";


//Import Bakery model to check Bakery payment settings
import Bakery from "../models/Bakery.js";


//Import configured Stripe Client
import stripe from "../config/stripe.js";


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


        //Calculate total received Payment amount using cents
        const totalReceivedCents = receivedPayments.reduce(
            (total, currentPayment) => {

                return (
                    total +
                    Math.round(
                        Number(currentPayment.amount) * 100
                    )
                );

            },
            0
        );


        //Convert Order total to cents
        const orderTotalCents =
            Math.round(
                Number(order.total_price) * 100
            );


        //Do not allow amount paid to exceed Order total
        const amountPaidCents =
            Math.min(
                totalReceivedCents,
                orderTotalCents
            );


        //Save amount paid back in dollars
        order.amount_paid =
            amountPaidCents / 100;


        //Update Order Payment status
        if (
            amountPaidCents >=
            orderTotalCents
        ) {

            order.payment_status =
                "paid";

        } else if (
            amountPaidCents > 0
        ) {

            order.payment_status =
                "partially_paid";

        } else {

            order.payment_status =
                "unpaid";
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


        //Calculate total received Payment amount using cents
        const totalReceivedCents = receivedPayments.reduce(
            (total, currentPayment) => {

                return (
                    total +
                    Math.round(
                        Number(currentPayment.amount) * 100
                    )
                );

            },
            0
        );


        //Convert Order total to cents
        const orderTotalCents =
            Math.round(
                Number(order.total_price) * 100
            );


        //Do not allow amount paid to exceed Order total
        const amountPaidCents =
            Math.min(
                totalReceivedCents,
                orderTotalCents
            );


        //Save amount paid back in dollars
        order.amount_paid =
            amountPaidCents / 100;


        //Update Order Payment status
        if (
            amountPaidCents >=
            orderTotalCents
        ) {

            order.payment_status =
                "paid";

        } else if (
            amountPaidCents > 0
        ) {

            order.payment_status =
                "partially_paid";

        } else {

            order.payment_status =
                "unpaid";
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


//Create a Stripe Checkout Session for an authenticated Customer Order
const createStripeCheckoutSession = async (request, response) => {

    try {

        //Get authenticated Customer ID
        const customerId = request.user.userId;

        //Get Order and payment choice
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


        //Cancelled Orders cannot be paid
        if (
            order.status ===
            "cancelled"
        ) {

            return response.status(400).json({
                message:
                    "Cancelled orders cannot be paid"
            });
        }


        //Stop if Order is already fully paid
        if (
            order.payment_status ===
            "paid" ||
            order.amount_paid >=
            order.total_price
        ) {

            return response.status(400).json({
                message:
                    "This Order is already fully paid"
            });
        }


        //Find the Bakery that owns this Order
        const bakery = await Bakery.findById(
            order.bakery_id
        );


        //Stop if Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message:
                    "Bakery not found"
            });
        }


        //Bakery must have a connected Stripe account
        if (
            !bakery.stripe_account_id ||
            !bakery.stripe_charges_enabled
        ) {

            return response.status(400).json({
                message:
                    "Stripe payment is not available for this Bakery"
            });
        }


        //Calculate remaining Order balance
        const remainingBalance =
            Math.max(
                0,
                Number(
                    order.total_price
                ) -
                Number(
                    order.amount_paid
                )
            );


        //Use remaining balance by default
        let paymentAmount =
            remainingBalance;


        let paymentType =
            order.amount_paid > 0
                ? "Balance"
                : "Full Payment";


        //Allow Customer to pay only the required Deposit
        if (
            order.deposit_required &&
            payment_choice ===
            "deposit"
        ) {

            //Deposit should only be paid once
            if (
                order.amount_paid >
                0
            ) {

                return response.status(400).json({
                    message:
                        "The required deposit has already been paid"
                });
            }


            paymentAmount =
                Math.min(
                    Number(
                        order.amount_due_now
                    ),
                    remainingBalance
                );


            paymentType =
                "Deposit";
        }


        //Deposit cannot be selected when full payment is required
        if (
            !order.deposit_required &&
            payment_choice ===
            "deposit"
        ) {

            return response.status(400).json({
                message:
                    "This Order requires full payment"
            });
        }


        //Convert dollars into Stripe cents
        const paymentAmountInCents =
            Math.round(
                paymentAmount *
                100
            );




        //Set where Customer returns after Stripe Checkout
        let successUrl =
            `${process.env.CLIENT_URL}/${bakery.slug}/order/${order._id}/confirmed?payment=success&session_id={CHECKOUT_SESSION_ID}`;


        let cancelUrl =
            `${process.env.CLIENT_URL}/${bakery.slug}/checkout/payment?payment=cancelled`;


        //Balance Payments return to the existing Order Tracking page
        if (
            paymentType ===
            "Balance"
        ) {

            successUrl =
                `${process.env.CLIENT_URL}/${bakery.slug}/orders/${order._id}?payment=success`;


            cancelUrl =
                `${process.env.CLIENT_URL}/${bakery.slug}/orders/${order._id}?payment=cancelled`;
        }

        //Create Stripe Checkout Session
        const checkoutSession =

            await stripe.checkout.sessions.create(
                {

                    mode:

                        "payment",

                    //Prefill Customer email
                    customer_email:
                        order.contact_email,


                    //Create one trusted Order payment item
                    line_items: [

                        {

                            price_data: {

                                currency:
                                    (
                                        bakery.currency ||
                                        "CAD"
                                    ).toLowerCase(),


                                product_data: {

                                    name:
                                        `Bakeau Order ${order.order_number}`,

                                    description:
                                        `${paymentType} for ${bakery.name}`
                                },


                                unit_amount:
                                    paymentAmountInCents

                            },


                            quantity:
                                1
                        }
                    ],


                    //Used later by the Stripe webhook
                    metadata: {

                        order_id:
                            order._id.toString(),

                        customer_id:
                            customerId.toString(),

                        payment_type:
                            paymentType
                    },


                    //Also attach metadata to the Payment Intent
                    payment_intent_data: {

                        metadata: {

                            order_id:
                                order._id.toString(),

                            customer_id:
                                customerId.toString(),

                            payment_type:
                                paymentType
                        }

                    },


                    //Return Customer to Bakeau after payment
                    success_url:
                        successUrl,


                    //Return Customer to Bakeau if payment is cancelled
                    cancel_url:
                        cancelUrl

                },


                //Create the Checkout Session on this Bakery's Stripe account
                {
                    stripeAccount:
                        bakery.stripe_account_id
                }
            );


        //Return Stripe Checkout URL
        return response.status(200).json({

            message:
                "Stripe Checkout Session created successfully",

            checkout_url:
                checkoutSession.url,

            session_id:
                checkoutSession.id
        });


    } catch (error) {

        console.error(
            "Stripe Checkout Session error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to start Stripe Checkout"
        });
    }
};


//Handles successful Stripe Checkout payments
const handleStripeWebhook = async (request, response) => {

    //Get Stripe signature from request headers
    const signature =
        request.headers[
        "stripe-signature"
        ];


    let event;


    try {

        //Verify that this webhook really came from Stripe
        event =
            stripe.webhooks.constructEvent(
                request.body,
                signature,
                process.env
                    .STRIPE_WEBHOOK_SECRET
            );


    } catch (error) {

        console.error(
            "Stripe webhook verification errors:",
            error.message
        );


        return response.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }


    try {

        //Handle successful Stripe Checkout payment
        if (
            event.type ===
            "checkout.session.completed"
        ) {

            const session =
                event.data.object;


            //Only continue when Stripe confirms payment
            if (
                session.payment_status ===
                "paid"
            ) {

                //Get Order ID from Stripe metadata
                const orderId =
                    session.metadata.order_id;


                //Find the Order
                const order =
                    await Order.findById(
                        orderId
                    );


                //Stop safely if Order no longer exists
                if (!order) {

                    console.error(
                        "Stripe webhook Order not found:",
                        orderId
                    );


                    return response.status(200).json({
                        received:
                            true
                    });
                }


                //Find the Bakery for this Order
                const bakery =
                    await Bakery.findById(
                        order.bakery_id
                    );


                //Make sure webhook belongs to this Bakery's Stripe account
                if (
                    !bakery ||
                    bakery.stripe_account_id !==
                    event.account
                ) {

                    console.error(
                        "Stripe connected account does not match Order Bakery"
                    );


                    return response.status(200).json({
                        received:
                            true
                    });
                }


                //Stripe Payment Intent ID
                const stripePaymentId =
                    session.payment_intent;


                //Amount actually paid through Stripe
                const paymentAmount =
                    Number(
                        session.amount_total
                    ) / 100;


                //Check whether this Stripe Payment was already saved
                let payment =
                    await Payment.findOne({
                        stripe_payment_id:
                            stripePaymentId
                    });


                //Create Payment only once
                if (!payment) {

                    payment =
                        await Payment.create({

                            order_id:
                                order._id,

                            payment_type:
                                session.metadata
                                    .payment_type,

                            payment_method:
                                "Stripe",

                            amount:
                                paymentAmount,

                            payment_status:
                                "Received",

                            stripe_payment_id:
                                stripePaymentId,

                            received_at:
                                new Date()
                        });
                }


                //Get all received Payments for this Order
                const receivedPayments =
                    await Payment.find({

                        order_id:
                            order._id,

                        payment_status:
                            "Received"
                    });


                //Calculate total received Payment amount using cents
                const totalReceivedCents =
                    receivedPayments.reduce(
                        (
                            total,
                            currentPayment
                        ) => {

                            return (
                                total +
                                Math.round(
                                    Number(
                                        currentPayment.amount
                                    ) * 100
                                )
                            );

                        },
                        0
                    );


                //Convert Order total to cents
                const orderTotalCents =
                    Math.round(
                        Number(
                            order.total_price
                        ) * 100
                    );


                //Do not allow amount paid to exceed Order total
                const amountPaidCents =
                    Math.min(
                        totalReceivedCents,
                        orderTotalCents
                    );


                //Save amount paid back in dollars
                order.amount_paid =
                    amountPaidCents /
                    100;


                //Order is fully paid
                if (
                    amountPaidCents >=
                    orderTotalCents
                ) {

                    order.payment_status =
                        "paid";


                    //Order has received part of total
                } else if (
                    amountPaidCents >
                    0
                ) {

                    order.payment_status =
                        "partially_paid";


                    //No Payment has been received
                } else {

                    order.payment_status =
                        "unpaid";
                }


                //Save updated Order
                await order.save();


                console.log(
                    `Stripe payment recorder for Order ${order.order_number}`
                );
            }
        }


        //Tell Stripe webhook was received successfully
        return response.status(200).json({
            received:
                true
        });


    } catch (error) {

        console.error(
            "Stripe webhook processing error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to process Stripe webhook"
        });
    }
};


//Export Payment controller functions
export {
    createManualPayment,
    receiveManualPayment,
    revertManualPayment,
    createStripeCheckoutSession,
    handleStripeWebhook
};