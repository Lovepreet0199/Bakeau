//Import the Product model to create and manage bakery products
import Product from "../models/Product.js";

//Import the Bakery model to identify the authenticated owner's bakery
import Bakery from "../models/Bakery.js";

//Create a product for the authenticated Bakery Owner's bakery
const createProduct = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Check ig the Bakery Owner has created a bakery
        if (!bakery) {
            return response.status(400).json({
                message: "Bakery not found"
            });
        }

        //Get the product information submitted by the Bakery Owner
        const {
            name,
            description,
            base_price,
            image_url,
            is_available,
            is_visible,
            inventory_quantity,
            low_inventory_threshold,
            is_featured
        } = request.body;

        //Create the product and connect it to the authenticated Owner's bakery
        const newProduct = await Product.create({
            bakery_id: bakery._id,
            name: name,
            description: description,
            base_price: base_price,
            image_url: image_url,
            is_available: is_available,
            is_visible: is_visible,
            inventory_quantity: inventory_quantity,
            low_inventory_threshold: low_inventory_threshold,
            is_featured: is_featured
        });

        //Return the newly created product
        return response.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });

    } catch (error) {
        console.error("Product creation error: ", error.message);

        return response.status(500).json({
            message: "Unable to create product"
        });
    }
};

//Export the product controller functions so they can be used in product routes
export { createProduct };