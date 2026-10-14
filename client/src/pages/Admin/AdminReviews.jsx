import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate
} from "react-router-dom";

//Import Review icons
import {
    Star,
    Trash2
} from "lucide-react";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage.js";

//Import Admin Review styles
import "./AdminReviews.css";


//Displays Customer Reviews for the Platform Administrator
export default function AdminReviews() {

    //Used to navigate between pages
    const navigate =
        useNavigate();

    //Logs the Platform Administrator out
    function handleAdminLogout() {

        //Remove any saved authentication information
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        sessionStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "user"
        );


        //Return Admin to Login page
        navigate(
            "/admin/login"
        );
    }

    //Stores all Customer Reviews
    const [reviews, setReviews] =
        useState([]);

    //Tracks page loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores page errors
    const [error, setError] =
        useState("");

    //Stores selected Review for removal
    const [selectedReview, setSelectedReview] =
        useState(null);

    //Tracks Remove Review modal
    const [showRemoveModal, setShowRemoveModal] =
        useState(false);

    //Tracks Review removal request
    const [isRemoving, setIsRemoving] =
        useState(false);

    //Stores removal error
    const [removeError, setRemoveError] =
        useState("");

    //Stores success message
    const [successMessage, setSuccessMessage] =
        useState("");


    //Loads Reviews when page opens
    useEffect(() => {

        async function loadReviews() {

            try {

                setError("");

                //Get Admin authentication token
                const token =
                    getAuthToken();


                //Stop if Admin is not signed in
                if (!token) {

                    setError(
                        "Platform Administrator sign in is required."
                    );

                    return;
                }


                //Request all Reviews
                const response =
                    await fetch(
                        `${API_URL}/api/admin/reviews`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                //Convert response into JSON
                const data =
                    await response.json();


                //Stop if backend returns an error
                if (!response.ok) {

                    setError(
                        data.message ||
                        "Unable to load Customer Reviews."
                    );

                    return;
                }


                //Store Reviews
                setReviews(
                    data.reviews || []
                );


            } catch (error) {

                console.error(
                    "Load Admin Reviews error:",
                    error
                );


                setError(
                    "Unable to connect to Bakeau."
                );

            } finally {

                //Stop loading state
                setIsLoading(false);
            }
        }


        loadReviews();

    }, []);


    //Formats Review date
    function formatDate(dateValue) {

        if (!dateValue) {
            return "Not available";
        }


        return new Date(
            dateValue
        ).toLocaleDateString(
            "en-CA",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }


    //Opens Review removal confirmation
    function openRemoveModal(review) {

        setSelectedReview(
            review
        );

        setRemoveError(
            ""
        );

        setSuccessMessage(
            ""
        );

        setShowRemoveModal(
            true
        );
    }


    //Closes Review removal confirmation
    function closeRemoveModal() {

        //Do not close while removal is running
        if (isRemoving) {
            return;
        }


        setShowRemoveModal(
            false
        );

        setSelectedReview(
            null
        );

        setRemoveError(
            ""
        );
    }


    //Removes Review from public Bakeau pages
    async function handleRemoveReview() {

        if (!selectedReview) {
            return;
        }


        try {

            setIsRemoving(
                true
            );

            setRemoveError(
                ""
            );


            //Get Admin authentication token
            const token =
                getAuthToken();


            //Send Review removal request
            const response =
                await fetch(
                    `${API_URL}/api/admin/reviews/${selectedReview._id}/remove`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            //Convert response into JSON
            const data =
                await response.json();


            //Stop if backend returns an error
            if (!response.ok) {

                setRemoveError(
                    data.message ||
                    "Unable to remove Review."
                );

                return;
            }


            //Update Review moderation status on the page
            setReviews(
                (currentReviews) =>
                    currentReviews.map(
                        (review) => {

                            if (
                                review._id !==
                                selectedReview._id
                            ) {
                                return review;
                            }


                            return {
                                ...review,

                                is_removed:
                                    true,

                                removed_at:
                                    data.review.removed_at,

                                removed_by_admin_id:
                                    data.review.removed_by_admin_id
                            };
                        }
                    )
            );


            //Display success message
            setSuccessMessage(
                data.message
            );


            //Close modal
            setShowRemoveModal(
                false
            );

            setSelectedReview(
                null
            );


        } catch (error) {

            console.error(
                "Remove Admin Review error:",
                error
            );


            setRemoveError(
                "Unable to connect to Bakeau."
            );

        } finally {

            setIsRemoving(
                false
            );
        }
    }


    //Count active Reviews
    const activeReviews =
        reviews.filter(
            (review) =>
                !review.is_removed
        ).length;


    //Count removed Reviews
    const removedReviews =
        reviews.filter(
            (review) =>
                review.is_removed
        ).length;


    return (

        <main className="admin-reviews-page min-vh-100">


            {/* Platform Admin Header */}
            <header className="admin-reviews-topbar">

                <div className="container-xxl">

                    <div className="d-flex align-items-center justify-content-between py-3">

                        {/* Bakeau Brand */}
                        <div>

                            <p className="admin-reviews-brand mb-0">
                                Bakeau
                            </p>

                            <p className="admin-reviews-brand-label mb-0">
                                Platform Administration
                            </p>

                        </div>


                        <div className="d-flex align-items-center gap-2">

                            {/* Platform Admin Label */}
                            <div className="admin-bakeries-admin-badge d-none d-sm-flex align-items-center gap-2">

                                <span className="admin-bakeries-admin-dot">
                                </span>

                                Platform Admin

                            </div>


                            {/* Admin Logout */}
                            <button
                                type="button"
                                className="btn admin-bakeries-logout-button"
                                onClick={
                                    handleAdminLogout
                                }
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </div>

            </header>


            {/* Main Content */}
            <section className="container-xxl py-4 py-lg-5">


                {/* Page Navigation */}
                <div className="d-flex flex-wrap gap-2 mb-4">

                    <Link
                        to="/admin/bakeries"
                        className="admin-reviews-nav-link"
                    >
                        Bakery Accounts
                    </Link>

                    <span className="admin-reviews-nav-link admin-reviews-nav-link-active">
                        Reviews
                    </span>

                </div>


                {/* Page Heading */}
                <div className="mb-4">

                    <p className="admin-reviews-page-label mb-1">
                        PLATFORM MODERATION
                    </p>

                    <h1 className="admin-reviews-title mb-2">
                        Customer Reviews
                    </h1>

                    <p className="admin-reviews-description mb-0">
                        Review customer feedback and remove inappropriate content from public storefronts.
                    </p>

                </div>


                {/* Review Summary */}
                {!isLoading &&
                    !error && (

                        <div className="row g-3 mb-4">

                            {/* Total */}
                            <div className="col-12 col-md-4">

                                <div className="admin-review-summary-card">

                                    <p className="admin-review-summary-number mb-1">
                                        {reviews.length}
                                    </p>

                                    <p className="admin-review-summary-label mb-0">
                                        Total Reviews
                                    </p>

                                </div>

                            </div>


                            {/* Active */}
                            <div className="col-6 col-md-4">

                                <div className="admin-review-summary-card">

                                    <p className="admin-review-summary-number mb-1">
                                        {activeReviews}
                                    </p>

                                    <p className="admin-review-summary-label mb-0">
                                        Active
                                    </p>

                                </div>

                            </div>


                            {/* Removed */}
                            <div className="col-6 col-md-4">

                                <div className="admin-review-summary-card">

                                    <p className="admin-review-summary-number mb-1">
                                        {removedReviews}
                                    </p>

                                    <p className="admin-review-summary-label mb-0">
                                        Removed
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}


                {/* Success Message */}
                {successMessage && (

                    <div
                        className="admin-review-success d-flex align-items-center gap-3 mb-4"
                        role="alert"
                    >

                        <div className="admin-review-success-icon">
                            ✓
                        </div>

                        <div>

                            <p className="admin-review-success-title mb-1">
                                Review updated
                            </p>

                            <p className="admin-review-success-text mb-0">
                                {successMessage}
                            </p>

                        </div>

                    </div>

                )}


                {/* Loading State */}
                {isLoading && (

                    <div className="admin-review-state-card">
                        Loading Customer Reviews...
                    </div>

                )}


                {/* Error State */}
                {!isLoading &&
                    error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                {/* Empty State */}
                {!isLoading &&
                    !error &&
                    reviews.length === 0 && (

                        <div className="admin-review-state-card">

                            <h2 className="admin-review-empty-title">
                                No Customer Reviews
                            </h2>

                            <p className="admin-review-empty-text mb-0">
                                Customer Reviews will appear here after completed orders are reviewed.
                            </p>

                        </div>

                    )}


                {/* Reviews */}
                {!isLoading &&
                    !error &&
                    reviews.length > 0 && (

                        <div className="d-flex flex-column gap-3">

                            {reviews.map(
                                (review) => (

                                    <article
                                        key={review._id}
                                        className={
                                            `admin-review-card ${review.is_removed
                                                ? "admin-review-card-removed"
                                                : ""
                                            }`
                                        }
                                    >

                                        <div className="row g-4">


                                            {/* Review Content */}
                                            <div className="col-12 col-lg-8">


                                                {/* Review Header */}
                                                <div className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-3 mb-3">

                                                    <div>

                                                        <div className="d-flex align-items-center flex-wrap gap-2 mb-2">

                                                            {/* Customer */}
                                                            <h2 className="admin-review-customer mb-0">

                                                                {review.customer_id
                                                                    ? `${review.customer_id.first_name} ${review.customer_id.last_name}`
                                                                    : "Customer"}

                                                            </h2>


                                                            {/* Review Status */}
                                                            <span
                                                                className={
                                                                    review.is_removed
                                                                        ? "admin-review-status admin-review-status-removed"
                                                                        : "admin-review-status admin-review-status-active"
                                                                }
                                                            >

                                                                <span className="admin-review-status-dot">
                                                                </span>

                                                                {review.is_removed
                                                                    ? "Removed"
                                                                    : "Active"}

                                                            </span>

                                                        </div>


                                                        {/* Customer Email */}
                                                        <p className="admin-review-email mb-0">
                                                            {review.customer_id?.email ||
                                                                "Email unavailable"}
                                                        </p>

                                                    </div>


                                                    {/* Rating */}
                                                    <div className="admin-review-stars">

                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (

                                                                <Star
                                                                    key={star}
                                                                    size={16}
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


                                                {/* Review Comment */}
                                                <p className="admin-review-comment">
                                                    {review.comment}
                                                </p>


                                                {/* Review Image */}
                                                {review.image_url && (

                                                    <img
                                                        src={review.image_url}
                                                        alt="Customer Review"
                                                        className="admin-review-image"
                                                    />

                                                )}


                                                {/* Bakery Owner Reply */}
                                                {review.owner_reply && (

                                                    <div className="admin-review-owner-reply mt-3">

                                                        <p className="admin-review-owner-reply-label mb-1">
                                                            Bakery Owner Reply
                                                        </p>

                                                        <p className="admin-review-owner-reply-text mb-0">
                                                            {review.owner_reply}
                                                        </p>

                                                    </div>

                                                )}

                                            </div>


                                            {/* Review Information */}
                                            <div className="col-12 col-lg-4">

                                                <div className="admin-review-details h-100">

                                                    {/* Bakery */}
                                                    <div className="admin-review-detail-row">

                                                        <span>
                                                            Bakery
                                                        </span>

                                                        <strong>
                                                            {review.bakery_id?.name ||
                                                                "Bakery unavailable"}
                                                        </strong>

                                                    </div>


                                                    {/* Date */}
                                                    <div className="admin-review-detail-row">

                                                        <span>
                                                            Review Date
                                                        </span>

                                                        <strong>
                                                            {formatDate(
                                                                review.created_at
                                                            )}
                                                        </strong>

                                                    </div>


                                                    {/* Rating */}
                                                    <div className="admin-review-detail-row">

                                                        <span>
                                                            Rating
                                                        </span>

                                                        <strong>
                                                            {review.rating}/5
                                                        </strong>

                                                    </div>


                                                    {/* Removed Date */}
                                                    {review.is_removed &&
                                                        review.removed_at && (

                                                            <div className="admin-review-detail-row">

                                                                <span>
                                                                    Removed
                                                                </span>

                                                                <strong>
                                                                    {formatDate(
                                                                        review.removed_at
                                                                    )}
                                                                </strong>

                                                            </div>

                                                        )}


                                                    {/* Moderation Action */}
                                                    <div className="mt-auto pt-4">

                                                        {!review.is_removed ? (

                                                            <button
                                                                type="button"
                                                                className="btn admin-remove-review-button w-100 d-flex align-items-center justify-content-center gap-2"
                                                                onClick={() =>
                                                                    openRemoveModal(
                                                                        review
                                                                    )
                                                                }
                                                            >

                                                                <Trash2
                                                                    size={15}
                                                                />

                                                                Remove Review

                                                            </button>

                                                        ) : (

                                                            <div className="admin-review-removed-message text-center">
                                                                Removed from public storefront
                                                            </div>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

            </section>


            {/* Remove Review Confirmation Modal */}
            {showRemoveModal &&
                selectedReview && (

                    <div className="admin-review-modal-backdrop">

                        <div
                            className="admin-review-modal"
                            role="dialog"
                            aria-modal="true"
                        >

                            {/* Modal Icon */}
                            <div className="admin-review-modal-icon">
                                !
                            </div>


                            <h2 className="admin-review-modal-title">
                                Remove this Review?
                            </h2>


                            <p className="admin-review-modal-text">

                                This Review will no longer appear on the Bakery's public storefront.

                                The Review will remain stored for Platform Administration records.

                            </p>


                            {/* Review Preview */}
                            <div className="admin-review-modal-preview">

                                <div className="admin-review-modal-stars">

                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (

                                            <Star
                                                key={star}
                                                size={14}
                                                fill={
                                                    star <= selectedReview.rating
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />

                                        )
                                    )}

                                </div>

                                <p className="mb-0">
                                    {selectedReview.comment}
                                </p>

                            </div>


                            {/* Modal Error */}
                            {removeError && (

                                <div
                                    className="alert alert-danger py-2"
                                    role="alert"
                                >
                                    {removeError}
                                </div>

                            )}


                            {/* Modal Buttons */}
                            <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn admin-review-modal-cancel"
                                    onClick={
                                        closeRemoveModal
                                    }
                                    disabled={
                                        isRemoving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="btn admin-review-modal-remove d-flex align-items-center justify-content-center gap-2"
                                    onClick={
                                        handleRemoveReview
                                    }
                                    disabled={
                                        isRemoving
                                    }
                                >

                                    <Trash2
                                        size={15}
                                    />

                                    {isRemoving
                                        ? "Removing..."
                                        : "Remove Review"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </main>
    );
}