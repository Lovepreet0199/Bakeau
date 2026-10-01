//Import the Bakery model to identify the authenticated owner's bakery
import Bakery from "../models/Bakery.js";

//Import the Product model to make sure the product belongs to the owner's bakery
import Product from "../models/Products.js";

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

    } catch (error) {
        console.error("Customization group creation error: ", error.message);

        return response.status(500).json({
            message: "Unable to create customization group"
        });
    }
};