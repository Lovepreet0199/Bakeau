//Import the Bakery model to identify the authenticated owner's bakery
import Bakery from "../models/Bakery.js";

//Import the Product model to make sure the product belongs to the owner's bakery
import Product from "../models/Product.js";

//Import the Customization Group model to manage product customization groups
import CustomizationGroup from "../models/CustomizationGroup.js";

//Import the Customization Option model to manage customization options
import CustomizationOption from "../models/CustomizationOption.js";

//Create a customization group for a product owner by the authenticated Bakery Owner
const createCustomizationGroup = async (request, response) => {

    try {
        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the product ID from the URL
        const productId = request.params.productId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner does not have a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the product and make sure it belongs to the authenticated owner's bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id
        });

        //Stop if the product does not exist or does not belong to this bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Get the customization group information submitted by the Bakery Owner
        const {
            name,
            is_required
        } = request.body;

        //Create the customization group and connect it to the verified product
        const newCustomizationGroup = await CustomizationGroup.create({
            product_id: product._id,
            name: name,
            is_required: is_required
        });

        //Return the newly created customization group
        return response.status(201).json({
            message: "Customization group created successfully",
            customizationGroup: newCustomizationGroup
        });

    } catch (error) {
        console.error("Customization group creation error: ", error.message);

        return response.status(500).json({
            message: "Unable to create customization group"
        });
    }
};

//Get all customization groups for a product owned by the authenticated Bakery Owner
const getCustomizationGroups = async (request, response) => {
    try {
        //Get the authenticated Bakery Owner's user ID from verified JWT
        const ownerId = request.user.userId;

        //Get the product ID from the URL
        const productId = request.params.productId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner does not have a bakery 
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the product and make sure it belongs to the authenticated owner's bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id
        });

        //Stop if the product does not exist or does not belong to this bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Find all customization groups that belong to the verified product
        const customizationGroups = await CustomizationGroup.find({
            product_id: product._id
        });

        //Return all customization groups that belong to the product
        return response.status(200).json({
            customizationGroups: customizationGroups
        });

    } catch (error) {
        console.error("Get customization groups error: ", error.message);

        return response.status(500).json({
            message: "Unable to get customization groups"
        });
    }
};

//Update a customization group owned by the authenticated Bakery Owner
const updateCustomizationGroup = async (request, response) => {
    try {
        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the customization group ID from the URL
        const groupId = request.params.groupId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner does not have a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the customization group using the group ID from the URL
        const customizationGroup = await CustomizationGroup.findOne({
            _id: groupId
        });

        //Stop if the customization group does not exist
        if (!customizationGroup) {
            return response.status(404).json({
                message: "Customization group not found"
            });
        }

        //Find the product connected to the customization group and make sure it belongs to the owner's bakery
        const product = await Product.findOne({
            _id: customizationGroup.product_id,
            bakery_id: bakery._id
        });

        //Stop if the product does not belong to the authenticated owner's bakery
        if (!product) {
            return response.status(404).json({
                message: "Customization group not found"
            });
        }

        //Get the updated customization group information submitted by the Bakery Owner
        const {
            name,
            is_required
        } = request.body;

        //Update the customization group with the submitted information
        customizationGroup.name = name;
        customizationGroup.is_required = is_required;

        //Save the updated customization group in the database
        await customizationGroup.save();

        //Return the updated customization group to the Bakery Owner
        return response.status(200).json({
            message: "Customization group updated successfully",
            customizationGroup: customizationGroup
        });

    } catch (error) {
        console.error("Customization group update error: ", error.message);

        return response.status(500).json({
            message: "Unable to update customization group"
        });
    }
};

//Delete a customization group owned by the authenticated Bakery Owner
const deleteCustomizationGroup = async (request, response) => {
    try {
        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the customization group ID from the URL
        const groupId = request.params.groupId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner does not have a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the customization group using the group ID from the URL
        const customizationGroup = await CustomizationGroup.findOne({
            _id: groupId
        });

        //Stop if the customization group does not exist
        if (!customizationGroup) {
            return response.status(404).json({
                message: "Customization group not found"
            });
        }

        //Find the product connected to the customization group and make sure it belongs to the owner's bakery
        const product = await Product.findOne({
            _id: customizationGroup.product_id,
            bakery_id: bakery._id
        });

        //Stop if the customization group does not belong to the authenticated owner's bakery
        if (!product) {
            return response.status(404).json({
                message: "Customization group not found"
            });
        }

        //Delete all customization options that belong to this customization group
        await CustomizationOption.deleteMany({
            group_id: customizationGroup._id
        });

        //Delete the customization group from the database
        await customizationGroup.deleteOne();

        //Return a success message after the customization group is deleted
        return response.status(200).json({
            message: "Customization group deleted successfully"
        });

    } catch (error) {
        console.error("Customization group deletion error: ", error.message);

        return response.status(500).json({
            message: "Unable to delete customization group"
        });
    }
};

//Create a customization option for a group owned by the authenticated Bakery Owner
const createCustomizationOption = async (request, response) => {
    try {
        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the customization group ID from the URL
        const groupId = request.params.groupId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner does not have a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the customization group using group ID from the URL
        const customizationGroup = await CustomizationGroup.findOne({
            _id: groupId
        });

        //Stop if the customization group does not exist
        if (!customizationGroup) {
            return response.status(404).json({
                message: "Customization group not found"
            });
        }

        //Find the product connected to the customization group and make sure it belongs to the owner's bakery
        const product = await Product.findOne({
            _id: customizationGroup.product_id,
            bakery_id: bakery._id
        });

        //Stop if the customization group does not belong to the authenticated owner's bakery
        if (!product) {
            return response.status(404).json({
                message: "Customization group not found"
            });
        }

        //Get the customization option information submitted by the Bakery Owner
        const {
            name,
            additional_price
        } = request.body;

        //Create the customization option and connect it to the verified customization group
        const newCustomizationOption = await CustomizationOption.create({
            group_id: customizationGroup._id,
            name: name,
            additional_price: additional_price
        });

        //Return the newly created customization option
        return response.status(201).json({
            message: "Customization option created successfully",
            customizationOption: newCustomizationOption
        });


    } catch (error) {
        console.error("Customization option creation error: ", error.message);

        return response.status(500).json({
            message: "Unable to create customization option"
        });
    }
};

//Export customization controller functions so they can be used in the routes
export {
    createCustomizationGroup,
    getCustomizationGroups,
    updateCustomizationGroup,
    deleteCustomizationGroup,
    createCustomizationOption
};