//Import the Order model to manage customer Orders
import Order from "../models/Order.js";

//Import the Order Item model to manage Products included in Orders
import OrderItem from "../models/OrderItem.js";

//Import Order Item Customizations to load selected Product options
import OrderItemCustomization from "../models/OrderItemCustomization.js";

//Import the Bakery model to identify Bakery Owner Orders
import Bakery from "../models/Bakery.js";

//Import the Product model to validate Products being ordered
import Product from "../models/Product.js";

//Import Pickup Slots to validate the selected pickup time
import PickupSlot from "../models/PickupSlot.js";

//Import Customization Groups to validate Product customization rules
import CustomizationGroup from "../models/CustomizationGroup.js";

//Import Customization Options to validate selected Product options
import CustomizationOption from "../models/CustomizationOption.js";

//Import Order Activity model
import OrderActivity from "../models/OrderActivity.js";

//Import Payment model to load Order payment information
import Payment from "../models/Payment.js";

//Import Notification model for Bakery Owner alerts
import Notification from "../models/Notification.js";

//Import User model to get the Bakery Owner email
import User from "../models/User.js";

//Import Order email helpers
import {
    sendNewOrderEmail,
    sendOrderStatusEmail
} from "../utils/email.js";

//Rounds money values to two decimal places
const roundMoney = (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
};

//Customer Pickup times are available every 30 minutes
const PICKUP_INTERVAL = 30;

//Converts a 12-hour time such as 9:30 AM into minutes
const convert12HourTimeToMinutes = (time) => {

    const match = time.trim().match(
        /^(\d{1,2}):(\d{2})\s(AM|PM)$/i
    );

    if (!match) {
        return null;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
        hours += 12;
    }

    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    return (hours * 60) + minutes;
};


//Converts a 24-hour time such as 14:00 into minutes
const convert24HourTimeToMinutes = (time) => {

    const match = time.trim().match(
        /^([01]\d|2[0-3]):([0-5]\d)$/
    );

    if (!match) {
        return null;
    }

    return (Number(match[1]) * 60) + Number(match[2]);
};


//Checks if the selected Customer time belongs to the Bakery Pickup window
const isPickupTimeValid = (pickupWindow, selectedTime) => {

    //Split 9:30 AM - 7:30 PM into start and end
    const windowParts = pickupWindow.split(" - ");

    if (windowParts.length !== 2) {
        return false;
    }

    const startMinutes = convert12HourTimeToMinutes(windowParts[0]);
    const endMinutes = convert12HourTimeToMinutes(windowParts[1]);
    const selectedMinutes = convert24HourTimeToMinutes(selectedTime);

    if (
        startMinutes === null ||
        endMinutes === null ||
        selectedMinutes === null
    ) {
        return false;
    }

    //Selected time must fall inside the Pickup window
    if (
        selectedMinutes < startMinutes ||
        selectedMinutes >= endMinutes
    ) {
        return false;
    }

    //Selected time must follow the 30-minute Pickup interval
    return (
        (selectedMinutes - startMinutes) %
        PICKUP_INTERVAL === 0
    );
};

//Builds complete Order details including items and customizations
const getCompleteOrderDetails = async (order) => {

    //Find all items belonging to this Order
    //Find all items and load the Product image
    const orderItems = await OrderItem.find({
        order_id: order._id
    }).populate(
        "product_id",
        "image_url"
    );

    //Get all Order Item IDs
    const orderItemIds = orderItems.map(
        (orderItem) => orderItem._id
    );

    //Find all customizations belonging to the Order Items
    const customizations = await OrderItemCustomization.find({
        order_item_id: {
            $in: orderItemIds
        }
    });

    //Add the correct customizations to each Order Item
    const itemsWithCustomizations = orderItems.map((orderItem) => {

        const itemCustomizations = customizations.filter(
            (customization) =>
                customization.order_item_id.toString() ===
                orderItem._id.toString()
        );

        return {
            ...orderItem.toObject(),
            customizations: itemCustomizations
        };
    });

    //Find all Activity records belonging to this Order
    const activities = await OrderActivity.find({
        order_id: order._id
    }).sort({
        created_at: 1
    });

    //Find Payments belonging to this Order
    const payments = await Payment.find({
        order_id: order._id
    });

    //Return the Order with its complete item information
    return {
        ...order.toObject(),
        items: itemsWithCustomizations,
        activities: activities,
        payments: payments
    };
};

