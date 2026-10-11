//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useParams } from "react-router-dom";

//Import Storefront icons
import {
    ArrowLeft,
    ArrowRight,
    Clock3,
    MapPin,
    Menu,
    ShoppingCart,
    Star,
    X
} from "lucide-react";

//Import Storefront styles
import "./BakeryStorefront.css";


//Displays the public customer Storefront for a Bakery
export default function BakeryStorefront() {

    //Get the Bakery slug from the URL
    const { slug } = useParams();

    //Stores the public Bakery information
    const [bakery, setBakery] = useState(null);

    //Stores the public Bakery Products
    const [products, setProducts] = useState([]);

    //Tracks the currently displayed featured Product
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

    //Tracks whether the mobile navigation is open
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    //Tracks whether the Storefront is loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores Storefront loading errors
    const [error, setError] = useState("");


    //Loads the Bakery and its public Products
    useEffect(() => {

        //Gets all information needed for the Storefront
        async function fetchStorefront() {

            setIsLoading(true);
            setError("");

            try {

                //Request the public Bakery and Products together
                const [bakeryResponse, productsResponse] = await Promise.all([
                    fetch(`http://localhost:3000/api/bakeries/public/${slug}`),
                    fetch(`http://localhost:3000/api/bakeries/public/${slug}/products`)
                ]);

                //Convert both responses into JavaScript data
                const bakeryData = await bakeryResponse.json();
                const productsData = await productsResponse.json();

                //Stop if the Bakery could not be loaded
                if (!bakeryResponse.ok) {
                    throw new Error(bakeryData.message || "Unable to load bakery");
                }

                //Stop if the Products could not be loaded
                if (!productsResponse.ok) {
                    throw new Error(productsData.message || "Unable to load products");
                }

                //Save the Bakery information
                setBakery(bakeryData.bakery);

                //Save the public Products
                setProducts(productsData.products || []);

            } catch (error) {

                //Display the Storefront error
                setError(error.message);

            } finally {

                //Stop the loading state
                setIsLoading(false);
            }
        }

        //Load the Storefront
        fetchStorefront();

    }, [slug]);


    //Automatically changes the featured Product every 5 seconds
    useEffect(() => {

        //Find Products that can be shown in the featured carousel
        const featured = products.filter(
            (product) => product.is_featured
        );

        //Use featured Products or regular Products as a fallback
        const rotatingProducts = featured.length > 0
            ? featured.slice(0, 4)
            : products.slice(0, 4);

        //Do not start the carousel when there is only one Product
        if (rotatingProducts.length <= 1) {
            return;
        }

        //Move to the next Product every 5 seconds
        const interval = setInterval(() => {

            setCurrentFeatureIndex((currentIndex) =>
                currentIndex === rotatingProducts.length - 1
                    ? 0
                    : currentIndex + 1
            );

        }, 5000);

        //Clean up the timer
        return () => clearInterval(interval);

    }, [products, currentFeatureIndex]);


    //Creates Bakery initials when no logo exists
    function getBakeryInitials() {

        //Use B when there is no Bakery name
        if (!bakery?.name?.trim()) {
            return "B";
        }

        //Split the Bakery name into words
        const nameParts = bakery.name.trim().split(" ");

        //Use one letter for a one-word Bakery name
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }

        //Use the first two Bakery initials
        return (
            nameParts[0].charAt(0) +
            nameParts[1].charAt(0)
        ).toUpperCase();
    }


    //Formats Product prices using the Bakery currency
    function formatPrice(price) {

        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: bakery?.currency || "CAD"
        }).format(price || 0);
    }


    //Returns an icon based on the Product category
    function getCategoryIcon(category) {

        const categoryName = category?.toLowerCase() || "";

        if (categoryName.includes("cupcake")) {
            return "🧁";
        }

        if (categoryName.includes("cookie")) {
            return "🍪";
        }

        if (categoryName.includes("dessert") || categoryName.includes("box")) {
            return "🎁";
        }

        if (categoryName.includes("season")) {
            return "🌸";
        }

        if (categoryName.includes("bread")) {
            return "🥖";
        }

        if (categoryName.includes("pastry")) {
            return "🥐";
        }

        if (categoryName.includes("cake")) {
            return "🎂";
        }

        return "🍰";
    }


    //Returns the correct action text for a Product
    function getProductActionLabel(product) {

        const categoryName = product?.category?.toLowerCase() || "";

        if (categoryName.includes("cake")) {
            return "Customize";
        }

        return "View item";
    }


    //Closes the mobile navigation
    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }


    //Displays the loading screen
    if (isLoading) {

        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <div className="spinner-border" role="status">
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
    if (error || !bakery) {

        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="mb-0">
                    Storefront unavailable
                </h1>

                <p className="text-secondary mb-1">
                    {error || "Bakery not found"}
                </p>

                <Link to="/" className="storefront-primary-button d-inline-flex align-items-center justify-content-center text-decoration-none">
                    Back to Bakeau
                </Link>

            </div>
        );
    }


    //Find Products selected as featured
    const featuredProducts = products.filter(
        (product) => product.is_featured
    );


    //Use up to four regular Products if no Product is featured
    const heroProducts = featuredProducts.length > 0
        ? featuredProducts.slice(0, 4)
        : products.slice(0, 4);


    //Get the currently selected featured Product
    const featuredProduct = heroProducts[currentFeatureIndex] || products[0];


    //Create a list of unique Product categories
    const categories = [
        ...new Set(
            products
                .map((product) => product.category)
                .filter(Boolean)
        )
    ];


    //Create Category cards
    const categoryCards = categories
        .slice(0, 5)
        .map((category) => ({
            name: category,
            icon: getCategoryIcon(category)
        }));


    //Use Products as Best Sellers until sales ranking is added
    const bestSellerProducts = products.slice(0, 4);


    //Create the public pickup address
    const pickupAddress = [
        bakery.address?.street,
        bakery.address?.city
    ]
        .filter(Boolean)
        .join(", ");


    //Move to the previous featured Product
    function showPreviousFeature() {

        setCurrentFeatureIndex((currentIndex) =>
            currentIndex === 0
                ? heroProducts.length - 1
                : currentIndex - 1
        );
    }


    //Move to the next featured Product
    function showNextFeature() {

        setCurrentFeatureIndex((currentIndex) =>
            currentIndex === heroProducts.length - 1
                ? 0
                : currentIndex + 1
        );
    }


    return (

        <div
            className="bakery-storefront-page min-vh-100"
            style={{
                "--storefront-primary": bakery.primary_color || "#C65F3A",
                "--storefront-secondary": bakery.secondary_color || "#F4E8DF",
                "--storefront-dark": bakery.dark_color || "#432C23"
            }}
        >

            {/* Announcement bar */}
            <div className="storefront-announcement">

                <div className="container-xxl text-center py-2 px-3">

                    <small>

                        {bakery.minimum_order_notice && (
                            <>
                                Orders require{" "}
                                {bakery.minimum_order_notice} hours' notice
                            </>
                        )}

                        {bakery.minimum_order_notice && pickupAddress && (
                            <> • </>
                        )}

                        {pickupAddress && (
                            <>
                                Pickup from {pickupAddress}
                            </>
                        )}

                    </small>

                </div>

            </div>


            {/* Storefront navigation */}
            <header className="storefront-header">

                <div className="container-xxl px-3">

                    {/* Main navigation row */}
                    <div className="d-flex align-items-center justify-content-between gap-2 py-3">

                        {/* Bakery logo and name */}
                        <Link
                            to={`/store/${slug}`}
                            onClick={closeMobileMenu}
                            className="storefront-brand d-flex align-items-center gap-2 text-decoration-none flex-shrink-1"
                        >

                            {bakery.logo_image_url ? (

                                <img
                                    src={bakery.logo_image_url}
                                    alt={`${bakery.name} logo`}
                                    className="storefront-logo flex-shrink-0"
                                />

                            ) : (

                                <div className="storefront-logo-fallback d-flex align-items-center justify-content-center flex-shrink-0">
                                    {getBakeryInitials()}
                                </div>
                            )}

                            <span className="storefront-brand-name fw-semibold text-truncate">
                                {bakery.name}
                            </span>

                        </Link>


                        {/* Desktop navigation */}
                        <nav className="d-none d-lg-flex align-items-center gap-4">

                            <a href="#menu" className="storefront-nav-link">
                                Menu
                            </a>

                            <a href="#how-it-works" className="storefront-nav-link">
                                How It Works
                            </a>

                            <a href="#reviews" className="storefront-nav-link">
                                Reviews
                            </a>

                            <a href="#about" className="storefront-nav-link">
                                About
                            </a>

                        </nav>


                        {/* Desktop actions */}
                        <div className="d-none d-lg-flex align-items-center gap-3 flex-shrink-0">

                            {/* Cart will be connected later */}
                            <button type="button" className="storefront-text-action d-flex align-items-center gap-1">
                                <ShoppingCart size={17} />
                                Cart (0)
                            </button>


                            {/* Customer Sign In will be connected later */}
                            <button type="button" className="storefront-text-action">
                                Sign In
                            </button>


                            {/* Bakery Owner Login */}
                            <Link to="/login" className="storefront-bakery-login text-decoration-none">
                                Bakery Login
                            </Link>

                        </div>


                        {/* Mobile actions */}
                        <div className="d-flex d-lg-none align-items-center gap-2 flex-shrink-0">

                            {/* Mobile Cart */}
                            <button
                                type="button"
                                aria-label="Open cart"
                                className="storefront-mobile-action d-flex align-items-center gap-1"
                            >
                                <ShoppingCart size={19} />

                                <span className="small">
                                    (0)
                                </span>
                            </button>


                            {/* Burger Menu */}
                            <button
                                type="button"
                                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="storefront-mobile-menu"
                                onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
                                className="storefront-mobile-menu-button d-flex align-items-center justify-content-center"
                            >
                                {isMobileMenuOpen ? (
                                    <X size={21} />
                                ) : (
                                    <Menu size={21} />
                                )}
                            </button>

                        </div>

                    </div>


                    {/* Mobile navigation */}
                    {isMobileMenuOpen && (

                        <div id="storefront-mobile-menu" className="d-lg-none pb-3">

                            <div className="storefront-mobile-menu p-3">

                                {/* Mobile navigation links */}
                                <nav className="d-grid gap-1">

                                    <a
                                        href="#menu"
                                        onClick={closeMobileMenu}
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        Menu
                                    </a>

                                    <a
                                        href="#how-it-works"
                                        onClick={closeMobileMenu}
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        How It Works
                                    </a>

                                    <a
                                        href="#reviews"
                                        onClick={closeMobileMenu}
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        Reviews
                                    </a>

                                    <a
                                        href="#about"
                                        onClick={closeMobileMenu}
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        About
                                    </a>

                                </nav>


                                <hr className="my-3" />


                                {/* Mobile account actions */}
                                <div className="d-grid gap-2">

                                    {/* Customer Sign In will be connected later */}
                                    <button type="button" className="storefront-mobile-signin py-2 px-3">
                                        Sign In
                                    </button>


                                    {/* Bakery Owner Login */}
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="storefront-mobile-bakery-login text-center text-decoration-none py-2 px-3"
                                    >
                                        Bakery Login
                                    </Link>

                                </div>

                            </div>

                        </div>
                    )}

                </div>

            </header>


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


                        <a href="#menu" className="storefront-view-all d-none d-sm-inline-flex align-items-center gap-1 text-decoration-none">
                            View all
                            <ArrowRight size={14} />
                        </a>

                    </div>


                    {/* Featured Product showcase */}
                    {featuredProduct ? (

                        <div className="storefront-feature-card position-relative">

                            <div
                                key={featuredProduct._id}
                                className="row g-0 align-items-stretch storefront-feature-transition"
                            >

                                {/* Featured Product image */}
                                <div className="col-12 col-lg-7">

                                    {featuredProduct.image_url ? (

                                        //Bootstrap keeps the Product image responsive
                                        <div className="ratio ratio-16x9">

                                            <img
                                                src={featuredProduct.image_url}
                                                alt={featuredProduct.name}
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
                                                {formatPrice(
                                                    featuredProduct.base_price
                                                )}
                                            </strong>


                                            {bakery.minimum_order_notice && (

                                                <span className="storefront-notice-text">
                                                    {bakery.minimum_order_notice} hours notice
                                                </span>
                                            )}

                                        </div>


                                        {/* Open Product page */}
                                        <Link
                                            to={`/store/${slug}/product/${featuredProduct._id}`}
                                            className="storefront-primary-button d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none"
                                        >
                                            {getProductActionLabel(featuredProduct)}

                                            <ArrowRight size={17} />
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
                                        onClick={showPreviousFeature}
                                        className="storefront-carousel-arrow position-absolute top-50 start-0 translate-middle-y ms-3 d-none d-md-flex align-items-center justify-content-center"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>


                                    {/* Next Product */}
                                    <button
                                        type="button"
                                        aria-label="Next featured product"
                                        onClick={showNextFeature}
                                        className="storefront-carousel-arrow position-absolute top-50 end-0 translate-middle-y me-3 d-none d-md-flex align-items-center justify-content-center"
                                    >
                                        <ArrowRight size={18} />
                                    </button>


                                    {/* Carousel dots */}
                                    <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex align-items-center gap-2 mb-3">

                                        {heroProducts.map((product, index) => (

                                            <button
                                                type="button"
                                                key={product._id}
                                                aria-label={`Show ${product.name}`}
                                                onClick={() => setCurrentFeatureIndex(index)}
                                                className={
                                                    index === currentFeatureIndex
                                                        ? "storefront-carousel-dot active"
                                                        : "storefront-carousel-dot"
                                                }
                                            />

                                        ))}

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

                    <section id="categories" className="container-xxl px-3 py-4">

                        <div className="row g-3">

                            {categoryCards.map((category) => (

                                <div className="col-6 col-sm-4 col-md-3 col-lg" key={category.name}>

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
                            ))}

                        </div>

                    </section>
                )}


                {/* Best Sellers */}
                <section id="menu" className="container-xxl px-3 py-4 py-lg-5">

                    {/* Best Sellers heading */}
                    <div className="d-flex align-items-end justify-content-between gap-3 mb-4">

                        <div>

                            <h2 className="storefront-small-section-title mb-1">
                                Best Sellers
                            </h2>

                            <p className="text-secondary mb-0">
                                Customer favourites, baked fresh.
                            </p>

                        </div>


                        <span className="storefront-view-all d-none d-sm-inline-flex align-items-center gap-1">
                            View all
                            <ArrowRight size={14} />
                        </span>

                    </div>


                    {bestSellerProducts.length > 0 ? (

                        <div className="row g-3 g-md-4">

                            {bestSellerProducts.map((product) => (

                                <div className="col-12 col-sm-6 col-lg-3" key={product._id}>

                                    <article className="storefront-product-card h-100 d-flex flex-column">

                                        {/* Product image */}
                                        {product.image_url ? (

                                            <img
                                                src={product.image_url}
                                                alt={product.name}
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
                                                From {formatPrice(product.base_price)}
                                            </p>


                                            {/* Product action */}
                                            <Link
                                                to={`/store/${slug}/product/${product._id}`}
                                                className="storefront-product-action d-flex align-items-center justify-content-center text-decoration-none mt-auto"
                                            >
                                                {getProductActionLabel(product)}
                                            </Link>

                                        </div>

                                    </article>

                                </div>
                            ))}

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
                <section id="how-it-works" className="storefront-how-section py-5">

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
                                        {bakery.minimum_order_notice
                                            ? `, at least ${bakery.minimum_order_notice} hours ahead.`
                                            : "."}
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
                                <ArrowRight size={16} />
                            </a>

                        </div>

                    </div>

                </section>


                {/* Customer Reviews */}
                <section id="reviews" className="storefront-reviews-section py-5">

                    <div className="container-xxl px-3">

                        <div className="d-flex align-items-end justify-content-between gap-3 mb-4">

                            <div>

                                <p className="storefront-eyebrow mb-2">
                                    Reviews
                                </p>

                                <h2 className="storefront-small-section-title mb-0">
                                    What customers say
                                </h2>

                            </div>


                            <span className="storefront-view-all d-none d-sm-inline-flex align-items-center gap-1">
                                All reviews
                                <ArrowRight size={14} />
                            </span>

                        </div>


                        {/* Real customer Reviews will be added later */}
                        <div className="storefront-reviews-empty text-center p-4 p-md-5">

                            <Star size={25} />

                            <h3 className="mt-3 mb-2">
                                Customer reviews coming soon
                            </h3>

                            <p className="text-secondary mb-0">
                                Reviews from verified Bakeau orders will appear here.
                            </p>

                        </div>

                    </div>

                </section>


                {/* Bakery About section */}
                <section id="about" className="storefront-about-section py-5">

                    <div className="container-xxl px-3 py-lg-4">

                        <div className="row g-4 g-lg-5 align-items-center">

                            {/* Bakery information */}
                            <div className={bakery.bakery_image_url ? "col-12 col-lg-6" : "col-12 col-lg-8"}>

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

                                            <MapPin size={18} className="storefront-about-icon" />

                                            <span>
                                                {pickupAddress} · Pickup orders only
                                            </span>

                                        </div>
                                    )}


                                    {/* Minimum order notice */}
                                    {bakery.minimum_order_notice && (

                                        <div className="d-flex align-items-start align-items-sm-center gap-2">

                                            <Clock3 size={18} className="storefront-about-icon" />

                                            <span>
                                                {bakery.minimum_order_notice} hours minimum notice required
                                            </span>

                                        </div>
                                    )}


                                    {/* Reviews */}
                                    <div className="d-flex align-items-start align-items-sm-center gap-2">

                                        <Star size={18} className="storefront-about-icon" />

                                        <span>
                                            Verified customer reviews coming soon
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* Bakery image */}
                            {bakery.bakery_image_url && (

                                <div className="col-12 col-lg-6">

                                    <img
                                        src={bakery.bakery_image_url}
                                        alt={bakery.name}
                                        className="storefront-about-image w-100"
                                    />

                                </div>
                            )}

                        </div>

                    </div>

                </section>

            </main>


            {/* Storefront footer */}
            <footer className="storefront-footer py-5">

                <div className="container-xxl px-3">

                    <div className="row g-4">

                        {/* Bakery information */}
                        <div className="col-12 col-md-5">

                            <h3 className="mb-3">
                                {bakery.name}
                            </h3>

                            <p className="mb-0">
                                {bakery.description}
                            </p>

                        </div>


                        {/* Pickup */}
                        <div className="col-12 col-sm-6 col-md-3">

                            <h4 className="mb-3">
                                Pickup
                            </h4>

                            <p className="mb-0">

                                {bakery.address?.street}

                                <br />

                                {bakery.address?.city},{" "}
                                {bakery.address?.province}

                            </p>

                        </div>


                        {/* Contact */}
                        <div className="col-12 col-sm-6 col-md-4">

                            <h4 className="mb-3">
                                Contact
                            </h4>

                            <p className="mb-2">

                                {bakery.contact_email}

                                {bakery.contact_phone && (
                                    <>
                                        <br />
                                        {bakery.contact_phone}
                                    </>
                                )}

                            </p>


                            <div className="d-flex flex-wrap gap-3">

                                <span className="storefront-footer-link">
                                    Privacy
                                </span>

                                <span className="storefront-footer-link">
                                    Pickup Policy
                                </span>

                                <span className="storefront-footer-link">
                                    Terms
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </footer>

        </div>
    );
}