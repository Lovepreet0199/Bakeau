//Import Bakery model
import Bakery from "../models/Bakery.js";

//Import Order model
import Order from "../models/Order.js";


//Gets all Customers who have ordered from the authenticated Bakery Owner
const getBakeryCustomers = async (request, response) => {

    try {

        //Get authenticated Bakery Owner ID
        const ownerId = request.user.userId;


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


        //Stores unique Customers
        const customerMap = new Map();


        //Go through Bakery Orders
        for (const order of orders) {

            //Skip Orders without a Customer
            if (!order.customer_id) {
                continue;
            }


            const customer = order.customer_id;

            const customerId =
                customer._id.toString();


            //Create Customer if they have not been added yet
            if (!customerMap.has(customerId)) {

                customerMap.set(
                    customerId,
                    {
                        _id: customer._id,
                        first_name: customer.first_name,
                        last_name: customer.last_name,
                        email: customer.email,
                        phone_number:
                            customer.phone_number || "",
                        order_count: 0,
                        total_spent: 0,
                        last_order_date:
                            order.created_at
                    }
                );
            }


            //Get stored Customer
            const storedCustomer =
                customerMap.get(customerId);


            //Increase Customer Order count
            storedCustomer.order_count += 1;


            //Add amount actually paid
            storedCustomer.total_spent +=
                Number(order.amount_paid || 0);
        }


        //Convert Map into Array
        const customers =
            Array.from(
                customerMap.values()
            );


        //Return Bakery Customers
        return response.status(200).json({
            customers: customers
        });


    } catch (error) {

        console.error(
            "Get bakery customers error:",
            error.message
        );


        return response.status(500).json({
            message: "Unable to get bakery customers"
        });
    }
};


//Export Customer controller functions
export {
    getBakeryCustomers
};