//Import Review model
import Review from "../models/Review.js";

//Import Order model
import Order from "../models/Order.js";

//Import Bakery model
import Bakery from "../models/Bakery.js";

//Import Cloudinary for Review image uploads
import cloudinary from "../config/cloudinary.js";

//Creates a Review for a completed Order
const createReview = async (request, response) => {

    try {

        //Get logged-in Customer ID
        const customerId = request.user.userId;

        //Get Review information
        const {
            order_id,
            rating,
            comment,
            image_url,
            image_public_id
        } = request.body;


        //Find the Customer's Order
        const order = await Order.findOne({
            _id: order_id,
            customer_id: customerId
        });


        //Stop if Order was not found
        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }


        //Only completed Orders can be reviewed
        if (order.status !== "completed") {
            return response.status(400).json({
                message: "Only completed orders can be reviewed"
            });
        }


        //Check if Order already has a Review
        const existingReview = await Review.findOne({
            order_id: order._id
        });


        //Prevent duplicate Review
        if (existingReview) {
            return response.status(400).json({
                message: "This order has already been reviewed"
            });
        }


        //Create Review
        const review = await Review.create({
            order_id: order._id,
            customer_id: customerId,
            bakery_id: order.bakery_id,
            rating: rating,
            comment: comment,
            image_url: image_url || null,
            image_public_id: image_public_id || null
        });


        return response.status(201).json({
            message: "Review submitted successfully",
            review: review
        });

    } catch (error) {

        console.error("Create review error:", error.message);

        return response.status(500).json({
            message: "Unable to submit review"
        });
    }
};


//Gets public Reviews for one Bakery
const getPublicReviews = async (request, response) => {

    try {

        //Find Bakery using Storefront slug
        const bakery = await Bakery.findOne({
            slug: request.params.slug
        });


        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Get visible Reviews
        const reviews = await Review.find({
            bakery_id: bakery._id,
            is_removed: false
        })
            .populate(
                "customer_id",
                "first_name last_name"
            )
            .sort({
                created_at: -1
            });


        //Calculate average rating
        let totalRating = 0;

        reviews.forEach((review) => {
            totalRating += review.rating;
        });

        const averageRating =
            reviews.length > 0
                ? (totalRating / reviews.length).toFixed(1)
                : 0;


        return response.status(200).json({
            reviews: reviews,
            review_count: reviews.length,
            average_rating: averageRating
        });

    } catch (error) {

        console.error("Get public reviews error:", error.message);

        return response.status(500).json({
            message: "Unable to get reviews"
        });
    }
};


//Gets Reviews for logged-in Bakery Owner
const getBakeryReviews = async (request, response) => {

    try {

        //Get logged-in Bakery Owner ID
        const ownerId = request.user.userId;


        //Find Bakery belonging to Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Get Bakery Reviews
        const reviews = await Review.find({
            bakery_id: bakery._id
        })
            .populate(
                "customer_id",
                "first_name last_name email"
            )
            .populate(
                "order_id",
                "order_number"
            )
            .sort({
                created_at: -1
            });


        return response.status(200).json({
            reviews: reviews
        });

    } catch (error) {

        console.error("Get bakery reviews error:", error.message);

        return response.status(500).json({
            message: "Unable to get bakery reviews"
        });
    }
};


//Adds a Bakery Owner reply to a Review
const replyToReview = async (request, response) => {

    try {

        //Get logged-in Bakery Owner ID
        const ownerId = request.user.userId;

        //Find Bakery belonging to Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });


        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }


        //Find Review belonging to this Bakery
        const review = await Review.findOne({
            _id: request.params.reviewId,
            bakery_id: bakery._id
        });


        if (!review) {
            return response.status(404).json({
                message: "Review not found"
            });
        }


        //Update Owner reply
        review.owner_reply = request.body.owner_reply;
        review.owner_reply_at = new Date();

        await review.save();


        return response.status(200).json({
            message: "Reply saved successfully",
            review: review
        });

    } catch (error) {

        console.error("Reply to review error:", error.message);

        return response.status(500).json({
            message: "Unable to reply to review"
        });
    }
};

//Gets the Customer's Review for one Order
const getOrderReview = async (request, response) => {

    try {

        //Get logged-in Customer ID
        const customerId = request.user.userId;

        //Find Customer Order
        const order = await Order.findOne({
            _id: request.params.orderId,
            customer_id: customerId
        });

        if (!order) {
            return response.status(404).json({
                message: "Order not found"
            });
        }

        //Find Review for this Order
        const review = await Review.findOne({
            order_id: order._id
        });

        return response.status(200).json({
            review: review
        });

    } catch (error) {

        console.error("Get Order Review error:", error.message);

        return response.status(500).json({
            message: "Unable to get Review"
        });
    }
};

//Uploads an optional Customer Review image
const uploadReviewImage = async (request, response) => {

    try {

        //Check if Customer selected an image
        if (!request.file) {
            return response.status(400).json({
                message: "Please select a review image"
            });
        }

        //Upload Review image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "bakeau/review-images"
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

        //Return uploaded Review image information
        return response.status(200).json({
            message: "Review image uploaded successfully",
            image_url: uploadResult.secure_url,
            image_public_id: uploadResult.public_id
        });

    } catch (error) {

        console.error("Review image upload error:", error.message);

        return response.status(500).json({
            message: "Unable to upload review image"
        });
    }
};

export {
    createReview,
    uploadReviewImage,
    getOrderReview,
    getPublicReviews,
    getBakeryReviews,
    replyToReview
};