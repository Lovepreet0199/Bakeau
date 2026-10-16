//Import Bakery model
import Bakery from "../models/Bakery.js";

//Import Order model
import Order from "../models/Order.js";

//Import Product model
import Product from "../models/Product.js";

//Import User model
import User from "../models/User.js";


//Searches Bakery Orders, Products, and Customers
const searchBakeryDashboard = async (
    request,
    response
) => {

    try {

        //Get logged-in Bakery Owner ID
        const ownerId =
            request.user.userId;


        //Get Search text from URL
        const searchTerm =
            request.query.q?.trim() || "";


        //Do not Search when text is empty
        if (!searchTerm) {

            return response.status(200).json({
                orders: [],
                products: [],
                customers: []
            });
        }


        //Find Bakery belonging to this Owner
        const bakery =
            await Bakery.findOne({
                owner_id: ownerId
            });


        //Stop if Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message:
                    "Bakery not found"
            });
        }


        /*
            Create a case-insensitive Search.

            Example:
            "cake" also matches "Cake".
        */
        const searchRegex =
            new RegExp(
                searchTerm,
                "i"
            );


        //Search Bakery Orders
        const orders =
            await Order.find({

                bakery_id:
                    bakery._id,

                $or: [
                    {
                        order_number:
                            searchRegex
                    },
                    {
                        contact_first_name:
                            searchRegex
                    },
                    {
                        contact_last_name:
                            searchRegex
                    },
                    {
                        contact_email:
                            searchRegex
                    }
                ]
            })
                .select(
                    "order_number contact_first_name contact_last_name total_price status"
                )
                .sort({
                    created_at: -1
                })
                .limit(5);


        //Search Bakery Products
        const products =
            await Product.find({

                bakery_id:
                    bakery._id,

                $or: [
                    {
                        name:
                            searchRegex
                    },
                    {
                        category:
                            searchRegex
                    }
                ]
            })
                .select(
                    "name category base_price image_url status"
                )
                .limit(5);


        /*
            Find Customer IDs from Orders.

            This makes sure Search only shows Customers
            who have actually ordered from this Bakery.
        */
        const bakeryCustomerIds =
            await Order.distinct(
                "customer_id",
                {
                    bakery_id:
                        bakery._id
                }
            );


        //Search Customers belonging to this Bakery
        const customers =
            await User.find({

                _id: {
                    $in:
                        bakeryCustomerIds
                },

                $or: [
                    {
                        first_name:
                            searchRegex
                    },
                    {
                        last_name:
                            searchRegex
                    },
                    {
                        email:
                            searchRegex
                    },
                    {
                        phone_number:
                            searchRegex
                    }
                ]
            })
                .select(
                    "first_name last_name email phone_number"
                )
                .limit(5);


        //Return Search results
        return response.status(200).json({

            orders:
                orders,

            products:
                products,

            customers:
                customers
        });


    } catch (error) {

        console.error(
            "Dashboard search error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to search dashboard"
        });
    }
};


//Export Search controller
export {
    searchBakeryDashboard
};