//Gets all Orders belonging to the authenticated Bakery Owner's bakery
const getBakeryOrders = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Find the Bakery belonging to the Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find all Orders belonging to this Bakery
        const orders = await Order.find({
            bakery_id: bakery._id
        })
            .populate(
                "customer_id",
                "first_name last_name email phone_number"
            )
            .sort({
                created_at: -1
            });

        //Add Order Items to each Bakery Order
        const ordersWithItems = await Promise.all(

            orders.map(async (order) => {

                //Find all Product items belonging to this Order
                const orderItems = await OrderItem.find({
                    order_id: order._id
                });

                //Return the Order together with its Product items
                return {
                    ...order.toObject(),
                    items: orderItems
                };
            })
        );

        //Return the Bakery Orders
        return response.status(200).json({
            orders: ordersWithItems
        });

    } catch (error) {

        console.error(
            "Get bakery orders error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to get bakery orders"
        });
    }
};

//Gets one complete Order belonging to the authenticated Bakery Owner
const getBakeryOrderById = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Get the Order ID from the URL
        const orderId = request.params.id;

        //Find the Bakery belonging to the Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the Order only if it belongs to this Bakery
        const order = await Order.findOne({
            _id: orderId,
            bakery_id: bakery._id
        }).populate(
            "customer_id",
            "first_name last_name email phone_number"
        );

        //Stop if the Order does not exist
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }

        //Load the complete Order information
        const completeOrder = await getCompleteOrderDetails(order);

        //Return the complete Order
        return response.status(200).json({
            order: completeOrder
        });

    } catch (error) {

        console.error(
            "Get bakery order error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to get order"
        });
    }
};

//Updates the status of an Order belonging to the authenticated Bakery Owner
const updateBakeryOrderStatus = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Get the Order ID from the URL
        const orderId = request.params.id;

        //Get the new Order status
        const { status } = request.body;

        //Find the Bakery belonging to the Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the Order only if it belongs to this Bakery
        const order = await Order.findOne({
            _id: orderId,
            bakery_id: bakery._id
        });

        //Stop if the Order does not exist
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }

        //Remember the current status before changing it
        const previousStatus = order.status;


        //Update the Order status
        order.status = status;


        //Save the updated Order
        await order.save();

        //Only create status activity, email and Notification
        //when the Order status actually changed
        if (previousStatus !== status) {

            //Get the Activity information for the new Order status
            const activity = getOrderStatusActivity(status);

            //Store the Order status change in its Activity history
            if (activity) {

                await OrderActivity.create({
                    order_id: order._id,
                    activity_type: activity.activity_type,
                    description: activity.description
                });
            }

            //Send Order status update email to the Customer
            try {

                //Only send email when the Order has a Customer email
                if (order.contact_email) {

                    await sendOrderStatusEmail(
                        order.contact_email,
                        bakery.name,
                        bakery.slug,
                        order
                    );
                }

            } catch (emailError) {

                /*
                    Do not fail the Order status update
                    if the email could not be sent.
                */
                console.error(
                    "Order status email error:",
                    emailError.message
                );
            }
        }

        //Create an in-app Notification for the Customer
        try {

            //Readable status names shown to the Customer
            const customerStatusNames = {
                confirmed:
                    "Confirmed",

                preparing:
                    "In Progress",

                ready:
                    "Ready for Pickup",

                completed:
                    "Completed",

                cancelled:
                    "Cancelled"
            };


            //Get readable status text
            const customerStatusText =
                customerStatusNames[
                order.status
                ] ||
                order.status;


            //Create Notification for the Customer
            if (order.customer_id) {

                await Notification.create({

                    order_id:
                        order._id,

                    user_id:
                        order.customer_id,

                    message:
                        `Your order ${order.order_number} is now ${customerStatusText}`
                });
            }


        } catch (notificationError) {

            /*
                Do not fail the Order status update
                if the Notification could not be created.
            */
            console.error(
                "Customer Order notification error:",
                notificationError.message
            );
        }

        //Return the updated Order
        return response.status(200).json({
            message: "Order status updated successfully",
            order: order
        });

    } catch (error) {

        console.error(
            "Update order status error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to update order status"
        });
    }
};

