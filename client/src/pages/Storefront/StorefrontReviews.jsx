import API_URL from "../../config/api.js";
//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useParams } from "react-router-dom";

//Import Review icon
import { Star } from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Reviews styles
import "./StorefrontReviews.css";


//Displays all public Bakery Reviews
export default function StorefrontReviews() {

    //Get Bakery slug
    const { slug } = useParams();

    //Stores Bakery and Reviews
    const [bakery, setBakery] = useState(null);
    const [reviews, setReviews] = useState([]);

    //Stores Review summary
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    //Page states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");


    //Loads Bakery and public Reviews
    useEffect(() => {

        async function loadReviews() {

            try {

                setError("");

                //Load Bakery and Reviews together
                const [bakeryResponse, reviewsResponse] = await Promise.all([
                    fetch(`${API_URL}/api/bakeries/public/${slug}`),
                    fetch(`${API_URL}/api/reviews/public/${slug}`)
                ]);

                const bakeryData = await bakeryResponse.json();
                const reviewsData = await reviewsResponse.json();

                //Check Bakery response
                if (!bakeryResponse.ok) {
                    throw new Error(
                        bakeryData.message || "Unable to load bakery"
                    );
                }

                //Check Reviews response
                if (!reviewsResponse.ok) {
                    throw new Error(
                        reviewsData.message || "Unable to load reviews"
                    );
                }

                //Store Bakery and Reviews
                setBakery(bakeryData.bakery);
                setReviews(reviewsData.reviews || []);

                //Store Review summary
                setAverageRating(reviewsData.average_rating || 0);
                setReviewCount(reviewsData.review_count || 0);

            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }

        loadReviews();

    }, [slug]);


    //Displays Customer name like Olivia C.
    function getCustomerName(customer) {

        if (!customer) {
            return "Customer";
        }

        const firstName = customer.first_name || "Customer";

        const lastInitial = customer.last_name
            ? `${customer.last_name.charAt(0)}.`
            : "";

        return `${firstName} ${lastInitial}`.trim();
    }


    //Gets first letter for Customer avatar
    function getCustomerInitial(customer) {

        if (!customer?.first_name) {
            return "C";
        }

        return customer.first_name
            .charAt(0)
            .toUpperCase();
    }


    //Formats Review date
    function formatReviewDate(date) {

        const reviewDate = new Date(date);
        const today = new Date();

        const difference =
            today.getTime() - reviewDate.getTime();

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        if (days <= 0) {
            return "Today";
        }

        if (days === 1) {
            return "Yesterday";
        }

        if (days < 7) {
            return `${days} days ago`;
        }

        if (days < 30) {

            const weeks = Math.floor(days / 7);

            return weeks === 1
                ? "1 week ago"
                : `${weeks} weeks ago`;
        }

        //Show normal date for older Reviews
        return reviewDate.toLocaleDateString(
            "en-CA",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    }


    //Loading state
    if (isLoading) {

        return (

            <div className="storefront-reviews-loading d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

            </div>
        );
    }


    //Page error
    if (!bakery) {

        return (

            <div className="storefront-reviews-loading container d-flex flex-column align-items-center justify-content-center text-center gap-3">

                <h1 className="h4 mb-0">
                    Unable to load reviews
                </h1>

                <p className="mb-0">
                    {error || "Bakery not found"}
                </p>

                <Link
                    to={`/store/${slug}`}
                    className="text-decoration-none"
                >
                    Back to bakery
                </Link>

            </div>
        );
    }


    return (

        <div
            className="storefront-reviews-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            <main className="storefront-reviews-main flex-grow-1">

                <div className="container py-4 py-lg-5">

                    {/* Breadcrumb */}
                    <div className="d-flex align-items-center gap-2 mb-4 storefront-reviews-breadcrumb">

                        <Link
                            to={`/store/${slug}`}
                            className="text-decoration-none"
                        >
                            Home
                        </Link>

                        <span>
                            /
                        </span>

                        <span>
                            Reviews
                        </span>

                    </div>


                    {/* Reviews Header */}
                    <section className="row align-items-md-end g-3 g-md-4 mb-4">

                        <div className="col-12 col-md">

                            <span className="storefront-reviews-eyebrow">
                                CUSTOMER LOVE
                            </span>

                            <h1 className="storefront-reviews-title">
                                What customers are saying
                            </h1>

                            <p className="storefront-reviews-description">
                                Real reviews from customers who ordered from {bakery.name}.
                            </p>

                        </div>


                        {/* Write Review button */}
                        <div className="col-12 col-md-auto">

                            <Link
                                to={`/store/${slug}/orders`}
                                className="storefront-reviews-write text-decoration-none w-100"
                            >
                                Write a review
                            </Link>

                        </div>

                    </section>


                    {/* Rating Summary */}
                    <section className="storefront-reviews-summary d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 gap-sm-4 mb-4 mb-lg-5">

                        {/* Average Rating */}
                        <div className="storefront-reviews-score">
                            {Number(averageRating).toFixed(1)}
                        </div>


                        <div>

                            {/* Average stars */}
                            <div className="d-flex gap-1 mb-1 storefront-reviews-summary-stars">

                                {[1, 2, 3, 4, 5].map((star) => (

                                    <Star
                                        key={star}
                                        size={19}
                                        fill={
                                            star <= Math.round(averageRating)
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />

                                ))}

                            </div>


                            {/* Review count */}
                            <p className="mb-0">

                                {Number(averageRating).toFixed(1)} out of 5

                                <span>
                                    {" "}({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                                </span>

                            </p>

                        </div>

                    </section>


                    {/* Empty Reviews */}
                    {reviews.length === 0 ? (

                        <div className="storefront-reviews-empty text-center p-4 p-md-5">

                            <div className="storefront-reviews-empty-stars">
                                ★ ★ ★ ★ ★
                            </div>

                            <h2>
                                No reviews yet
                            </h2>

                            <p>
                                Be the first customer to share your experience with {bakery.name}.
                            </p>

                            <Link
                                to={`/store/${slug}/orders`}
                                className="storefront-reviews-write text-decoration-none"
                            >
                                Write a review
                            </Link>

                        </div>

                    ) : (

                        /* Review Cards */
                        <div className="row g-3 g-md-4">

                            {reviews.map((review) => (

                                <div
                                    className="col-12 col-lg-6"
                                    key={review._id}
                                >

                                    <article className="storefront-review-public-card h-100 d-flex flex-column">

                                        {/* Review Card top */}
                                        <div className="d-flex flex-column flex-sm-row align-items-start justify-content-between gap-3 mb-3">

                                            {/* Customer */}
                                            <div className="d-flex align-items-center gap-2">

                                                {/* Customer Initial */}
                                                <div className="storefront-review-public-avatar">
                                                    {getCustomerInitial(review.customer_id)}
                                                </div>


                                                {/* Customer Name and Date */}
                                                <div>

                                                    <h2 className="storefront-review-public-name">
                                                        {getCustomerName(review.customer_id)}
                                                    </h2>

                                                    <span className="storefront-review-public-date">
                                                        {formatReviewDate(review.created_at)}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* Review Stars */}
                                            <div className="d-flex gap-1 storefront-review-public-stars">

                                                {[1, 2, 3, 4, 5].map((star) => (

                                                    <Star
                                                        key={star}
                                                        size={15}
                                                        fill={
                                                            star <= review.rating
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />

                                                ))}

                                            </div>

                                        </div>


                                        {/* Review Comment */}
                                        <p className="storefront-review-public-comment">
                                            {review.comment}
                                        </p>


                                        {/* Review Image */}
                                        {review.image_url && (

                                            <img
                                                src={review.image_url}
                                                alt="Customer review"
                                                className="storefront-review-public-image"
                                            />

                                        )}


                                        {/* Bakery Reply */}
                                        {review.owner_reply && (

                                            <div className="storefront-review-public-reply">

                                                <span>
                                                    {bakery.name} replied
                                                </span>

                                                <p>
                                                    {review.owner_reply}
                                                </p>

                                            </div>

                                        )}


                                        {/* Verified Order */}
                                        <div className="storefront-review-public-verified mt-auto">
                                            ✓ VERIFIED ORDER
                                        </div>

                                    </article>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}