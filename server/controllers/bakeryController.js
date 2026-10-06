//Import the Bakery model to create and manage bakery records
import Bakery from "../models/Bakery.js";

//Import the Product model to retrieve products for the public bakery storefront
import Product from "../models/Product.js";

//Import the Customization Group model to retrieve product customization groups
import CustomizationGroup from "../models/CustomizationGroup.js";

//Import the Customization Option model to retrieve options for each customization group
import CustomizationOption from "../models/CustomizationOption.js";

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
            storefront_theme,
            primary_color,
            secondary_color,
            dark_color
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
            storefront_theme: storefront_theme,
            primary_color: primary_color,
            secondary_color: secondary_color,
            dark_color: dark_color
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
            storefront_theme,
            primary_color,
            secondary_color,
            dark_color
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
        bakery.primary_color = primary_color;
        bakery.secondary_color = secondary_color;
        bakery.dark_color = dark_color;

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

//Get a public bakery storefront using its unique slug
const getPublicBakery = async (request, response) => {
    try {
        //Get the bakery slug from the URL
        const slug = request.params.slug;

        //Find an approved bakery that matches the slug from the URL
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        }).select("-owner_id -__v");

        //Stop if the bakery does not exist or is not approved
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Return the approved bakery information for the public storefront
        return response.status(200).json({
            bakery: bakery
        });

    } catch (error) {
        console.error("Public bakery retrieval error: ", error.message);

        return response.status(500).json({
            message: "Unable to retrieve bakery"
        });
    }
};

//Get the public products for a bakery using its unique slug
const getPublicBakeryProducts = async (request, response) => {
    try {
        //Get the bakery slug from the URL
        const slug = request.params.slug;

        //Find the approved bakery that matches the slug from the URL
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        });

        //Stop if the bakery does not exist or is not approved
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the public products that belong to this bakery
        const products = await Product.find({
            bakery_id: bakery._id,
            is_visible: true,
            is_available: true
        }).select("-image_public_id -__v");

        //Return the bakery's public products
        return response.status(200).json({
            products: products
        });

    } catch (error) {
        console.error("Public bakery products retrieval error: ", error.message);

        return response.status(500).json({
            message: "Unable to retrieve bakery products"
        });
    }
};

//Get a public product and its customization details for a specific bakery
const getPublicBakeryProduct = async (request, response) => {
    try {
        //Get the bakery slug and product ID from the URL
        const slug = request.params.slug;
        const productId = request.params.productId;

        //Find the approved bakery that matches the slug from the URL
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        });

        //Stop if the bakery does not exist or is not approved
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the public product and make sure it belongs to this bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id,
            is_visible: true,
            is_available: true
        }).select("-image_public_id -__v");

        //Stop if the product does not exist or does not belong to this bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Find all customization groups that belong to this product
        const customizationGroups = await CustomizationGroup.find({
            product_id: product._id
        }).select("-__v");

        //Create an array to store each customization group together with its options
        const customizationDetails = [];

        //Loop through each customization group to find its options
        for (const customizationGroup of customizationGroups) {

            //Find all customization options that belong to the current group
            const customizationOptions = await CustomizationOption.find({
                group_id: customizationGroup._id
            }).select("-__v");

            //Add the customization group and its options to the customization details array
            customizationDetails.push({
                group: customizationGroup,
                options: customizationOptions
            });
        }

        //Return the public product together with its customization groups and options
        return response.status(200).json({
            product: product,
            customizationDetails: customizationDetails
        });

    } catch (error) {
        console.error("Public product retrieval error: ", error.message);

        return response.status(500).json({
            message: "Unable to retrieve product"
        });
    }
};

//Export bakery controller functions so they can be used in the routes
export {
    createBakery,
    getMyBakery,
    updateMyBakery,
    getPublicBakery,
    getPublicBakeryProducts,
    getPublicBakeryProduct
};