//Gets all Orders belonging to the authenticated Customer
const getMyOrders = async (request, response) => {

    try {

        //Get the authenticated Customer's user ID
        const customerId = request.user.userId;

        //Find all Orders belonging to this Customer
        const orders = await Order.find({
            customer_id: customerId
        }).sort({
            created_at: -1
        });


        //Add Product items to each Order
        const ordersWithItems = await Promise.all(

            orders.map(async (order) => {

                const orderItems = await OrderItem.find({
                    order_id: order._id
                }).populate(
                    "product_id",
                    "image_url"
                );


                return {
                    ...order.toObject(),
                    items: orderItems
                };
            })
        );


        //Return the Customer's Orders
        return response.status(200).json({
            orders: ordersWithItems
        });


    } catch (error) {

        console.error(
            "Get customer orders error:",
            error.message
        );


        return response.status(500).json({
            message: "Unable to get orders"
        });
    }
};

//Gets one complete Order belonging to the authenticated Customer
const getMyOrderById = async (request, response) => {

    try {

        //Get the authenticated Customer's user ID
        const customerId = request.user.userId;

        //Get the Order ID from the URL
        const orderId = request.params.id;

        //Find the Order only if it belongs to this Customer
        const order = await Order.findOne({
            _id: orderId,
            customer_id: customerId
        });

        //Stop if the Order does not exist
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }

        //Load the complete Order information
        const completeOrder = await getCompleteOrderDetails(order);

        //Return the complete Order
        return response.status(200).json({
            order: completeOrder
        });

    } catch (error) {

        console.error(
            "Get customer order error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to get order"
        });
    }
};

//Validates one requested Product and prepares its Order Item information
const prepareOrderItem = async (
    requestedItem,
    bakery,
    pickupSlot
) => {

    //Convert the requested quantity into a number
    const quantity = Number(requestedItem.quantity);

    //Make sure the quantity is a valid whole number
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
            "Product quantity must be at least 1"
        );
    }

    //Find the Product only inside the selected Bakery
    const product = await Product.findOne({
        _id: requestedItem.product_id,
        bakery_id: bakery._id
    });

    //Stop if the Product does not exist
    if (!product) {
        throw new Error(
            "Product not found"
        );
    }

    //Draft Products cannot be ordered
    if (product.status === "draft") {
        throw new Error(
            `${product.name} is not published`
        );
    }

    //Unavailable Products cannot be ordered
    if (!product.is_available) {
        throw new Error(
            `${product.name} is currently unavailable`
        );
    }

    //Check inventory when this Product tracks inventory
    if (
        product.stock_type === "track_inventory" &&
        product.inventory_quantity < quantity
    ) {
        throw new Error(
            `Not enough inventory is available for ${product.name}`
        );
    }

    //Get the selected Pickup day
    const pickupDay = new Date(
        pickupSlot.pickup_date
    ).toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            timeZone: "UTC"
        }
    ).toLowerCase();

    //Make sure the Product can be picked up on this day
    if (
        product.available_pickup_days.length > 0 &&
        !product.available_pickup_days.includes(pickupDay)
    ) {
        throw new Error(
            `${product.name} is not available for pickup on ${pickupDay}`
        );
    }

    //Load all Customization Groups belonging to this Product
    const customizationGroups =
        await CustomizationGroup.find({
            product_id: product._id
        });

    //Get selected Customization Option IDs
    const selectedOptionIds =
        requestedItem.customization_option_ids || [];

    //Make sure Customization Options are sent as an array
    if (!Array.isArray(selectedOptionIds)) {
        throw new Error(
            "Customization options must be an array"
        );
    }

    //Stores the selected Customization Options
    let selectedOptions = [];

    //Load selected Options only when the Customer selected some
    if (selectedOptionIds.length > 0) {

        const groupIds =
            customizationGroups.map(
                (group) => group._id
            );

        selectedOptions =
            await CustomizationOption.find({
                _id: {
                    $in: selectedOptionIds
                },
                group_id: {
                    $in: groupIds
                }
            });

        //Make sure every selected Option belongs to this Product
        if (
            selectedOptions.length !==
            selectedOptionIds.length
        ) {
            throw new Error(
                `Invalid customization selected for ${product.name}`
            );
        }
    }

    //Tracks which Groups already have a selected Option
    const selectedGroupIds = new Set();

    //Stores customization snapshots for the Order
    const customizations = [];

    //Tracks additional customization cost
    let customizationPrice = 0;

    for (const option of selectedOptions) {

        const group =
            customizationGroups.find(
                (currentGroup) =>
                    currentGroup._id.toString() ===
                    option.group_id.toString()
            );

        //Only allow one Option from each Group
        if (
            selectedGroupIds.has(
                option.group_id.toString()
            )
        ) {
            throw new Error(
                `Only one option can be selected from each customization group for ${product.name}`
            );
        }

        selectedGroupIds.add(
            option.group_id.toString()
        );

        customizationPrice +=
            option.additional_price;

        customizations.push({
            customization_option_id:
                option._id,
            group_name:
                group.name,
            option_name:
                option.name,
            additional_price:
                option.additional_price
        });
    }

    //Make sure required Groups have a selected Option
    for (const group of customizationGroups) {

        if (
            group.is_required &&
            !selectedGroupIds.has(
                group._id.toString()
            )
        ) {
            throw new Error(
                `${group.name} is required for ${product.name}`
            );
        }
    }

    //Calculate the full price of this Order Item
    const unitPrice = roundMoney(
        product.base_price +
        customizationPrice
    );

    const itemTotal = roundMoney(
        unitPrice * quantity
    );

    //Full payment is due by default
    let amountDueNow = itemTotal;

    //Calculate deposit amount when required
    if (product.payment_rule === "deposit") {

        amountDueNow = roundMoney(
            itemTotal *
            (product.deposit_percentage / 100)
        );
    }

    //Return the cleaned and validated Order Item information
    return {
        product: product,
        quantity: quantity,
        special_notes:
            requestedItem.special_notes || null,
        item_total: itemTotal,
        amount_due_now: amountDueNow,
        customizations: customizations
    };
};

