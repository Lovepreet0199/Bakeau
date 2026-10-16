//Import Bakery model
import Bakery from "../models/Bakery.js";

//Import User model
import User from "../models/User.js";

//Import Review model
import Review from "../models/Review.js";

//Import Bakery status email helper
import {
    sendBakeryStatusEmail
} from "../utils/email.js";

//Gets all Bakery accounts for the Platform Administrator
const getAdminBakeries = async (request, response) => {

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
const updateBakeryStatus = async (
    request,
    response
) => {

    try {

        //Get Bakery ID from URL
        const bakeryId =
            request.params.id;


        //Get new account status
        const {
            account_status
        } = request.body;


        //Only allow Admin approval or suspension
        if (
            account_status !== "Approved" &&
            account_status !== "Suspended"
        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Account status must be Approved or Suspended"
                });
        }


        //Find Bakery
        const bakery =
            await Bakery.findById(
                bakeryId
            );


        //Stop if Bakery does not exist
        if (!bakery) {

            return response
                .status(404)
                .json({

                    message:
                        "Bakery not found"
                });
        }


        //Remember the previous Bakery status
        const previousStatus =
            bakery.account_status;


        //Update Bakery account status
        bakery.account_status =
            account_status;


        //Save Bakery
        await bakery.save();


        /*
            Email the Bakery Owner only when
            the account status actually changed.
        */
        if (
            previousStatus !==
            account_status
        ) {

            try {

                //Find the Bakery Owner account
                const bakeryOwner =
                    await User.findById(
                        bakery.owner_id
                    );


                //Send status email when Owner exists
                if (bakeryOwner) {

                    await sendBakeryStatusEmail(
                        bakeryOwner.email,
                        bakery
                    );
                }

            } catch (emailError) {

                /*
                    Do not fail the Admin action
                    if email delivery fails.
                */
                console.error(
                    "Bakery status email error:",
                    emailError.message
                );
            }
        }


        //Return updated Bakery
        return response
            .status(200)
            .json({

                message:
                    account_status === "Approved"
                        ? "Bakery account approved successfully"
                        : "Bakery account suspended successfully",

                bakery:
                    bakery
            });


    } catch (error) {

        console.error(
            "Admin Bakery status update error:",
            error.message
        );


        return response
            .status(500)
            .json({

                message:
                    "Unable to update Bakery account status"
            });
    }
};

//Gets one Bakery account for the Platform Administrator
const getAdminBakeryById = async (request, response) => {

    try {

        //Get Bakery ID from the URL
        const bakeryId =
            request.params.id;


        //Find Bakery
        const bakery =
            await Bakery.findById(
                bakeryId
            )
                .lean();


        //Stop if Bakery does not exist
        if (!bakery) {

            return response
                .status(404)
                .json({

                    message:
                        "Bakery not found"
                });
        }


        //Load Bakery Owner information
        const owner =
            await User.findOne({
                _id:
                    bakery.owner_id,

                role:
                    "bakeryOwner"
            })
                .select(
                    "first_name last_name email phone_number"
                )
                .lean();


        //Return Bakery and Owner information
        return response
            .status(200)
            .json({

                bakery: {
                    ...bakery,

                    owner:
                        owner || null
                }
            });


    } catch (error) {

        console.error(
            "Admin Bakery details error:",
            error.message
        );


        return response
            .status(500)
            .json({

                message:
                    "Unable to retrieve Bakery account"
            });
    }
};

//Gets all Customer Reviews for the Platform Administrator
const getAdminReviews = async (request, response) => {

    try {

        //Load all Reviews with Customer and Bakery information
        const reviews =
            await Review.find()
                .populate(
                    "customer_id",
                    "first_name last_name email"
                )
                .populate(
                    "bakery_id",
                    "name slug"
                )
                .sort({
                    created_at: -1
                })
                .lean();


        //Return Reviews
        return response
            .status(200)
            .json({

                reviews:
                    reviews
            });


    } catch (error) {

        console.error(
            "Admin Reviews error:",
            error.message
        );


        return response
            .status(500)
            .json({

                message:
                    "Unable to retrieve Customer Reviews"
            });
    }
};

//Removes an inappropriate Customer Review
const removeAdminReview = async (
    request,
    response
) => {

    try {

        //Get Review ID from the URL
        const reviewId =
            request.params.id;


        //Find Review
        const review =
            await Review.findById(
                reviewId
            );


        //Stop if Review does not exist
        if (!review) {

            return response
                .status(404)
                .json({

                    message:
                        "Review not found"
                });
        }


        //Stop if Review was already removed
        if (review.is_removed) {

            return response
                .status(400)
                .json({

                    message:
                        "Review has already been removed"
                });
        }


        //Get authenticated Platform Admin ID
        const adminId =
            request.user.id ||
            request.user.userId ||
            request.user._id;


        //Mark Review as removed
        review.is_removed =
            true;

        review.removed_by_admin_id =
            adminId;

        review.removed_at =
            new Date();


        //Save Review changes
        await review.save();


        //Return updated Review
        return response
            .status(200)
            .json({

                message:
                    "Review removed successfully",

                review:
                    review
            });


    } catch (error) {

        console.error(
            "Admin Review removal error:",
            error.message
        );


        return response
            .status(500)
            .json({

                message:
                    "Unable to remove Review"
            });
    }
};

export {
    getAdminBakeries,
    getAdminBakeryById,
    updateBakeryStatus,
    getAdminReviews,
    removeAdminReview
};