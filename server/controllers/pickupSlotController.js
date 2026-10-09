//Import the Pickup Slot model to manage Bakery pickup times
import PickupSlot from "../models/PickupSlot.js";

//Import the Bakery model to identify the authenticated Bakery Owner's bakery
import Bakery from "../models/Bakery.js";

//Creates a Pickup Slot for the authenticated Bakery Owner
const createPickupSlot = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Get Pickup Slot information from the request
        const {
            pickup_date,
            pickup_time
        } = request.body;

        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Create the new Pickup Slot
        const pickupSlot = await PickupSlot.create({
            bakery_id: bakery._id,
            pickup_date: pickup_date,
            pickup_time: pickup_time,
            is_available: true
        });

        //Return the created Pickup Slot
        return response.status(201).json({
            message: "Pickup slot created successfully",
            pickupSlot: pickupSlot
        });

    } catch (error) {

        //Handle duplicate Pickup Slots
        if (error.code === 11000) {
            return response.status(409).json({
                message: "This pickup slot already exists"
            });
        }

        console.error(
            "Create pickup slot error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to create pickup slot"
        });
    }
};


//Gets all Pickup Slots belonging to the authenticated Bakery Owner
const getBakeryPickupSlots = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find all Pickup Slots belonging to this Bakery
        const pickupSlots = await PickupSlot.find({
            bakery_id: bakery._id
        }).sort({
            pickup_date: 1,
            pickup_time: 1
        });

        //Return the Bakery Pickup Slots
        return response.status(200).json({
            pickupSlots: pickupSlots
        });

    } catch (error) {

        console.error(
            "Get bakery pickup slots error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to get pickup slots"
        });
    }
};


//Gets available Pickup Slots for a public Bakery storefront
const getPublicPickupSlots = async (request, response) => {

    try {

        //Get the Bakery ID from the URL
        const bakeryId = request.params.bakeryId;

        //Find available Pickup Slots belonging to this Bakery
        const pickupSlots = await PickupSlot.find({
            bakery_id: bakeryId,
            is_available: true
        }).sort({
            pickup_date: 1,
            pickup_time: 1
        });

        //Return the available Pickup Slots
        return response.status(200).json({
            pickupSlots: pickupSlots
        });

    } catch (error) {

        console.error(
            "Get public pickup slots error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to get pickup slots"
        });
    }
};


//Updates a Pickup Slot belonging to the authenticated Bakery Owner
const updatePickupSlot = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Get the Pickup Slot ID from the URL
        const pickupSlotId = request.params.id;

        //Get fields that may be updated
        const {
            pickup_date,
            pickup_time,
            is_available
        } = request.body;

        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Update the Pickup Slot only if it belongs to this Bakery
        const pickupSlot = await PickupSlot.findOneAndUpdate(
            {
                _id: pickupSlotId,
                bakery_id: bakery._id
            },
            {
                $set: {
                    ...(pickup_date !== undefined && {
                        pickup_date: pickup_date
                    }),
                    ...(pickup_time !== undefined && {
                        pickup_time: pickup_time
                    }),
                    ...(is_available !== undefined && {
                        is_available: is_available
                    })
                }
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        //Stop if the Pickup Slot does not exist
        if (!pickupSlot) {
            return response.status(404).json({
                message: "Pickup slot not found"
            });
        }

        //Return the updated Pickup Slot
        return response.status(200).json({
            message: "Pickup slot updated successfully",
            pickupSlot: pickupSlot
        });

    } catch (error) {

        //Handle duplicate Pickup Slots
        if (error.code === 11000) {
            return response.status(409).json({
                message: "This pickup slot already exists"
            });
        }

        console.error(
            "Update pickup slot error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to update pickup slot"
        });
    }
};


//Deletes a Pickup Slot belonging to the authenticated Bakery Owner
const deletePickupSlot = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Get the Pickup Slot ID from the URL
        const pickupSlotId = request.params.id;

        //Find the Bakery belonging to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery does not exist
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Delete the Pickup Slot only if it belongs to this Bakery
        const pickupSlot = await PickupSlot.findOneAndDelete({
            _id: pickupSlotId,
            bakery_id: bakery._id
        });

        //Stop if the Pickup Slot does not exist
        if (!pickupSlot) {
            return response.status(404).json({
                message: "Pickup slot not found"
            });
        }

        //Return successful delete response
        return response.status(200).json({
            message: "Pickup slot deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete pickup slot error:",
            error.message
        );

        return response.status(500).json({
            message: "Unable to delete pickup slot"
        });
    }
};


//Export Pickup Slot controller functions
export {
    createPickupSlot,
    getBakeryPickupSlots,
    getPublicPickupSlots,
    updatePickupSlot,
    deletePickupSlot
};