//Saves the validated Products and Customizations for an Order
const saveOrderItems = async (
    order,
    preparedItems
) => {

    //Go through every validated Product in the Order
    for (const preparedItem of preparedItems) {

        const product = preparedItem.product;

        //Create the Order Item
        const orderItem = await OrderItem.create({
            order_id: order._id,
            product_id: product._id,
            product_name: product.name,
            product_image_url: product.image_url || "",
            quantity: preparedItem.quantity,
            base_price: product.base_price,
            payment_rule: product.payment_rule,
            deposit_percentage:
                product.payment_rule === "deposit"
                    ? product.deposit_percentage
                    : null,
            special_notes:
                preparedItem.special_notes,
            item_total:
                preparedItem.item_total
        });

        //Save selected Customizations for this Order Item
        for (
            const customization
            of preparedItem.customizations
        ) {

            await OrderItemCustomization.create({
                order_item_id: orderItem._id,
                customization_option_id:
                    customization.customization_option_id,
                group_name:
                    customization.group_name,
                option_name:
                    customization.option_name,
                additional_price:
                    customization.additional_price
            });
        }

        //Reduce inventory when this Product tracks inventory
        if (
            product.stock_type === "track_inventory"
        ) {
            await Product.updateOne(
                {
                    _id: product._id
                },
                {
                    $inc: {
                        inventory_quantity:
                            -preparedItem.quantity
                    }
                }
            );
        }
    }
};

//Creates the Activity description for an Order status change
const getOrderStatusActivity = (status) => {

    const activities = {
        confirmed: {
            activity_type: "order_confirmed",
            description: "Order accepted by bakery"
        },

        preparing: {
            activity_type: "order_preparing",
            description: "Bakery started preparing the Order"
        },

        ready: {
            activity_type: "order_ready",
            description: "Order marked ready for pickup"
        },

        completed: {
            activity_type: "order_completed",
            description: "Order completed"
        },

        cancelled: {
            activity_type: "order_cancelled",
            description: "Order cancelled"
        }
    };

    return activities[status];
};

