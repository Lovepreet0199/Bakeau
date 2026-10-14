//Import the Bakery model to identify the logged-in Bakery Owner's bakery
import Bakery from "../models/Bakery.js";

//Import the Order model to calculate Dashboard statistics
import Order from "../models/Order.js";

//Import the Order Item model to count Products in Orders
import OrderItem from "../models/OrderItem.js";


//Rounds money values to two decimal places
const roundMoney = (amount) => {

    return Math.round(
        (amount + Number.EPSILON) * 100
    ) / 100;
};


//Gets Dashboard summary data for the authenticated Bakery Owner
const getBakeryDashboard = async (
    request,
    response
) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId =
            request.user.userId;


        //Get optional date filters from the URL
        const {
            from,
            to
        } = request.query;


        //Find the Bakery belonging to the logged-in Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        //Stop if the Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Start the Dashboard Order filter with this Bakery
        const orderFilter = {
            bakery_id: bakery._id
        };


        //Stores optional Order date filters
        const createdAtFilter = {};


        //Add the selected start date
        if (from) {

            const fromDate = new Date(
                `${from}T00:00:00.000Z`
            );


            //Stop if the start date is invalid
            if (
                Number.isNaN(
                    fromDate.getTime()
                )
            ) {

                return response.status(400).json({
                    message: "Invalid from date"
                });
            }


            createdAtFilter.$gte =
                fromDate;
        }


        //Add the selected end date
        if (to) {

            const toDate = new Date(
                `${to}T23:59:59.999Z`
            );


            //Stop if the end date is invalid
            if (
                Number.isNaN(
                    toDate.getTime()
                )
            ) {

                return response.status(400).json({
                    message: "Invalid to date"
                });
            }


            createdAtFilter.$lte =
                toDate;
        }


        //Prevent the start date from being later than the end date
        if (
            createdAtFilter.$gte &&
            createdAtFilter.$lte &&
            createdAtFilter.$gte >
            createdAtFilter.$lte
        ) {

            return response.status(400).json({
                message:
                    "From date cannot be later than to date"
            });
        }


        //Add the date filter when a date was selected
        if (
            createdAtFilter.$gte ||
            createdAtFilter.$lte
        ) {

            orderFilter.created_at =
                createdAtFilter;
        }


        //Get Orders for Dashboard statistics and Recent Orders
        const orders = await Order.find(
            orderFilter
        )
            .select(
                [
                    "order_number",
                    "customer_id",
                    "contact_first_name",
                    "contact_last_name",
                    "total_price",
                    "amount_paid",
                    "payment_status",
                    "status",
                    "created_at"
                ].join(" ")
            )
            .sort({
                created_at: -1
            });


        //Count all Orders in the selected date range
        const totalOrders =
            orders.length;


        //Get Completed Orders
        const completedOrders =
            orders.filter(
                (order) =>
                    order.status ===
                    "completed"
            );


        //Count Completed Orders
        const completedOrderCount =
            completedOrders.length;


        //Calculate sales from Completed Orders
        const totalSales =
            completedOrders.reduce(
                (total, order) =>
                    total +
                    Number(
                        order.total_price ||
                        0
                    ),
                0
            );


        //Calculate money recorded as paid
        const revenue =
            orders.reduce(
                (total, order) =>
                    total +
                    Number(
                        order.amount_paid ||
                        0
                    ),
                0
            );


        //Do not include Cancelled Orders in average Order value
        const activeOrders =
            orders.filter(
                (order) =>
                    order.status !==
                    "cancelled"
            );


        //Calculate total value of active Orders
        const activeOrderTotal =
            activeOrders.reduce(
                (total, order) =>
                    total +
                    Number(
                        order.total_price ||
                        0
                    ),
                0
            );


        //Calculate average Order value
        const averageOrderValue =
            activeOrders.length > 0
                ? activeOrderTotal /
                activeOrders.length
                : 0;


        //Get unique Customers who placed Orders
        const customerIds = new Set(

            orders
                .map(
                    (order) =>
                        order.customer_id
                            ?.toString()
                )
                .filter(Boolean)
        );


        //Get the five newest Orders
        const recentOrders =
            orders.slice(0, 5);


        //Add item count to each Recent Order
        const recentOrdersWithItems =
            await Promise.all(

                recentOrders.map(
                    async (order) => {

                        //Count Products in this Order
                        const itemCount =
                            await OrderItem.countDocuments({
                                order_id:
                                    order._id
                            });


                        return {

                            _id:
                                order._id,

                            order_number:
                                order.order_number,

                            customer_name:
                                `${order.contact_first_name} ${order.contact_last_name}`,

                            item_count:
                                itemCount,

                            total_price:
                                order.total_price,

                            amount_paid:
                                order.amount_paid,

                            payment_status:
                                order.payment_status,

                            status:
                                order.status,

                            created_at:
                                order.created_at
                        };
                    }
                )
            );


        /*
            NEEDS ATTENTION

            This intentionally checks all active Bakery Orders
            instead of only Orders in the selected date range.

            An Order needs attention when:
            - It is still Pending
            OR
            - It is not Paid and is still active
        */
        const attentionOrders =
            await Order.find({

                bakery_id:
                    bakery._id,

                //Do not include finished Orders
                status: {
                    $nin: [
                        "cancelled",
                        "completed"
                    ]
                },

                //Pending Orders or unpaid active Orders need attention
                $or: [

                    {
                        status:
                            "pending"
                    },

                    {
                        payment_status: {
                            $ne: "paid"
                        }
                    }
                ]
            })
                .select(
                    [
                        "order_number",
                        "customer_id",
                        "contact_first_name",
                        "contact_last_name",
                        "total_price",
                        "amount_paid",
                        "payment_status",
                        "status",
                        "created_at"
                    ].join(" ")
                )
                .sort({
                    created_at: -1
                });


        //Store the total number of Orders needing attention
        const attentionCount =
            attentionOrders.length;


        //Only display the five newest Attention Orders
        const attentionOrdersToDisplay =
            attentionOrders.slice(0, 5);


        //Add item count to each Attention Order
        const attentionOrdersWithItems =
            await Promise.all(

                attentionOrdersToDisplay.map(
                    async (order) => {

                        //Count Products in this Order
                        const itemCount =
                            await OrderItem.countDocuments({
                                order_id:
                                    order._id
                            });


                        return {

                            _id:
                                order._id,

                            order_number:
                                order.order_number,

                            customer_name:
                                `${order.contact_first_name} ${order.contact_last_name}`,

                            item_count:
                                itemCount,

                            total_price:
                                order.total_price,

                            amount_paid:
                                order.amount_paid,

                            payment_status:
                                order.payment_status,

                            status:
                                order.status,

                            created_at:
                                order.created_at
                        };
                    }
                )
            );


        //Return Dashboard information
        return response.status(200).json({

            bakery: {

                _id:
                    bakery._id,

                name:
                    bakery.name,

                currency:
                    bakery.currency
            },


            //Dashboard statistic cards
            summary: {

                total_orders:
                    totalOrders,

                completed_orders:
                    completedOrderCount,

                total_sales:
                    roundMoney(
                        totalSales
                    ),

                revenue:
                    roundMoney(
                        revenue
                    ),

                average_order_value:
                    roundMoney(
                        averageOrderValue
                    ),

                customers:
                    customerIds.size
            },


            //Five newest Orders for the Dashboard table
            recent_orders:
                recentOrdersWithItems,


            //Orders requiring Bakery Owner action
            attention: {

                count:
                    attentionCount,

                orders:
                    attentionOrdersWithItems
            },


            //Current Dashboard date filter
            date_range: {

                from:
                    from || null,

                to:
                    to || null
            }
        });


    } catch (error) {

        console.error(
            "Get Bakery Dashboard error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to get Bakery Dashboard"
        });
    }
};


//Export Dashboard controller functions
export {
    getBakeryDashboard
};