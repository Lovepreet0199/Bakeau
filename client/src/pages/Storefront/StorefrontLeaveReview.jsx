//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import Review icons
import { ImagePlus, Star, X } from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Review styles
import "./StorefrontLeaveReview.css";


//Displays Review form or existing Customer Review
export default function StorefrontLeaveReview() {

    //Get Bakery slug and Order ID
    const { slug, orderId } = useParams();
    const navigate = useNavigate();

    //Stores Bakery and Order information
    const [bakery, setBakery] = useState(null);
    const [order, setOrder] = useState(null);

    //Stores existing Review
    const [existingReview, setExistingReview] = useState(null);

    //Stores new Review information
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    //Stores selected Review image
    const [reviewImage, setReviewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    //Tracks whether Customer is editing Review
    const [isEditing, setIsEditing] = useState(false);

    //Stores editable Review information
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");

    //Controls Delete Review confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    //Page states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");


    //Loads Bakery, Order and existing Review
    useEffect(() => {

        async function loadReviewPage() {

            const token = getAuthToken();

            //Customer must be logged in
            if (!token) {
                navigate(`/store/${slug}/login`, { replace: true });
                return;
            }

            try {

                setError("");

                //Load Bakery
                const bakeryResponse = await fetch(
                    `http://localhost:3000/api/bakeries/public/${slug}`
                );

                const bakeryData = await bakeryResponse.json();

                if (!bakeryResponse.ok) {
                    throw new Error(
                        bakeryData.message || "Unable to load bakery"
                    );
                }

                //Load Customer Order
                const orderResponse = await fetch(
                    `http://localhost:3000/api/orders/mine/${orderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const orderData = await orderResponse.json();

                if (!orderResponse.ok) {
                    throw new Error(
                        orderData.message || "Unable to load order"
                    );
                }

                //Check if Customer already reviewed this Order
                const reviewResponse = await fetch(
                    `http://localhost:3000/api/reviews/order/${orderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const reviewData = await reviewResponse.json();

                setBakery(bakeryData.bakery);
                setOrder(orderData.order);

                if (reviewResponse.ok) {
                    setExistingReview(reviewData.review);
                }

            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }

        loadReviewPage();

    }, [slug, orderId, navigate]);


    //Stores selected Review image and creates preview
    function handleImageChange(event) {

        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            return;
        }

        setReviewImage(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
    }


    //Removes selected Review image
    function removeImage() {
        setReviewImage(null);
        setImagePreview("");
    }


    //Uploads optional Review image
    async function uploadReviewImage(token) {

        //Return empty image values when no image was selected
        if (!reviewImage) {
            return {
                image_url: null,
                image_public_id: null
            };
        }

        //Create FormData for image upload
        const formData = new FormData();
        formData.append("review_image", reviewImage);

        //Upload Review image
        const response = await fetch(
            "http://localhost:3000/api/reviews/uploads/image",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to upload review image"
            );
        }

        return {
            image_url: data.image_url,
            image_public_id: data.image_public_id
        };
    }


    //Submits new Customer Review
    async function handleSubmit(event) {

        event.preventDefault();

        //Make sure rating was selected
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        //Make sure Review was entered
        if (!comment.trim()) {
            setError("Please enter your review");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {

            const token = getAuthToken();

            //Upload optional Review image
            const uploadedImage = await uploadReviewImage(token);

            //Create Review
            const response = await fetch(
                "http://localhost:3000/api/reviews",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        rating: rating,
                        comment: comment.trim(),
                        image_url: uploadedImage.image_url,
                        image_public_id: uploadedImage.image_public_id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to submit review"
                );
            }

            //Return Customer to Order with confirmation
            navigate(
                `/store/${slug}/orders/${orderId}`,
                {
                    state: {
                        reviewSubmitted: true
                    }
                }
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setIsSubmitting(false);
        }
    }


    //Starts editing existing Review
    function startEditingReview() {

        //Use existing Review values in edit form
        setEditRating(existingReview.rating);
        setEditComment(existingReview.comment);

        setError("");
        setReviewMessage("");
        setIsEditing(true);
    }


    //Updates Customer Review
    async function handleUpdateReview(event) {

        event.preventDefault();

        //Make sure rating was selected
        if (editRating === 0) {
            setError("Please select a rating");
            return;
        }

        //Make sure Review was entered
        if (!editComment.trim()) {
            setError("Please enter your review");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setReviewMessage("");

        try {

            const token = getAuthToken();

            //Update Review
            const response = await fetch(
                `http://localhost:3000/api/reviews/${existingReview._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rating: editRating,
                        comment: editComment.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update review"
                );
            }

            //Update Review displayed on page
            setExistingReview(data.review);

            //Close Edit form
            setIsEditing(false);

            //Show success message
            setReviewMessage(
                "Review updated successfully."
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setIsSubmitting(false);
        }
    }


    //Deletes Customer Review
    async function handleDeleteReview() {

        setIsSubmitting(true);
        setError("");
        setReviewMessage("");

        try {

            const token = getAuthToken();

            //Delete Review
            const response = await fetch(
                `http://localhost:3000/api/reviews/${existingReview._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to delete review"
                );
            }

            //Close Delete modal
            setShowDeleteModal(false);

            //Remove Review from page
            setExistingReview(null);

            //Clear Review information
            setRating(0);
            setComment("");
            setReviewImage(null);
            setImagePreview("");

            //Show success message
            setReviewMessage(
                "Review deleted successfully."
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setIsSubmitting(false);
        }
    }


    //Loading state
    if (isLoading) {

        return (
            <div className="storefront-review-loading d-flex align-items-center justify-content-center">

                <div className="spinner-border" role="status">

                    <span className="visually-hidden">
                        Loading...
                    </span>

                </div>

            </div>
        );
    }


    //Page error
    if (!bakery || !order) {

        return (
            <div className="storefront-review-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center">

                <h1 className="h4">
                    Unable to load review
                </h1>

                <p>
                    {error || "Order not found"}
                </p>

                <Link to={`/store/${slug}/orders`}>
                    Back to orders
                </Link>

            </div>
        );
    }


    //Displays existing Customer Review
    if (existingReview) {

        return (

            <div
                className="storefront-review-page min-vh-100 d-flex flex-column"
                style={getStorefrontTheme(bakery)}
            >

                {/* Storefront Navbar */}
                <StorefrontNavbar bakery={bakery} />


                <main className="storefront-review-main flex-grow-1">

                    <div className="container py-4 py-lg-5">

                        {/* Back to Order */}
                        <Link
                            to={`/store/${slug}/orders/${orderId}`}
                            className="storefront-review-back text-decoration-none"
                        >
                            ‹ Back to order
                        </Link>


                        {/* Existing Review card */}
                        <div className="storefront-review-card mx-auto">

                            <div className="storefront-review-heading text-center">

                                <span>
                                    VERIFIED ORDER
                                </span>

                                <h1>
                                    Your review
                                </h1>

                                <p>
                                    Review for order {order.order_number}
                                </p>

                            </div>


                            {/* Edit Review form */}
                            {isEditing ? (

                                <form onSubmit={handleUpdateReview}>

                                    {/* Edit rating */}
                                    <div className="storefront-review-field">

                                        <label>
                                            Your rating
                                        </label>

                                        <div className="storefront-review-stars">

                                            {[1, 2, 3, 4, 5].map((star) => (

                                                <button
                                                    type="button"
                                                    key={star}
                                                    className={star <= editRating ? "active" : ""}
                                                    onClick={() => setEditRating(star)}
                                                    aria-label={`${star} star rating`}
                                                >
                                                    <Star
                                                        size={28}
                                                        fill={
                                                            star <= editRating
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />
                                                </button>

                                            ))}

                                        </div>

                                    </div>


                                    {/* Edit Review comment */}
                                    <div className="storefront-review-field">

                                        <label htmlFor="editReviewComment">
                                            Your review
                                        </label>

                                        <textarea
                                            id="editReviewComment"
                                            className="form-control"
                                            rows="5"
                                            maxLength="1000"
                                            value={editComment}
                                            onChange={(event) =>
                                                setEditComment(event.target.value)
                                            }
                                        />

                                        <small>
                                            {editComment.length}/1000
                                        </small>

                                    </div>


                                    {/* Existing Review image */}
                                    {existingReview.image_url && (

                                        <div className="storefront-review-edit-image">

                                            <span>
                                                Review photo
                                            </span>

                                            <img
                                                src={existingReview.image_url}
                                                alt="Customer review"
                                            />

                                            <small>
                                                The existing photo will stay with this review.
                                            </small>

                                        </div>

                                    )}


                                    {/* Error */}
                                    {error && (

                                        <div className="storefront-review-error">
                                            {error}
                                        </div>

                                    )}


                                    {/* Edit Review buttons */}
                                    <div className="storefront-review-edit-actions">

                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError("");
                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting
                                                ? "Saving..."
                                                : "Save changes"
                                            }
                                        </button>

                                    </div>

                                </form>

                            ) : (

                                <>

                                    {/* Review stars */}
                                    <div className="storefront-review-view-stars">

                                        {[1, 2, 3, 4, 5].map((star) => (

                                            <Star
                                                key={star}
                                                size={25}
                                                fill={
                                                    star <= existingReview.rating
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />

                                        ))}

                                    </div>


                                    {/* Review comment */}
                                    <p className="storefront-review-view-comment">
                                        {existingReview.comment}
                                    </p>


                                    {/* Review image */}
                                    {existingReview.image_url && (

                                        <img
                                            src={existingReview.image_url}
                                            alt="Customer review"
                                            className="storefront-review-view-image"
                                        />

                                    )}


                                    {/* Bakery reply */}
                                    {existingReview.owner_reply && (

                                        <div className="storefront-review-owner-reply">

                                            <strong>
                                                {bakery.name} replied
                                            </strong>

                                            <p>
                                                {existingReview.owner_reply}
                                            </p>

                                        </div>

                                    )}


                                    {/* Verified Order */}
                                    <div className="storefront-review-verified">
                                        ✓ VERIFIED ORDER
                                    </div>


                                    {/* Review success message */}
                                    {reviewMessage && (

                                        <div className="storefront-review-success">
                                            ✓ {reviewMessage}
                                        </div>

                                    )}


                                    {/* Customer Review actions */}
                                    <div className="storefront-review-actions">

                                        <button
                                            type="button"
                                            className="storefront-review-edit"
                                            onClick={startEditingReview}
                                        >
                                            Edit review
                                        </button>

                                        <button
                                            type="button"
                                            className="storefront-review-delete"
                                            onClick={() => {
                                                setError("");
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Delete review
                                        </button>

                                    </div>

                                </>

                            )}

                        </div>

                    </div>

                </main>


                {/* Storefront Footer */}
                <StorefrontFooter bakery={bakery} />


                {/* Delete Review confirmation modal */}
                {showDeleteModal && (

                    <div className="storefront-review-modal-backdrop">

                        <div
                            className="storefront-review-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="deleteReviewTitle"
                        >

                            {/* Close Modal */}
                            <button
                                type="button"
                                className="storefront-review-modal-close"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setError("");
                                }}
                                disabled={isSubmitting}
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>


                            {/* Modal heading */}
                            <div className="storefront-review-modal-heading">

                                <div className="storefront-review-modal-icon">
                                    !
                                </div>

                                <h2 id="deleteReviewTitle">
                                    Delete this review?
                                </h2>

                                <p>
                                    This review will be permanently deleted. This action cannot be undone.
                                </p>

                            </div>


                            {/* Delete error */}
                            {error && (

                                <div className="storefront-review-error">
                                    {error}
                                </div>

                            )}


                            {/* Modal actions */}
                            <div className="storefront-review-modal-actions">

                                <button
                                    type="button"
                                    className="storefront-review-modal-cancel"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setError("");
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="storefront-review-modal-delete"
                                    onClick={handleDeleteReview}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Deleting..."
                                        : "Delete review"
                                    }
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>
        );
    }


    //Only completed Orders can be reviewed
    if (order.status !== "completed") {

        return (

            <div
                className="storefront-review-page min-vh-100 d-flex flex-column"
                style={getStorefrontTheme(bakery)}
            >

                <StorefrontNavbar bakery={bakery} />

                <main className="storefront-review-main flex-grow-1">

                    <div className="container py-5">

                        <div className="storefront-review-card mx-auto text-center">

                            <h1>
                                Review unavailable
                            </h1>

                            <p>
                                You can leave a review after your order has been completed.
                            </p>

                            <Link
                                to={`/store/${slug}/orders/${orderId}`}
                                className="storefront-review-back text-decoration-none"
                            >
                                Back to order
                            </Link>

                        </div>

                    </div>

                </main>

                <StorefrontFooter bakery={bakery} />

            </div>
        );
    }


    //Displays new Review form
    return (

        <div
            className="storefront-review-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            <main className="storefront-review-main flex-grow-1">

                <div className="container py-4 py-lg-5">

                    {/* Back to Order */}
                    <Link
                        to={`/store/${slug}/orders/${orderId}`}
                        className="storefront-review-back text-decoration-none"
                    >
                        ‹ Back to order
                    </Link>


                    {/* Review form */}
                    <div className="storefront-review-card mx-auto">

                        <div className="storefront-review-heading text-center">

                            <span>
                                ORDER {order.order_number}
                            </span>

                            <h1>
                                How was your order?
                            </h1>

                            <p>
                                Share your experience with {bakery.name}.
                            </p>

                        </div>


                        {/* Deleted Review message */}
                        {reviewMessage && (

                            <div className="storefront-review-success">
                                ✓ {reviewMessage}
                            </div>

                        )}


                        <form onSubmit={handleSubmit}>

                            {/* Rating */}
                            <div className="storefront-review-field">

                                <label>
                                    Your rating
                                </label>

                                <div className="storefront-review-stars">

                                    {[1, 2, 3, 4, 5].map((star) => (

                                        <button
                                            type="button"
                                            key={star}
                                            className={star <= rating ? "active" : ""}
                                            onClick={() => setRating(star)}
                                            aria-label={`${star} star rating`}
                                        >
                                            <Star
                                                size={28}
                                                fill={
                                                    star <= rating
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />
                                        </button>

                                    ))}

                                </div>

                            </div>


                            {/* Review Comment */}
                            <div className="storefront-review-field">

                                <label htmlFor="reviewComment">
                                    Your review
                                </label>

                                <textarea
                                    id="reviewComment"
                                    className="form-control"
                                    rows="5"
                                    maxLength="1000"
                                    placeholder="Tell others about your order..."
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                />

                                <small>
                                    {comment.length}/1000
                                </small>

                            </div>


                            {/* Optional Review image */}
                            <div className="storefront-review-field">

                                <label>
                                    Add a photo

                                    <span className="storefront-review-optional">
                                        Optional
                                    </span>
                                </label>


                                {!imagePreview ? (

                                    <label className="storefront-review-image-upload">

                                        <ImagePlus size={22} />

                                        <span>
                                            Add a photo of your order
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            hidden
                                        />

                                    </label>

                                ) : (

                                    <div className="storefront-review-image-preview">

                                        <img
                                            src={imagePreview}
                                            alt="Review preview"
                                        />

                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            aria-label="Remove review image"
                                        >
                                            <X size={17} />
                                        </button>

                                    </div>

                                )}

                            </div>


                            {/* Error */}
                            {error && (

                                <div className="storefront-review-error">
                                    {error}
                                </div>

                            )}


                            {/* Submit Review */}
                            <button
                                type="submit"
                                className="storefront-review-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Submitting review..."
                                    : "Submit review"
                                }
                            </button>

                        </form>

                    </div>

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}