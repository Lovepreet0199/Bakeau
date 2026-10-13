//Import the Pickup Slot model to manage Bakery pickup times
import PickupSlot from "../models/PickupSlot.js";

//Import the Bakery model to identify the authenticated Bakery Owner's bakery
import Bakery from "../models/Bakery.js";

//Import Order model to check booked Pickup Slots
import Order from "../models/Order.js";

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

//Gets Pickup availability for one Bakery and month
const getPublicPickupAvailability = async (request, response) => {

    try {

        //Get Bakery slug and requested month
        const slug = request.params.slug;
        const month = request.query.month;

        //Make sure month looks like 2026-10
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return response.status(400).json({
                message: "Month must use YYYY-MM format"
            });
        }

        //Find approved Bakery
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        });

        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Stop if Bakery is not accepting orders
        if (!bakery.accepting_orders) {
            return response.status(200).json({
                availability: {
                    days: []
                }
            });
        }

        //Split requested year and month
        const [year, monthNumber] = month.split("-").map(Number);

        //Start and end of requested month
        const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
        const endDate = new Date(Date.UTC(year, monthNumber, 1));

        //Get available Pickup Slots for this month
        const pickupSlots = await PickupSlot.find({
            bakery_id: bakery._id,
            pickup_date: {
                $gte: startDate,
                $lt: endDate
            },
            is_available: true
        }).sort({
            pickup_date: 1,
            pickup_time: 1
        });

        //Get existing Orders for this month
        const orders = await Order.find({
            bakery_id: bakery._id,
            pickup_date: {
                $gte: startDate,
                $lt: endDate
            },
            status: {
                $ne: "cancelled"
            }
        }).select("pickup_date");


        //Stores number of Orders for each date
        const orderCountByDate = {};

        orders.forEach((order) => {

            const dateKey = order.pickup_date.toISOString().split("T")[0];

            orderCountByDate[dateKey] = (orderCountByDate[dateKey] || 0) + 1;
        });


        //Stores Pickup dates for Calendar
        const days = {};

        pickupSlots.forEach((slot) => {

            const dateKey = slot.pickup_date.toISOString().split("T")[0];

            //Check how many Orders already exist for this day
            const currentOrders = orderCountByDate[dateKey] || 0;

            //Do not show day when maximum Orders are reached
            if (currentOrders >= bakery.maximum_orders_per_day) {
                return;
            }

            //Create date if it is not already added
            if (!days[dateKey]) {
                days[dateKey] = {
                    date: dateKey,
                    available: true,
                    windows: []
                };
            }

            //Add the Bakery Pickup window
            days[dateKey].windows.push({
                pickup_slot_id: slot._id,
                pickup_window: slot.pickup_time
            });
        });


        //Convert object into array
        const availableDays = Object.values(days);


        //Return availability
        return response.status(200).json({
            availability: {
                days: availableDays
            }
        });

    } catch (error) {

        console.error("Get Pickup availability error:", error.message);

        return response.status(500).json({
            message: "Unable to load Pickup availability"
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
    deletePickupSlot,
    getPublicPickupAvailability
};