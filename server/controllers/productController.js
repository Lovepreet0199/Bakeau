//Import the Product model to create and manage bakery products
import Product from "../models/Product.js";

//Import the Bakery model to identify the authenticated owner's bakery
import Bakery from "../models/Bakery.js";

//Import Cloudinary to upload and manage product images
import cloudinary from "../config/cloudinary.js";

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
            image_public_id,
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
            image_public_id: image_public_id,
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

//Upload a product image for the authenticated Bakery Owner
const uploadProductImage = async (request, response) => {

    try {

        //Check if the Bakery Owner selected an image
        if (!request.file) {
            return response.status(400).json({
                message: "Please select a product image"
            });
        }

        //Upload the product image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "bakeau/product-images"
                },
                (error, result) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }

                }
            );

            uploadStream.end(request.file.buffer);
        });

        //Return the uploaded product image information
        return response.status(200).json({
            message: "Product image uploaded successfully",
            image_url: uploadResult.secure_url,
            image_public_id: uploadResult.public_id
        });

    } catch (error) {

        console.error("Product image upload error:", error.message);

        return response.status(500).json({
            message: "Unable to upload product image"
        });

    }

};

//Get all products belonging to the authenticated Bakery Owner's bakery
const getMyProducts = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Check id the Bakery Owner has created a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find all products that belong to the authenticated owner's bakery
        const products = await Product.find({
            bakery_id: bakery._id
        });

        //Return all products belonging to the authenticated owner's bakery
        return response.status(200).json({
            message: "Products retrieved successfully",
            products: products
        });

    } catch (error) {

        console.error("Get products error: ", error.message);

        return response.status(500).json({
            message: "Unable to get products"
        });
    }
};

//Get one product belonging to the authenticated Bakery Owner's bakery
const getMyProductById = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the product ID from the URL
        const productId = request.params.id;

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

        //Find the requested product only if it belongs to the authenticated owner's bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id
        });

        //Check if the product exists and belongs to the authenticated owner's bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Return the requested product
        return response.status(200).json({
            message: "Product retrieved successfully",
            product: product
        });

    } catch (error) {

        console.error("Get product error: ", error.message);

        return response.status(500).json({
            message: "Unable to get product"
        });
    }
};

//Update a product belonging to the authenticated Bakery Owner's bakery
const updateMyProduct = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the product ID from the URL
        const productId = request.params.id;

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

        //Find the product only if it belongs to the authenticated owner's bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id
        });

        //Check if the product exists and belongs to the authenticated owner's bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Get the updated product information submitted by the Bakery Owner
        const {
            name,
            description,
            base_price,
            image_url,
            image_public_id,
            is_available,
            is_visible,
            inventory_quantity,
            low_inventory_threshold,
            is_featured
        } = request.body;

        //Update the product information
        product.name = name;
        product.description = description;
        product.base_price = base_price;
        product.image_url = image_url;
        product.image_public_id = image_public_id;
        product.is_available = is_available;
        product.is_visible = is_visible;
        product.inventory_quantity = inventory_quantity;
        product.low_inventory_threshold = low_inventory_threshold;
        product.is_featured = is_featured;

        //Save the updated product information to MongoDB
        await product.save();

        //Return the updated product
        return response.status(200).json({
            message: "Product updated successfully",
            product: product
        });

    } catch (error) {

        console.error("Product update error: ", error.message);

        return response.status(500).json({
            message: "Unable to update product"
        });
    }
};

//Delete a product belonging to the authenticated Bakery Owner's bakery
const deleteMyProduct = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the product ID from the URL
        const productId = request.params.id;

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

        //Find the product only if it belongs to the authenticated owner's bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id
        });

        //Check if the product exists and belongs to the authenticated owner's bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Delete the product from MongoDB
        await product.deleteOne();

        //Return a success message after deleting the product
        return response.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Product deletion error: ", error.message);

        return response.status(500).json({
            message: "Unable to delete product"
        });
    }
};

//Export the product controller functions so they can be used in product routes
export {
    createProduct,
    uploadProductImage,
    getMyProducts,
    getMyProductById,
    updateMyProduct,
    deleteMyProduct
};