//Create a new Order for the authenticated Customer
const createOrder = async (request, response) => {

    try {

        const customerId = request.user.userId;

        //Get Checkout information submitted by the Customer
        const {
            bakery_id,
            pickup_slot_id,
            pickup_time,
            contact,
            bakery_note,
            items
        } = request.body;

        if (!Array.isArray(items) || items.length === 0) {
            return response.status(400).json({
                message: "Order must contain at least one product"
            });
        }

        const bakery = await Bakery.findById(bakery_id);

        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        const pickupSlot = await PickupSlot.findOne({
            _id: pickup_slot_id,
            bakery_id: bakery._id,
            is_available: true
        });

        if (!pickupSlot) {
            return response.status(400).json({
                message: "Selected pickup slot is unavailable"
            });
        }

        //Make sure the selected Customer time belongs to the Bakery Pickup window
        if (
            !isPickupTimeValid(
                pickupSlot.pickup_time,
                pickup_time
            )
        ) {
            return response.status(400).json({
                message: "Selected pickup time is unavailable"
            });
        }

        const preparedItems = [];

        for (const requestedItem of items) {

            const preparedItem =
                await prepareOrderItem(
                    requestedItem,
                    bakery,
                    pickupSlot
                );

            preparedItems.push(preparedItem);
        }

        const totalPrice = roundMoney(
            preparedItems.reduce(
                (total, item) =>
                    total + item.item_total,
                0
            )
        );

        const amountDueNow = roundMoney(
            preparedItems.reduce(
                (total, item) =>
                    total + item.amount_due_now,
                0
            )
        );

        //Create the Order using trusted Backend information
        const order = await Order.create({

            customer_id: customerId,

            order_number: `BAK-${Date.now()}`,

            bakery_id: bakery._id,

            //Save Contact information used for this specific Order
            contact_first_name: contact.first_name,
            contact_last_name: contact.last_name,
            contact_email: contact.email,
            contact_phone: contact.phone_number,

            //Save the original Pickup window and exact Customer time
            pickup_slot_id: pickupSlot._id,
            pickup_date: pickupSlot.pickup_date,
            pickup_time: pickup_time,

            //Save optional Customer note
            bakery_note: bakery_note || "",

            //Trusted prices calculated by the Backend
            total_price: totalPrice,

            status: "pending",

            deposit_required:
                amountDueNow < totalPrice,

            amount_due_now: amountDueNow,

            amount_paid: 0,

            payment_status: "unpaid"
        });

        //Store the Order creation in its Activity history
        await OrderActivity.create({
            order_id: order._id,
            activity_type: "order_placed",
            description: "Order placed"
        });

        await saveOrderItems(
            order,
            preparedItems
        );

        //Create a dashboard Notification for the Bakery Owner
        try {

            await Notification.create({

                order_id:
                    order._id,

                user_id:
                    bakery.owner_id,

                message:
                    `New order ${order.order_number} from ${order.contact_first_name} ${order.contact_last_name} for $${Number(order.total_price).toFixed(2)}`
            });


        } catch (notificationError) {

            //Do not fail the Customer's Order if Notification creation fails
            console.error(
                "New Order notification error:",
                notificationError.message
            );
        }


        //Send a new Order email to the Bakery Owner
        try {

            //Find the Bakery Owner account
            const bakeryOwner =
                await User.findById(
                    bakery.owner_id
                );


            //Send email only when the Owner account exists
            if (bakeryOwner) {

                await sendNewOrderEmail(
                    bakeryOwner.email,
                    bakery.name,
                    order
                );
            }


        } catch (emailError) {

            //Do not fail the Customer's Order if email delivery fails
            console.error(
                "New Order email error:",
                emailError.message
            );
        }

        const completeOrder =
            await getCompleteOrderDetails(order);

        return response.status(201).json({
            message: "Order created successfully",
            order: completeOrder
        });

    } catch (error) {

        console.error(
            "Create order error:",
            error.message
        );

        return response.status(500).json({
            message: error.message || "Unable to create order"
        });
    }
};

//Cancels a pending Order belonging to the authenticated Customer
const cancelMyOrder = async (request, response) => {

    try {

        //Get the authenticated Customer's user ID
        const customerId =
            request.user.userId;

        //Get the Order ID from the URL
        const orderId =
            request.params.id;

        //Find the Order only if it belongs to this Customer
        const order =
            await Order.findOne({

                _id:
                    orderId,

                customer_id:
                    customerId
            });


        //Stop if the Order does not exist
        if (!order) {

            return response.status(404).json({

                message:
                    "Order not found"
            });
        }


        //Only pending Orders can be cancelled by the Customer
        if (
            order.status !==
            "pending"
        ) {

            return response.status(400).json({

                message:
                    "Only pending orders can be cancelled"
            });
        }


        //Cancel the Order
        order.status =
            "cancelled";

        await order.save();


        //Store cancellation in Order Activity
        await OrderActivity.create({

            order_id:
                order._id,

            activity_type:
                "order_cancelled",

            description:
                "Order cancelled by customer"
        });


        //Return the updated Order
        return response.status(200).json({

            message:
                "Order cancelled successfully",

            order:
                order
        });


    } catch (error) {

        console.error(
            "Cancel customer order error:",
            error.message
        );

        return response.status(500).json({

            message:
                error.message ||
                "Unable to cancel order"
        });
    }
};

