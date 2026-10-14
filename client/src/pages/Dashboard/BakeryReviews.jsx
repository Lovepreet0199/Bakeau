import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import Review icons
import {
    MessageSquare,
    Star,
    Trash2,
    X
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage";

//Import Reviews styles
import "./styles/BakeryReviews.css";


//Displays Customer Reviews for the Bakery Owner
export default function BakeryReviews() {

    //Stores Bakery Reviews
    const [reviews, setReviews] = useState([]);

    //Tracks the Review currently being replied to
    const [editingReplyId, setEditingReplyId] = useState(null);

    //Stores the Owner reply text
    const [replyText, setReplyText] = useState("");

    //Tracks loading and saving
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    //Stores page messages
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    //Stores Review selected for Reply deletion
    const [deleteReplyReview, setDeleteReplyReview] =
        useState(null);

    //Tracks Reply deletion
    const [isDeletingReply, setIsDeletingReply] =
        useState(false);

    //Loads all Reviews for the logged-in Owner's Bakery
    useEffect(() => {

        async function loadReviews() {

            try {

                setIsLoading(true);
                setError("");

                //Get logged-in Owner token
                const token = getAuthToken();

                //Request Bakery Reviews
                const response = await fetch(
                    `${API_URL}/api/reviews/bakery`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                //Stop if Reviews could not be loaded
                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to load reviews"
                    );
                }

                //Save Bakery Reviews
                setReviews(
                    data.reviews || []
                );

            } catch (error) {

                //Display loading error
                setError(
                    error.message
                );

            } finally {

                //Stop loading
                setIsLoading(false);
            }
        }

        loadReviews();

    }, []);


    //Displays the full Customer name
    function getCustomerName(customer) {

        if (!customer) {
            return "Customer";
        }

        const firstName =
            customer.first_name ||
            "Customer";

        const lastName =
            customer.last_name ||
            "";

        return `${firstName} ${lastName}`.trim();
    }


    //Gets the first letter for Customer avatar
    function getCustomerInitial(customer) {

        if (!customer?.first_name) {
            return "C";
        }

        return customer.first_name
            .charAt(0)
            .toUpperCase();
    }


    //Formats Review and Reply dates
    function formatDate(date) {

        if (!date) {
            return "";
        }

        return new Date(date)
            .toLocaleDateString(
                "en-CA",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }
            );
    }


    //Opens the Reply editor
    function openReplyEditor(review) {

        //Clear old messages
        setError("");
        setMessage("");

        //Store selected Review
        setEditingReplyId(
            review._id
        );

        //Use existing reply when editing
        setReplyText(
            review.owner_reply || ""
        );
    }


    //Closes the Reply editor
    function closeReplyEditor() {

        setEditingReplyId(null);
        setReplyText("");
        setError("");
    }


    //Saves or updates the Bakery reply
    async function handleSaveReply(reviewId) {

        //Reply cannot be empty
        if (!replyText.trim()) {

            setError(
                "Please enter a reply before saving."
            );

            return;
        }

        try {

            setIsSaving(true);
            setError("");
            setMessage("");

            //Get logged-in Owner token
            const token = getAuthToken();

            //Send Bakery reply
            const response = await fetch(
                `${API_URL}/api/reviews/${reviewId}/reply`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        owner_reply:
                            replyText.trim()
                    })
                }
            );

            const data = await response.json();

            //Stop if Reply could not be saved
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to save reply"
                );
            }

            //Update the Review without reloading the page
            setReviews(
                (currentReviews) =>
                    currentReviews.map(
                        (review) =>
                            review._id === reviewId
                                ? {
                                    ...review,

                                    owner_reply:
                                        data.review?.owner_reply ||
                                        replyText.trim(),

                                    owner_reply_at:
                                        data.review?.owner_reply_at ||
                                        new Date().toISOString()
                                }
                                : review
                    )
            );

            //Close Reply editor
            setEditingReplyId(null);
            setReplyText("");

            //Display success message
            setMessage(
                "Reply saved successfully."
            );

        } catch (error) {

            //Display Reply error
            setError(
                error.message
            );

        } finally {

            //Stop saving state
            setIsSaving(false);
        }
    }


    //Displays loading state
    if (isLoading) {

        return (

            <div className="bakery-reviews-loading d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading reviews...
                    </span>
                </div>

            </div>
        );
    }
    //Opens Delete Reply confirmation
    function openDeleteReplyModal(review) {

        setError("");
        setMessage("");

        setDeleteReplyReview(
            review
        );
    }


    //Closes Delete Reply confirmation
    function closeDeleteReplyModal() {

        if (isDeletingReply) {
            return;
        }

        setDeleteReplyReview(null);
    }


    //Deletes the Bakery reply
    async function handleDeleteReply() {

        if (!deleteReplyReview) {
            return;
        }

        try {

            setIsDeletingReply(true);
            setError("");
            setMessage("");

            //Get logged-in Owner token
            const token =
                getAuthToken();

            //Remove Owner reply using existing Reply endpoint
            const response =
                await fetch(
                    `${API_URL}/api/reviews/${deleteReplyReview._id}/reply`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            owner_reply: ""
                        })
                    }
                );

            const data =
                await response.json();

            //Stop if Reply could not be deleted
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete reply"
                );
            }

            //Remove Reply from page
            setReviews(
                (currentReviews) =>
                    currentReviews.map(
                        (review) =>
                            review._id ===
                                deleteReplyReview._id
                                ? {
                                    ...review,
                                    owner_reply: null,
                                    owner_reply_at: null
                                }
                                : review
                    )
            );

            //Close Delete modal
            setDeleteReplyReview(null);

            //Show success message
            setMessage(
                "Reply deleted successfully."
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setIsDeletingReply(false);
        }
    }

    return (

        <div className="bakery-reviews-page">

            <div className="container-fluid px-4 px-lg-5 py-4">

                {/* Page Header */}
                <div className="row align-items-end g-3 mb-4">

                    <div className="col-12 col-md">

                        <p className="bakery-reviews-eyebrow mb-2">
                            CUSTOMER FEEDBACK
                        </p>

                        <h1 className="bakery-reviews-title mb-2">
                            Reviews
                        </h1>

                        <p className="bakery-reviews-description mb-0">
                            View customer feedback and reply to verified order reviews.
                        </p>

                    </div>


                    {/* Total Reviews */}
                    <div className="col-12 col-md-auto">

                        <div className="bakery-reviews-count">

                            {reviews.length}

                            <span>
                                {reviews.length === 1
                                    ? "review"
                                    : "reviews"
                                }
                            </span>

                        </div>

                    </div>

                </div>


                {/* Success Message */}
                {message && (

                    <div
                        className="alert alert-success"
                        role="alert"
                    >
                        {message}
                    </div>

                )}


                {/* Loading Error */}
                {error && !editingReplyId && (

                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                {/* Empty Reviews */}
                {reviews.length === 0 ? (

                    <div className="bakery-reviews-empty text-center p-4 p-md-5">

                        <MessageSquare
                            size={30}
                        />

                        <h2 className="mt-3 mb-2">
                            No reviews yet
                        </h2>

                        <p className="mb-0">
                            Customer reviews from completed verified orders will appear here.
                        </p>

                    </div>

                ) : (

                    /* Reviews Grid */
                    <div className="row g-3 g-xl-4">

                        {reviews.map(
                            (review) => (

                                <div
                                    className="col-12 col-xl-6"
                                    key={
                                        review._id
                                    }
                                >

                                    <article className="bakery-review-card h-100 d-flex flex-column p-3 p-md-4">

                                        {/* Customer and Rating */}
                                        <div className="d-flex flex-column flex-sm-row align-items-start justify-content-between gap-3 mb-3">

                                            {/* Customer Information */}
                                            <div className="d-flex align-items-center gap-3">

                                                {/* Customer Avatar */}
                                                <div className="bakery-review-avatar">

                                                    {
                                                        getCustomerInitial(
                                                            review.customer_id
                                                        )
                                                    }

                                                </div>


                                                <div>

                                                    {/* Customer Name */}
                                                    <h2 className="bakery-review-customer mb-1">

                                                        {
                                                            getCustomerName(
                                                                review.customer_id
                                                            )
                                                        }

                                                    </h2>


                                                    {/* Review Information */}
                                                    <div className="d-flex flex-wrap align-items-center gap-2 bakery-review-meta">

                                                        <span>

                                                            {
                                                                formatDate(
                                                                    review.created_at
                                                                )
                                                            }

                                                        </span>


                                                        {/* Order Number */}
                                                        {review.order_id?.order_number && (

                                                            <>

                                                                <span>
                                                                    •
                                                                </span>

                                                                <span>
                                                                    Order #{review.order_id.order_number}
                                                                </span>

                                                            </>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>


                                            {/* Review Stars */}
                                            <div className="d-flex align-items-center gap-1 bakery-review-stars">

                                                {[1, 2, 3, 4, 5].map(
                                                    (star) => (

                                                        <Star
                                                            key={
                                                                star
                                                            }
                                                            size={17}
                                                            fill={
                                                                star <= review.rating
                                                                    ? "currentColor"
                                                                    : "none"
                                                            }
                                                        />

                                                    )
                                                )}

                                            </div>

                                        </div>


                                        {/* Verified Order */}
                                        <div className="mb-3">

                                            <span className="bakery-review-verified">
                                                ✓ VERIFIED ORDER
                                            </span>

                                        </div>


                                        {/* Customer Review */}
                                        <p className="bakery-review-comment">
                                            {review.comment}
                                        </p>


                                        {/* Customer Review Image */}
                                        {review.image_url && (

                                            <img
                                                src={
                                                    review.image_url
                                                }
                                                alt="Customer review"
                                                className="bakery-review-image img-fluid"
                                            />

                                        )}


                                        {/* Existing Owner Reply */}
                                        {review.owner_reply &&
                                            editingReplyId !== review._id && (

                                                <div className="bakery-review-owner-reply">

                                                    {/* Reply Header */}
                                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">

                                                        <div>

                                                            <strong>
                                                                Your reply
                                                            </strong>


                                                            {review.owner_reply_at && (

                                                                <span className="bakery-review-owner-reply-date ms-2">

                                                                    {
                                                                        formatDate(
                                                                            review.owner_reply_at
                                                                        )
                                                                    }

                                                                </span>

                                                            )}

                                                        </div>


                                                        {/* Reply Actions */}
                                                        <div className="d-flex align-items-center gap-2">

                                                            {/* Edit Reply */}
                                                            <button
                                                                type="button"
                                                                className="bakery-review-reply-edit"
                                                                onClick={() =>
                                                                    openReplyEditor(
                                                                        review
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>


                                                            {/* Delete Reply */}
                                                            <button
                                                                type="button"
                                                                className="bakery-review-reply-delete d-flex align-items-center gap-1"
                                                                onClick={() =>
                                                                    openDeleteReplyModal(
                                                                        review
                                                                    )
                                                                }
                                                            >

                                                                <Trash2
                                                                    size={13}
                                                                />

                                                                Delete

                                                            </button>

                                                        </div>

                                                    </div>


                                                    {/* Owner Reply */}
                                                    <p className="mb-0">
                                                        {review.owner_reply}
                                                    </p>

                                                </div>

                                            )}


                                        {/* Reply Editor */}
                                        {editingReplyId === review._id && (

                                            <div className="bakery-review-reply-editor">

                                                {/* Reply Editor Header */}
                                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">

                                                    <h3 className="mb-0">

                                                        {review.owner_reply
                                                            ? "Edit reply"
                                                            : "Reply to customer"
                                                        }

                                                    </h3>


                                                    {/* Close Reply Editor */}
                                                    <button
                                                        type="button"
                                                        className="bakery-review-reply-close d-flex align-items-center justify-content-center"
                                                        onClick={
                                                            closeReplyEditor
                                                        }
                                                        disabled={
                                                            isSaving
                                                        }
                                                        aria-label="Close reply editor"
                                                    >
                                                        <X
                                                            size={17}
                                                        />
                                                    </button>

                                                </div>


                                                {/* Reply Error */}
                                                {error && (

                                                    <div
                                                        className="alert alert-danger py-2"
                                                        role="alert"
                                                    >
                                                        {error}
                                                    </div>

                                                )}


                                                {/* Reply Label */}
                                                <label
                                                    htmlFor={`reply-${review._id}`}
                                                    className="bakery-review-reply-label mb-2"
                                                >
                                                    Your reply
                                                </label>


                                                {/* Reply Textarea */}
                                                <textarea
                                                    id={`reply-${review._id}`}
                                                    className="form-control bakery-review-reply-textarea"
                                                    rows="4"
                                                    maxLength="1000"
                                                    value={
                                                        replyText
                                                    }
                                                    onChange={
                                                        (event) =>
                                                            setReplyText(
                                                                event.target.value
                                                            )
                                                    }
                                                    placeholder="Write a reply to this customer..."
                                                    disabled={
                                                        isSaving
                                                    }
                                                />


                                                {/* Character Count */}
                                                <div className="text-end bakery-review-reply-count mt-1">

                                                    {
                                                        replyText.length
                                                    }/1000

                                                </div>


                                                {/* Reply Actions */}
                                                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-3">

                                                    {/* Cancel Reply */}
                                                    <button
                                                        type="button"
                                                        className="bakery-review-cancel-button"
                                                        onClick={
                                                            closeReplyEditor
                                                        }
                                                        disabled={
                                                            isSaving
                                                        }
                                                    >
                                                        Cancel
                                                    </button>


                                                    {/* Save Reply */}
                                                    <button
                                                        type="button"
                                                        className="bakery-review-save-button"
                                                        onClick={() =>
                                                            handleSaveReply(
                                                                review._id
                                                            )
                                                        }
                                                        disabled={
                                                            isSaving
                                                        }
                                                    >

                                                        {isSaving
                                                            ? "Saving..."
                                                            : review.owner_reply
                                                                ? "Update reply"
                                                                : "Post reply"
                                                        }

                                                    </button>

                                                </div>

                                            </div>

                                        )}


                                        {/* Review Action */}
                                        {editingReplyId !== review._id &&
                                            !review.owner_reply && (

                                                <div className="mt-auto pt-3">

                                                    <button
                                                        type="button"
                                                        className="bakery-review-reply-button d-inline-flex align-items-center justify-content-center gap-2"
                                                        onClick={() =>
                                                            openReplyEditor(
                                                                review
                                                            )
                                                        }
                                                    >

                                                        <MessageSquare
                                                            size={15}
                                                        />

                                                        Reply

                                                    </button>

                                                </div>

                                            )}

                                    </article>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>
            {/* Delete Reply Modal */}
            {deleteReplyReview && (

                <div className="bakery-review-modal-backdrop d-flex align-items-center justify-content-center p-3">

                    <div className="bakery-review-modal w-100">

                        {/* Modal Header */}
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">

                            <h2 className="mb-0">
                                Delete reply?
                            </h2>


                            <button
                                type="button"
                                className="bakery-review-modal-close d-flex align-items-center justify-content-center"
                                onClick={
                                    closeDeleteReplyModal
                                }
                                disabled={
                                    isDeletingReply
                                }
                                aria-label="Close delete reply modal"
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


                        {/* Modal Message */}
                        <p className="bakery-review-modal-text">
                            This will remove your reply from the customer's review. The customer review itself will not be deleted.
                        </p>


                        {/* Modal Error */}
                        {error && (

                            <div
                                className="alert alert-danger py-2"
                                role="alert"
                            >
                                {error}
                            </div>

                        )}


                        {/* Modal Actions */}
                        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">

                            <button
                                type="button"
                                className="bakery-review-modal-cancel"
                                onClick={
                                    closeDeleteReplyModal
                                }
                                disabled={
                                    isDeletingReply
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="bakery-review-modal-delete"
                                onClick={
                                    handleDeleteReply
                                }
                                disabled={
                                    isDeletingReply
                                }
                            >

                                {isDeletingReply
                                    ? "Deleting..."
                                    : "Delete reply"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}