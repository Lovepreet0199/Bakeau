//Import the Bakery model to create and manage bakery records
import Bakery from "../models/Bakery.js";

//Create a bakery for the authenticated Bakery Owner
const createBakery = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Check if the Bakery Owner already has a bakery
        const existingBakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Prevent a Bakery Owner from creating more than one bakery
        if (existingBakery) {
            return response.status(400).json({
                message: "You already have a bakery"
            });
        }

        //Get the bakery information submitted by the Bakery Owner
        const {
            name,
            contact_email,
            contact_phone,
            description,
            pickup_instructions,
            address,
            storefront_theme
        } = request.body;

        //Create a URL-friendly slug from the bakery name
        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        //Start with the bakery name as the preferred slug
        let slug = baseSlug;

        //Start the number used if the the preferred slug is already taken
        let slugNumber = 2;

        //Check for duplicate slugs and add a number until a unique slug is found
        while (await Bakery.findOne({ slug: slug })) {

            //Add the next available number to the slug
            slug = `${baseSlug}-${slugNumber}`;

            //Increase the number in case this slug is also taken
            slugNumber++;
        }

        //Create the bakery and connect it to the authenticated Bakery Owner
        const newBakery = await Bakery.create({
            owner_id: ownerId,
            name: name,
            slug: slug,
            contact_email: contact_email,
            contact_phone: contact_phone,
            description: description,
            pickup_instructions: pickup_instructions,
            address: address,
            storefront_theme: storefront_theme
        });

        //Return the newly created bakery
        return response.status(201).json({
            message: "Bakery created successfully",
            bakery: newBakery
        });

    } catch (error) {
        console.error("Bakery creation error: ", error.message);

        return response.status(500).json({
            message: "Unable to create bakery"
        });
    }
};

//Get the authenticated Bakery Owner's bakery
const getMyBakery = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Check if the Bakery Owner has created a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Return the Bakery Owner's bakery
        return response.status(200).json({
            message: "Bakery retrieved successfully",
            bakery: bakery
        });

    } catch (error) {
        console.error("Get bakery error: ", error.message);

        return response.status(500).json({
            message: "Unable to get bakery"
        });
    }
};

//Update the authenticated Bakery Owner's bakery
const updateMyBakery = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the bakery information that the Bakery Owner is allowed to update
        const {
            name,
            contact_email,
            contact_phone,
            description,
            pickup_instructions,
            address,
            storefront_theme
        } = request.body;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Check if the Bakery Owner has a bakery to update
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Update the bakery information
        bakery.name = name;
        bakery.contact_email = contact_email;
        bakery.contact_phone = contact_phone;
        bakery.description = description;
        bakery.pickup_instructions = pickup_instructions;
        bakery.address = address;
        bakery.storefront_theme = storefront_theme;

        //Save the updated bakery information to the database
        await bakery.save();

        //Return the updated bakery
        return response.status(200).json({
            message: "Bakery updated successfully",
            bakery: bakery
        });

    } catch (error) {
        console.error("Bakery update error: ", error.message);

        return response.status(500).json({
            message: "Unable to update bakery"
        });
    }
};

//Export the bakery controller functions so they can be used in bakery routes
export { createBakery, getMyBakery, updateMyBakery };