//Updates editable information for a pending Customer Order
const updateMyPendingOrder = async (
    request,
    response
) => {

    try {

        //Get authenticated Customer ID
        const customerId =
            request.user.userId;

        //Get Order ID from URL
        const orderId =
            request.params.id;


        //Get editable Order information
        const {
            pickup_slot_id,
            pickup_time,
            contact,
            bakery_note
        } = request.body;


        //Find Order only if it belongs to this Customer
        const order =
            await Order.findOne({

                _id:
                    orderId,

                customer_id:
                    customerId
            });


        //Stop if Order does not exist
        if (!order) {

            return response.status(404).json({

                message:
                    "Order not found"
            });
        }


        //Customer can only edit pending Orders
        if (
            order.status !==
            "pending"
        ) {

            return response.status(400).json({

                message:
                    "Only pending orders can be edited"
            });
        }


        //Make sure Contact information exists
        if (
            !contact ||
            !contact.first_name?.trim() ||
            !contact.last_name?.trim() ||
            !contact.email?.trim() ||
            !contact.phone_number?.trim()
        ) {

            return response.status(400).json({

                message:
                    "Complete contact information is required"
            });
        }


        //Bakery note cannot be longer than 300 characters
        if (
            bakery_note &&
            bakery_note.length >
            300
        ) {

            return response.status(400).json({

                message:
                    "Bakery note cannot be longer than 300 characters"
            });
        }


        //Make sure Pickup information exists
        if (
            !pickup_slot_id ||
            !pickup_time
        ) {

            return response.status(400).json({

                message:
                    "Pickup date and time are required"
            });
        }


        //Find selected Pickup Slot inside this Order's Bakery
        const pickupSlot =
            await PickupSlot.findOne({

                _id:
                    pickup_slot_id,

                bakery_id:
                    order.bakery_id,

                is_available:
                    true
            });


        //Stop if Pickup Slot is unavailable
        if (!pickupSlot) {

            return response.status(400).json({

                message:
                    "Selected pickup slot is unavailable"
            });
        }


        //Make sure selected time belongs to Pickup window
        if (
            !isPickupTimeValid(
                pickupSlot.pickup_time,
                pickup_time
            )
        ) {

            return response.status(400).json({

                message:
                    "Selected pickup time is unavailable"
            });
        }


        //Get the selected Pickup day
        const pickupDay =
            new Date(
                pickupSlot.pickup_date
            )
                .toLocaleDateString(
                    "en-US",
                    {
                        weekday:
                            "long",

                        timeZone:
                            "UTC"
                    }
                )
                .toLowerCase();


        //Get Products already included in this Order
        const orderItems =
            await OrderItem.find({

                order_id:
                    order._id
            });


        //Make sure existing Products are available on new Pickup day
        for (
            const orderItem
            of orderItems
        ) {

            const product =
                await Product.findOne({

                    _id:
                        orderItem.product_id,

                    bakery_id:
                        order.bakery_id
                });


            //Stop if Product no longer exists
            if (!product) {

                return response.status(400).json({

                    message:
                        `${orderItem.product_name} is no longer available`
                });
            }


            //Check Product Pickup day availability
            if (
                product.available_pickup_days.length >
                0 &&
                !product.available_pickup_days.includes(
                    pickupDay
                )
            ) {

                return response.status(400).json({

                    message:
                        `${product.name} is not available for pickup on ${pickupDay}`
                });
            }
        }


        //Update Contact information
        order.contact_first_name =
            contact.first_name.trim();

        order.contact_last_name =
            contact.last_name.trim();

        order.contact_email =
            contact.email
                .trim()
                .toLowerCase();

        order.contact_phone =
            contact.phone_number.trim();


        //Update Pickup information
        order.pickup_slot_id =
            pickupSlot._id;

        order.pickup_date =
            pickupSlot.pickup_date;

        order.pickup_time =
            pickup_time;


        //Update optional Bakery note
        order.bakery_note =
            bakery_note?.trim() ||
            "";


        //Save updated Order
        await order.save();


        //Load complete updated Order information
        const completeOrder =
            await getCompleteOrderDetails(
                order
            );


        //Return updated Order
        return response.status(200).json({

            message:
                "Order updated successfully",

            order:
                completeOrder
        });


    } catch (error) {

        console.error(
            "Update customer order error:",
            error.message
        );


        return response.status(500).json({

            message:
                error.message ||
                "Unable to update order"
        });
    }
};

//Export Order controller functions
export {
    createOrder,
    getBakeryOrders,
    getBakeryOrderById,
    updateBakeryOrderStatus,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    updateMyPendingOrder
};