//Import Bakery model
import Bakery from "../models/Bakery.js";

//Import User model
import User from "../models/User.js";


//Gets all Bakery accounts for the Platform Administrator
const getAdminBakeries = async (
    request,
    response
) => {

    try {

        //Load all Bakery accounts
        const bakeries =
            await Bakery.find()
                .lean();


        //Get all Bakery Owner IDs
        const ownerIds =
            bakeries.map(
                (bakery) =>
                    bakery.owner_id
            );


        //Load Bakery Owner account information
        const owners =
            await User.find({
                _id: {
                    $in:
                        ownerIds
                },
                role:
                    "bakeryOwner"
            })
                .select(
                    "first_name last_name email"
                )
                .lean();


        //Combine Bakery and Owner information
        const bakeryAccounts =
            bakeries.map(
                (bakery) => {

                    const owner =
                        owners.find(
                            (owner) =>
                                owner._id.toString() ===
                                bakery.owner_id.toString()
                        );


                    return {

                        ...bakery,

                        owner:
                            owner || null
                    };
                }
            );


        //Return Bakery accounts
        return response
            .status(200)
            .json({

                bakeries:
                    bakeryAccounts
            });


    } catch (error) {

        console.error(
            "Admin Bakery list error:",
            error.message
        );


        return response
            .status(500)
            .json({

                message:
                    "Unable to retrieve Bakery accounts"
            });
    }
};

//Update a Bakery account status
const updateBakeryStatus = async (request, response) => {
    try {

        //Get Bakery ID from URL
        const bakeryId = request.params.id;

        //Get new account status
        const {
            account_status
        } = request.body;

        //Only allow Admin approval or suspension
        if (account_status !== "Approved" && account_status !== "Suspended") {
            return response.status(400).json({
                message: "Account status must be Approved or Suspended"
            });
        }

        //Find Bakery
        const bakery = await Bakery.findById(bakeryId);

        //Stop if Bakery does not exist
        if (!bakery) {

            return response
                .status(404)
                .json({

                    message:
                        "Bakery not found"
                });
        }

        //Update Bakery account status
        bakery.account_status = account_status;

        //Save Bakery
        await bakery.save();

        //Return updated bakery
        return response.status(200).json({
            message: account_status === "Approved" ? "Bakery account approved successfully" : "Bakery account suspended successfully",
            bakery: bakery
        });

    } catch (error) {

        console.error("Admin Bakery status update error: ", error.message);

        return response.status(500).json({
            message: "Unable to update Bakery account status"
        });

    }
};


export {
    getAdminBakeries,
    updateBakeryStatus
};