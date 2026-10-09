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

//Rounds money values to two decimal places
const roundMoney = (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
};

//Builds complete Order details including items and customizations
const getCompleteOrderDetails = async (order) => {

    //Find all items belonging to this Order
    const orderItems = await OrderItem.find({
        order_id: order._id
    });

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

    //Return the Order with its complete item information
    return {
        ...order.toObject(),
        items: itemsWithCustomizations
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
        }).sort({
            created_at: -1
        });

        //Return the Bakery Orders
        return response.status(200).json({
            orders: orders
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

        //Update the Order only if it belongs to this Bakery
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                bakery_id: bakery._id
            },
            {
                $set: {
                    status: status
                }
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        //Stop if the Order does not exist
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
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

        //Return the Customer's Orders
        return response.status(200).json({
            orders: orders
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

//Create a new Order for the authenticated Customer
const createOrder = async (request, response) => {

    try {

        const customerId = request.user.userId;

        const {
            bakery_id,
            pickup_slot_id,
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

        const preparedItems = [];

        for (const requestedItem of items) {

            const preparedItem =
                await prepareOrderItem(
                    requestedItem,
                    bakery
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

        const order = await Order.create({
            customer_id: customerId,
            order_number: `BAK-${Date.now()}`,
            bakery_id: bakery._id,
            pickup_slot_id: pickupSlot._id,
            pickup_date: pickupSlot.pickup_date,
            pickup_time: pickupSlot.pickup_time,
            total_price: totalPrice,
            status: "pending",
            deposit_required:
                amountDueNow < totalPrice,
            amount_due_now: amountDueNow,
            amount_paid: 0,
            payment_status: "unpaid"
        });

        await saveOrderItems(
            order,
            preparedItems
        );

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

//Export Order controller functions
export {
    getBakeryOrders,
    getBakeryOrderById,
    updateBakeryOrderStatus,
    getMyOrders,
    getMyOrderById
};