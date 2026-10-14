//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import {
    Link,
    useLocation,
    useParams
} from "react-router-dom";

//Import Storefront icons
import {
    ArrowLeft,
    ArrowRight,
    Clock3,
    MapPin,
    Star
} from "lucide-react";

//Import Storefront styles
import "./BakeryStorefront.css";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";


//Displays the public customer Storefront for a Bakery
export default function BakeryStorefront() {

    //Get the Bakery slug from the URL
    const { slug } = useParams();

    //Gets the current Storefront URL
    const location = useLocation();

    //Stores the public Bakery information
    const [bakery, setBakery] = useState(null);

    //Stores the public Bakery Products
    const [products, setProducts] = useState([]);

    //Stores public Bakery Reviews
    const [reviews, setReviews] = useState([]);

    //Stores Bakery Review summary
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    //Tracks the currently displayed featured Product
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

    //Tracks the currently displayed Review
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    //Tracks whether the Storefront is loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores Storefront loading errors
    const [error, setError] = useState("");


    //Loads the Bakery, Products and Reviews
    useEffect(() => {

        //Gets all information needed for the Storefront
        async function fetchStorefront() {

            setIsLoading(true);
            setError("");

            try {

                //Request the public Bakery, Products and Reviews together
                const [
                    bakeryResponse,
                    productsResponse,
                    reviewsResponse
                ] = await Promise.all([
                    fetch(`http://localhost:3000/api/bakeries/public/${slug}`),
                    fetch(`http://localhost:3000/api/bakeries/public/${slug}/products`),
                    fetch(`http://localhost:3000/api/reviews/public/${slug}`)
                ]);

                //Convert responses into JavaScript data
                const bakeryData = await bakeryResponse.json();
                const productsData = await productsResponse.json();
                const reviewsData = await reviewsResponse.json();

                //Stop if the Bakery could not be loaded
                if (!bakeryResponse.ok) {
                    throw new Error(
                        bakeryData.message ||
                        "Unable to load bakery"
                    );
                }

                //Stop if the Products could not be loaded
                if (!productsResponse.ok) {
                    throw new Error(
                        productsData.message ||
                        "Unable to load products"
                    );
                }

                //Stop if the Reviews could not be loaded
                if (!reviewsResponse.ok) {
                    throw new Error(
                        reviewsData.message ||
                        "Unable to load reviews"
                    );
                }

                //Save the Bakery information
                setBakery(
                    bakeryData.bakery
                );

                //Save the public Products
                setProducts(
                    productsData.products || []
                );

                //Save the public Reviews
                setReviews(
                    reviewsData.reviews || []
                );

                //Save the Review summary
                setAverageRating(
                    reviewsData.average_rating || 0
                );

                setReviewCount(
                    reviewsData.review_count || 0
                );

                //Start carousels from first item
                setCurrentFeatureIndex(0);
                setCurrentReviewIndex(0);

            } catch (error) {

                //Display the Storefront error
                setError(
                    error.message
                );

            } finally {

                //Stop the loading state
                setIsLoading(false);
            }
        }

        //Load the Storefront
        fetchStorefront();

    }, [slug]);


    //Scrolls to a Storefront section when the URL contains a hash
    useEffect(() => {

        //Wait until the Storefront has finished loading
        if (
            isLoading ||
            !bakery ||
            !location.hash
        ) {
            return;
        }

        //Get the section ID from the URL
        const sectionId =
            location.hash.replace(
                "#",
                ""
            );

        //Find the Storefront section
        const section =
            document.getElementById(
                sectionId
            );

        //Scroll to the section when it exists
        if (section) {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    }, [
        location.hash,
        isLoading,
        bakery
    ]);


    //Automatically changes the featured Product every 5 seconds
    useEffect(() => {

        //Find Products that can be shown in the featured carousel
        const featured =
            products.filter(
                (product) =>
                    product.is_featured
            );

        //Use featured Products or regular Products as a fallback
        const rotatingProducts =
            featured.length > 0
                ? featured.slice(0, 4)
                : products.slice(0, 4);

        //Do not start the carousel when there is only one Product
        if (rotatingProducts.length <= 1) {
            return;
        }

        //Move to the next Product every 5 seconds
        const interval =
            setInterval(() => {

                setCurrentFeatureIndex(
                    (currentIndex) =>
                        currentIndex ===
                            rotatingProducts.length - 1
                            ? 0
                            : currentIndex + 1
                );

            }, 5000);

        //Clean up the timer
        return () =>
            clearInterval(interval);

    }, [
        products,
        currentFeatureIndex
    ]);


    //Automatically changes the Review every 5 seconds
    useEffect(() => {

        //Use up to five Reviews in the homepage carousel
        const rotatingReviewCount =
            Math.min(
                reviews.length,
                5
            );

        //Do not start carousel when there is only one Review
        if (rotatingReviewCount <= 1) {
            return;
        }

        //Move to the next Review every 5 seconds
        const interval =
            setInterval(() => {

                setCurrentReviewIndex(
                    (currentIndex) =>
                        currentIndex ===
                            rotatingReviewCount - 1
                            ? 0
                            : currentIndex + 1
                );

            }, 5000);

        //Clean up the timer
        return () =>
            clearInterval(interval);

    }, [
        reviews.length,
        currentReviewIndex
    ]);


    //Formats Product prices using the Bakery currency
    function formatPrice(price) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency:
                    bakery?.currency ||
                    "CAD"
            }
        ).format(
            price || 0
        );
    }


    //Returns an icon based on the Product category
    function getCategoryIcon(category) {

        const categoryName =
            category?.toLowerCase() ||
            "";

        if (
            categoryName.includes(
                "cupcake"
            )
        ) {
            return "🧁";
        }

        if (
            categoryName.includes(
                "cookie"
            )
        ) {
            return "🍪";
        }

        if (
            categoryName.includes(
                "dessert"
            ) ||
            categoryName.includes(
                "box"
            )
        ) {
            return "🎁";
        }

        if (
            categoryName.includes(
                "season"
            )
        ) {
            return "🌸";
        }

        if (
            categoryName.includes(
                "bread"
            )
        ) {
            return "🥖";
        }

        if (
            categoryName.includes(
                "pastry"
            )
        ) {
            return "🥐";
        }

        if (
            categoryName.includes(
                "cake"
            )
        ) {
            return "🎂";
        }

        return "🍰";
    }


    //Returns the correct action text for a Product
    function getProductActionLabel(product) {

        const categoryName =
            product?.category?.toLowerCase() ||
            "";

        if (
            categoryName.includes(
                "cake"
            )
        ) {
            return "Customize";
        }

        return "View item";
    }


    //Displays Customer name like Olivia C.
    function getCustomerName(customer) {

        if (!customer) {
            return "Customer";
        }

        const firstName =
            customer.first_name ||
            "Customer";

        const lastInitial =
            customer.last_name
                ? `${customer.last_name.charAt(0)}.`
                : "";

        return `${firstName} ${lastInitial}`.trim();
    }


    //Formats Review date
    function formatReviewDate(date) {

        const reviewDate =
            new Date(date);

        const today =
            new Date();

        const difference =
            today.getTime() -
            reviewDate.getTime();

        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );

        //Review was posted today
        if (days <= 0) {
            return "Today";
        }

        //Review was posted yesterday
        if (days === 1) {
            return "Yesterday";
        }

        //Reviews from this week
        if (days < 7) {
            return `${days} days ago`;
        }

        //Reviews from this month
        if (days < 30) {

            const weeks =
                Math.floor(
                    days / 7
                );

            return weeks === 1
                ? "1 week ago"
                : `${weeks} weeks ago`;
        }

        //Older Reviews use a normal date
        return reviewDate.toLocaleDateString(
            "en-CA",
            {
                month: "short",
                day: "numeric"
            }
        );
    }


    //Displays the loading screen
    if (isLoading) {

        return (

            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading storefront...
                    </span>
                </div>

                <p className="mb-0">
                    Loading bakery...
                </p>

            </div>
        );
    }


    //Displays a Storefront error
    if (
        error ||
        !bakery
    ) {

        return (

            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="mb-0">
                    Storefront unavailable
                </h1>

                <p className="text-secondary mb-1">
                    {error || "Bakery not found"}
                </p>

                <Link
                    to="/"
                    className="storefront-primary-button d-inline-flex align-items-center justify-content-center text-decoration-none"
                >
                    Back to Bakeau
                </Link>

            </div>
        );
    }


    //Find Products selected as featured
    const featuredProducts =
        products.filter(
            (product) =>
                product.is_featured
        );


    //Use up to four regular Products if no Product is featured
    const heroProducts =
        featuredProducts.length > 0
            ? featuredProducts.slice(0, 4)
            : products.slice(0, 4);


    //Get the currently selected featured Product
    const featuredProduct =
        heroProducts[currentFeatureIndex] ||
        products[0];


    //Create a list of unique Product categories
    const categories = [
        ...new Set(
            products
                .map(
                    (product) =>
                        product.category
                )
                .filter(Boolean)
        )
    ];


    //Create Category cards
    const categoryCards =
        categories
            .slice(0, 5)
            .map(
                (category) => ({
                    name:
                        category,

                    icon:
                        getCategoryIcon(
                            category
                        )
                })
            );


    //Use Products as Best Sellers until sales ranking is added
    const bestSellerProducts =
        products.slice(0, 4);


    //Sort Reviews by highest rating and then newest date
    const topReviews = [
        ...reviews
    ]
        .sort(
            (
                firstReview,
                secondReview
            ) => {

                //Show higher rated Reviews first
                if (
                    secondReview.rating !==
                    firstReview.rating
                ) {
                    return (
                        secondReview.rating -
                        firstReview.rating
                    );
                }

                //Show newer Reviews first when ratings are equal
                return (
                    new Date(
                        secondReview.created_at
                    ) -
                    new Date(
                        firstReview.created_at
                    )
                );
            }
        )
        .slice(0, 5);


    //Get the currently displayed Review
    const featuredReview =
        topReviews[
        currentReviewIndex
        ] ||
        topReviews[0];


    //Create the public pickup address
    const pickupAddress = [
        bakery.address?.street,
        bakery.address?.city
    ]
        .filter(Boolean)
        .join(", ");


    //Move to the previous featured Product
    function showPreviousFeature() {

        setCurrentFeatureIndex(
            (currentIndex) =>
                currentIndex === 0
                    ? heroProducts.length - 1
                    : currentIndex - 1
        );
    }


    //Move to the next featured Product
    function showNextFeature() {

        setCurrentFeatureIndex(
            (currentIndex) =>
                currentIndex ===
                    heroProducts.length - 1
                    ? 0
                    : currentIndex + 1
        );
    }


    //Move to the previous Review
    function showPreviousReview() {

        setCurrentReviewIndex(
            (currentIndex) =>
                currentIndex === 0
                    ? topReviews.length - 1
                    : currentIndex - 1
        );
    }


    //Move to the next Review
    function showNextReview() {

        setCurrentReviewIndex(
            (currentIndex) =>
                currentIndex ===
                    topReviews.length - 1
                    ? 0
                    : currentIndex + 1
        );
    }


    return (

        //Theme comes from the Bakery Owner and applies to the whole Storefront
        <div
            className="bakery-storefront-page min-vh-100"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar
                bakery={bakery}
            />


            <main>

                {/* Featured section */}
                <section className="container-xxl px-3 pt-4 pt-lg-5">

                    {/* Featured heading */}
                    <div className="d-flex align-items-end justify-content-between gap-3 mb-4">

                        <div>

                            <p className="storefront-eyebrow mb-2">
                                Baker's Picks
                            </p>

                            <h2 className="storefront-small-section-title mb-0">
                                Featured this week
                            </h2>

                        </div>


                        <a
                            href="#menu"
                            className="storefront-view-all d-none d-sm-inline-flex align-items-center gap-1 text-decoration-none"
                        >
                            View all

                            <ArrowRight
                                size={14}
                            />
                        </a>

                    </div>


                    {/* Featured Product showcase */}
                    {featuredProduct ? (

                        <div className="storefront-feature-card position-relative">

                            <div
                                key={
                                    featuredProduct._id
                                }
                                className="row g-0 align-items-stretch storefront-feature-transition"
                            >

                                {/* Featured Product image */}
                                <div className="col-12 col-lg-7">

                                    {featuredProduct.image_url ? (

                                        //Bootstrap keeps the Product image responsive
                                        <div className="ratio ratio-16x9">

                                            <img
                                                src={
                                                    featuredProduct.image_url
                                                }
                                                alt={
                                                    featuredProduct.name
                                                }
                                                className="storefront-feature-image w-100 h-100"
                                            />

                                        </div>

                                    ) : (

                                        <div className="storefront-feature-placeholder d-flex align-items-center justify-content-center text-center p-5">
                                            Product image coming soon
                                        </div>

                                    )}

                                </div>


                                {/* Featured Product information */}
                                <div className="col-12 col-lg-5 d-flex">

                                    <div className="d-flex flex-column align-items-start justify-content-center w-100 p-4 p-md-5">

                                        <p className="storefront-eyebrow mb-2">
                                            {featuredProduct.category}
                                        </p>


                                        <h1 className="storefront-feature-title mb-3">
                                            {featuredProduct.name}
                                        </h1>


                                        <p className="storefront-feature-description mb-4">
                                            {featuredProduct.description}
                                        </p>


                                        <div className="d-flex align-items-center flex-wrap gap-3 mb-4">

                                            <strong className="storefront-feature-price">

                                                From{" "}

                                                {
                                                    formatPrice(
                                                        featuredProduct.base_price
                                                    )
                                                }

                                            </strong>


                                            {bakery.minimum_order_notice && (

                                                <span className="storefront-notice-text">

                                                    {
                                                        bakery.minimum_order_notice
                                                    }{" "}
                                                    hours notice

                                                </span>

                                            )}

                                        </div>


                                        {/* Open Product page */}
                                        <Link
                                            to={`/store/${slug}/product/${featuredProduct._id}`}
                                            className="storefront-primary-button d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none"
                                        >

                                            {
                                                getProductActionLabel(
                                                    featuredProduct
                                                )
                                            }

                                            <ArrowRight
                                                size={17}
                                            />

                                        </Link>

                                    </div>

                                </div>

                            </div>


                            {/* Carousel controls */}
                            {heroProducts.length > 1 && (

                                <>

                                    {/* Previous Product */}
                                    <button
                                        type="button"
                                        aria-label="Previous featured product"
                                        onClick={
                                            showPreviousFeature
                                        }
                                        className="storefront-carousel-arrow position-absolute top-50 start-0 translate-middle-y ms-3 d-none d-md-flex align-items-center justify-content-center"
                                    >
                                        <ArrowLeft
                                            size={18}
                                        />
                                    </button>


                                    {/* Next Product */}
                                    <button
                                        type="button"
                                        aria-label="Next featured product"
                                        onClick={
                                            showNextFeature
                                        }
                                        className="storefront-carousel-arrow position-absolute top-50 end-0 translate-middle-y me-3 d-none d-md-flex align-items-center justify-content-center"
                                    >
                                        <ArrowRight
                                            size={18}
                                        />
                                    </button>


                                    {/* Carousel dots */}
                                    <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex align-items-center gap-2 mb-3">

                                        {heroProducts.map(
                                            (
                                                product,
                                                index
                                            ) => (

                                                <button
                                                    type="button"
                                                    key={
                                                        product._id
                                                    }
                                                    aria-label={
                                                        `Show ${product.name}`
                                                    }
                                                    onClick={() =>
                                                        setCurrentFeatureIndex(
                                                            index
                                                        )
                                                    }
                                                    className={
                                                        index ===
                                                            currentFeatureIndex
                                                            ? "storefront-carousel-dot active"
                                                            : "storefront-carousel-dot"
                                                    }
                                                />

                                            )
                                        )}

                                    </div>

                                </>

                            )}

                        </div>

                    ) : (

                        <div className="storefront-empty-products text-center p-5">
                            Products coming soon.
                        </div>

                    )}

                </section>


                {/* Product categories */}
                {categoryCards.length > 0 && (

                    <section
                        id="categories"
                        className="container-xxl px-3 py-4"
                    >

                        <div className="row g-3">

                            {categoryCards.map(
                                (category) => (

                                    <div
                                        className="col-6 col-sm-4 col-md-3 col-lg"
                                        key={
                                            category.name
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="storefront-category-card w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-2 p-3 p-md-4"
                                        >

                                            <span className="storefront-category-icon">
                                                {category.icon}
                                            </span>

                                            <span className="fw-semibold text-center">
                                                {category.name}
                                            </span>

                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    </section>

                )}


                {/* Best Sellers */}
                <section
                    id="menu"
                    className="container-xxl px-3 py-4 py-lg-5"
                >

                    {/* Best Sellers heading */}
                    <div className="d-flex align-items-end justify-content-between gap-3 mb-4">

                        <div>

                            <h2 className="storefront-small-section-title mb-1">
                                Best Sellers
                            </h2>

                            <p className="text-secondary mb-0">
                                Customer favorites, baked fresh.
                            </p>

                        </div>


                        <span className="storefront-view-all d-none d-sm-inline-flex align-items-center gap-1">

                            View all

                            <ArrowRight
                                size={14}
                            />

                        </span>

                    </div>


                    {bestSellerProducts.length > 0 ? (

                        <div className="row g-3 g-md-4">

                            {bestSellerProducts.map(
                                (product) => (

                                    <div
                                        className="col-12 col-sm-6 col-lg-3"
                                        key={
                                            product._id
                                        }
                                    >

                                        <article className="storefront-product-card h-100 d-flex flex-column">

                                            {/* Product image */}
                                            {product.image_url ? (

                                                <img
                                                    src={
                                                        product.image_url
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    className="storefront-product-image w-100"
                                                />

                                            ) : (

                                                <div className="storefront-product-placeholder d-flex align-items-center justify-content-center">
                                                    🍰
                                                </div>

                                            )}


                                            {/* Product information */}
                                            <div className="d-flex flex-column flex-grow-1 p-3">

                                                <h3 className="storefront-product-title mb-1">
                                                    {product.name}
                                                </h3>


                                                <p className="storefront-product-price mb-3">

                                                    From{" "}

                                                    {
                                                        formatPrice(
                                                            product.base_price
                                                        )
                                                    }

                                                </p>


                                                {/* Product action */}
                                                <Link
                                                    to={`/store/${slug}/product/${product._id}`}
                                                    className="storefront-product-action d-flex align-items-center justify-content-center text-decoration-none mt-auto"
                                                >

                                                    {
                                                        getProductActionLabel(
                                                            product
                                                        )
                                                    }

                                                </Link>

                                            </div>

                                        </article>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <div className="storefront-empty-products text-center p-4 p-md-5">

                            <h3 className="mb-2">
                                Menu coming soon
                            </h3>

                            <p className="text-secondary mb-0">
                                This bakery has not published any products yet.
                            </p>

                        </div>

                    )}

                </section>


                {/* How it works */}
                <section
                    id="how-it-works"
                    className="storefront-how-section py-5"
                >

                    <div className="container-xxl px-3 py-lg-4">

                        <h2 className="storefront-how-title text-center mb-4 mb-md-5">
                            How it works
                        </h2>


                        <div className="row g-3 g-md-4">

                            {/* Step 1 */}
                            <div className="col-12 col-md-4">

                                <div className="storefront-how-card h-100 p-4">

                                    <span className="storefront-step-number">
                                        01
                                    </span>

                                    <h3 className="mt-3 mb-2">
                                        Customize
                                    </h3>

                                    <p className="mb-0">
                                        Choose your product options and add any special instructions for the bakery.
                                    </p>

                                </div>

                            </div>


                            {/* Step 2 */}
                            <div className="col-12 col-md-4">

                                <div className="storefront-how-card h-100 p-4">

                                    <span className="storefront-step-number">
                                        02
                                    </span>

                                    <h3 className="mt-3 mb-2">
                                        Choose pickup
                                    </h3>

                                    <p className="mb-0">

                                        Select an available pickup date and time that works for you

                                        {
                                            bakery.minimum_order_notice
                                                ? `, at least ${bakery.minimum_order_notice} hours ahead.`
                                                : "."
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* Step 3 */}
                            <div className="col-12 col-md-4">

                                <div className="storefront-how-card h-100 p-4">

                                    <span className="storefront-step-number">
                                        03
                                    </span>

                                    <h3 className="mt-3 mb-2">
                                        Confirm order
                                    </h3>

                                    <p className="mb-0">
                                        Sign in or create your customer account, review your details, and place your order.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="text-center mt-4">

                            <a
                                href="#menu"
                                className="storefront-primary-button d-inline-flex align-items-center gap-2 text-decoration-none"
                            >

                                Start your order

                                <ArrowRight
                                    size={16}
                                />

                            </a>

                        </div>

                    </div>

                </section>


                {/* Customer Reviews */}
                <section
                    id="reviews"
                    className="storefront-reviews-section py-5"
                >

                    <div className="container-xxl px-3">

                        {/* Reviews heading */}
                        <div className="d-flex align-items-end justify-content-between gap-3 mb-4">

                            <div>

                                <p className="storefront-eyebrow mb-2">
                                    Reviews
                                </p>

                                <h2 className="storefront-small-section-title mb-0">
                                    What customers say
                                </h2>

                            </div>


                            {/* Opens full Reviews page */}
                            {reviews.length > 0 && (

                                <Link
                                    to={`/store/${slug}/reviews`}
                                    className="storefront-view-all d-none d-sm-inline-flex align-items-center gap-1 text-decoration-none"
                                >

                                    All reviews

                                    <ArrowRight
                                        size={14}
                                    />

                                </Link>

                            )}

                        </div>


                        {featuredReview ? (

                            <>

                                {/* Featured Review */}
                                <div className="storefront-feature-review position-relative">

                                    <div
                                        key={
                                            featuredReview._id
                                        }
                                        className="storefront-review-transition"
                                    >

                                        <div className="row g-0 align-items-stretch">

                                            {/* Review information */}
                                            <div
                                                className={
                                                    featuredReview.image_url
                                                        ? "col-12 col-lg-7 d-flex"
                                                        : "col-12 d-flex"
                                                }
                                            >

                                                <div className="d-flex flex-column justify-content-center w-100 p-4 p-md-5">

                                                    {/* Customer and Rating */}
                                                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">

                                                        {/* Customer information */}
                                                        <div>

                                                            <h3 className="storefront-feature-review-name mb-1">

                                                                {
                                                                    getCustomerName(
                                                                        featuredReview.customer_id
                                                                    )
                                                                }

                                                            </h3>

                                                            <span className="storefront-feature-review-date">

                                                                {
                                                                    formatReviewDate(
                                                                        featuredReview.created_at
                                                                    )
                                                                }

                                                            </span>

                                                        </div>


                                                        {/* Review stars */}
                                                        <div className="d-flex gap-1 storefront-feature-review-stars">

                                                            {[1, 2, 3, 4, 5].map(
                                                                (star) => (

                                                                    <Star
                                                                        key={
                                                                            star
                                                                        }
                                                                        size={18}
                                                                        fill={
                                                                            star <= featuredReview.rating
                                                                                ? "currentColor"
                                                                                : "none"
                                                                        }
                                                                    />

                                                                )
                                                            )}

                                                        </div>

                                                    </div>


                                                    {/* Review Comment */}
                                                    <p className="storefront-feature-review-comment">

                                                        “{featuredReview.comment}”

                                                    </p>


                                                    {/* Bakery Reply */}
                                                    {featuredReview.owner_reply && (

                                                        <div className="storefront-feature-review-reply">

                                                            <strong>
                                                                {bakery.name} replied
                                                            </strong>

                                                            <p className="mb-0">
                                                                {featuredReview.owner_reply}
                                                            </p>

                                                        </div>

                                                    )}


                                                    {/* Verified Order */}
                                                    <span className="storefront-feature-review-verified">
                                                        ✓ VERIFIED ORDER
                                                    </span>

                                                </div>

                                            </div>


                                            {/* Review Image */}
                                            {featuredReview.image_url && (

                                                <div className="col-12 col-lg-5">

                                                    <div className="ratio ratio-4x3 h-100">

                                                        <img
                                                            src={
                                                                featuredReview.image_url
                                                            }
                                                            alt="Customer review"
                                                            className="storefront-feature-review-image w-100 h-100"
                                                        />

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {/* Review carousel arrows */}
                                    {topReviews.length > 1 && (

                                        <>

                                            {/* Previous Review */}
                                            <button
                                                type="button"
                                                aria-label="Previous review"
                                                onClick={
                                                    showPreviousReview
                                                }
                                                className="storefront-review-carousel-arrow position-absolute top-50 start-0 translate-middle-y ms-3 d-none d-md-flex align-items-center justify-content-center"
                                            >

                                                <ArrowLeft
                                                    size={18}
                                                />

                                            </button>


                                            {/* Next Review */}
                                            <button
                                                type="button"
                                                aria-label="Next review"
                                                onClick={
                                                    showNextReview
                                                }
                                                className="storefront-review-carousel-arrow position-absolute top-50 end-0 translate-middle-y me-3 d-none d-md-flex align-items-center justify-content-center"
                                            >

                                                <ArrowRight
                                                    size={18}
                                                />

                                            </button>

                                        </>

                                    )}

                                </div>


                                {/* Review carousel dots */}
                                {topReviews.length > 1 && (

                                    <div className="d-flex align-items-center justify-content-center gap-2 mt-3">

                                        {topReviews.map(
                                            (
                                                review,
                                                index
                                            ) => (

                                                <button
                                                    type="button"
                                                    key={
                                                        review._id
                                                    }
                                                    aria-label={
                                                        `Show review ${index + 1}`
                                                    }
                                                    onClick={() =>
                                                        setCurrentReviewIndex(
                                                            index
                                                        )
                                                    }
                                                    className={
                                                        index ===
                                                            currentReviewIndex
                                                            ? "storefront-review-carousel-dot active"
                                                            : "storefront-review-carousel-dot"
                                                    }
                                                />

                                            )
                                        )}

                                    </div>

                                )}


                                {/* Mobile All Reviews button */}
                                <div className="d-sm-none mt-4">

                                    <Link
                                        to={`/store/${slug}/reviews`}
                                        className="storefront-primary-button d-flex align-items-center justify-content-center gap-2 text-decoration-none"
                                    >

                                        All reviews

                                        <ArrowRight
                                            size={15}
                                        />

                                    </Link>

                                </div>

                            </>

                        ) : (

                            /* Empty Reviews */
                            <div className="storefront-reviews-empty text-center p-4 p-md-5">

                                <Star
                                    size={25}
                                />

                                <h3 className="mt-3 mb-2">
                                    No reviews yet
                                </h3>

                                <p className="text-secondary mb-3">
                                    Be the first customer to share your experience with {bakery.name}.
                                </p>

                                <Link
                                    to={`/store/${slug}/orders`}
                                    className="storefront-primary-button d-inline-flex align-items-center justify-content-center text-decoration-none"
                                >
                                    Write a review
                                </Link>

                            </div>

                        )}

                    </div>

                </section>


                {/* Bakery About section */}
                <section
                    id="about"
                    className="storefront-about-section py-5"
                >

                    <div className="container-xxl px-3 py-lg-4">

                        <div className="row g-4 g-lg-5 align-items-center">

                            {/* Bakery information */}
                            <div
                                className={
                                    bakery.bakery_image_url
                                        ? "col-12 col-lg-6"
                                        : "col-12 col-lg-8"
                                }
                            >

                                <p className="storefront-eyebrow mb-2">
                                    About the bakery
                                </p>


                                <h2 className="storefront-about-title mb-3">
                                    {bakery.name}
                                </h2>


                                <p className="storefront-about-description mb-4">
                                    {bakery.description}
                                </p>


                                <div className="d-flex flex-column gap-3">

                                    {/* Pickup location */}
                                    {pickupAddress && (

                                        <div className="d-flex align-items-start align-items-sm-center gap-2">

                                            <MapPin
                                                size={18}
                                                className="storefront-about-icon"
                                            />

                                            <span>
                                                {pickupAddress} · Pickup orders only
                                            </span>

                                        </div>

                                    )}


                                    {/* Minimum order notice */}
                                    {bakery.minimum_order_notice && (

                                        <div className="d-flex align-items-start align-items-sm-center gap-2">

                                            <Clock3
                                                size={18}
                                                className="storefront-about-icon"
                                            />

                                            <span>
                                                {bakery.minimum_order_notice}{" "}
                                                hours minimum notice required
                                            </span>

                                        </div>

                                    )}


                                    {/* Reviews */}
                                    <div className="d-flex align-items-start align-items-sm-center gap-2">

                                        <Star
                                            size={18}
                                            className="storefront-about-icon"
                                        />

                                        <span>

                                            {reviewCount > 0
                                                ? `${Number(averageRating).toFixed(1)} out of 5 from ${reviewCount} verified ${reviewCount === 1 ? "review" : "reviews"}`
                                                : "No verified customer reviews yet"
                                            }

                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* Bakery image */}
                            {bakery.bakery_image_url && (

                                <div className="col-12 col-lg-6">

                                    <img
                                        src={
                                            bakery.bakery_image_url
                                        }
                                        alt={
                                            bakery.name
                                        }
                                        className="storefront-about-image w-100"
                                    />

                                </div>

                            )}

                        </div>

                    </div>

                </section>

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter
                bakery={bakery}
            />

        </div>
    );
}