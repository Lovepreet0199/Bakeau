//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useParams } from "react-router-dom";

//Import Product icons
import {
    ArrowLeft,
    Clock3,
    Menu,
    Minus,
    Plus,
    ShoppingCart,
    Star,
    X
} from "lucide-react";

//Import Product page styles
import "./StorefrontProduct.css";


//Displays a Product from a public Bakery Storefront
export default function StorefrontProduct() {

    //Get Bakery slug and Product ID from the URL
    const { slug, productId } = useParams();

    //Stores Bakery information
    const [bakery, setBakery] = useState(null);

    //Stores Product information
    const [product, setProduct] = useState(null);

    //Stores the Product customization groups and options
    const [customizationDetails, setCustomizationDetails] = useState([]);

    //Stores selected customization options
    const [selectedOptions, setSelectedOptions] = useState({});

    //Stores customer special instructions
    const [specialInstructions, setSpecialInstructions] = useState("");

    //Tracks Product quantity
    const [quantity, setQuantity] = useState(1);

    //Tracks whether the mobile navigation is open
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    //Stores customization validation errors
    const [validationError, setValidationError] = useState("");

    //Tracks page loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores loading errors
    const [error, setError] = useState("");


    //Loads the Bakery and selected Product
    useEffect(() => {

        async function fetchProduct() {

            setIsLoading(true);
            setError("");

            try {

                //Load Bakery and Product together
                const [bakeryResponse, productResponse] = await Promise.all([
                    fetch(`http://localhost:3000/api/bakeries/public/${slug}`),
                    fetch(`http://localhost:3000/api/bakeries/public/${slug}/products/${productId}`)
                ]);

                //Convert responses into JavaScript data
                const bakeryData = await bakeryResponse.json();
                const productData = await productResponse.json();

                //Stop if the Bakery could not be loaded
                if (!bakeryResponse.ok) {
                    throw new Error(bakeryData.message || "Unable to load bakery");
                }

                //Stop if the Product could not be loaded
                if (!productResponse.ok) {
                    throw new Error(productData.message || "Unable to load product");
                }

                //Get Product customization information
                const details = productData.customizationDetails || [];

                //Automatically select the first option for required groups
                const defaultSelections = {};

                details.forEach((detail) => {

                    if (detail.group?.is_required && detail.options?.length > 0) {

                        const groupKey = detail.group._id || detail.group.name;
                        defaultSelections[groupKey] = detail.options[0];
                    }
                });

                //Save Bakery information
                setBakery(bakeryData.bakery);

                //Save Product information
                setProduct(productData.product || productData);

                //Save customization groups
                setCustomizationDetails(details);

                //Save default required selections
                setSelectedOptions(defaultSelections);

            } catch (error) {

                //Display loading error
                setError(error.message);

            } finally {

                //Stop loading
                setIsLoading(false);
            }
        }

        fetchProduct();

    }, [slug, productId]);


    //Creates Bakery initials when no logo exists
    function getBakeryInitials() {

        if (!bakery?.name?.trim()) {
            return "B";
        }

        const nameParts = bakery.name.trim().split(" ");

        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }

        return (
            nameParts[0].charAt(0) +
            nameParts[1].charAt(0)
        ).toUpperCase();
    }


    //Returns a unique key for a customization group
    function getGroupKey(group) {
        return group?._id || group?.name;
    }


    //Returns a unique key for a customization option
    function getOptionKey(option) {
        return option?._id || option?.name;
    }


    //Formats Product prices
    function formatPrice(price) {

        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: bakery?.currency || "CAD"
        }).format(Number(price) || 0);
    }


    //Selects a Product customization option
    function selectOption(detail, option) {

        const groupKey = getGroupKey(detail.group);
        const currentOption = selectedOptions[groupKey];

        //Allow optional selections to be removed
        if (
            !detail.group?.is_required &&
            currentOption &&
            getOptionKey(currentOption) === getOptionKey(option)
        ) {

            setSelectedOptions((currentSelections) => {

                const updatedSelections = {
                    ...currentSelections
                };

                delete updatedSelections[groupKey];

                return updatedSelections;
            });

            return;
        }

        //Save the selected option
        setSelectedOptions((currentSelections) => ({
            ...currentSelections,
            [groupKey]: option
        }));

        //Clear previous validation error
        setValidationError("");
    }


    //Increase Product quantity
    function increaseQuantity() {
        setQuantity((currentQuantity) => currentQuantity + 1);
    }


    //Decrease Product quantity
    function decreaseQuantity() {

        if (quantity > 1) {
            setQuantity((currentQuantity) => currentQuantity - 1);
        }
    }


    //Closes the mobile navigation
    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }


    //Display loading screen
    if (isLoading) {

        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">

                <div className="spinner-border" role="status">
                    <span className="visually-hidden">
                        Loading product...
                    </span>
                </div>

            </div>
        );
    }


    //Display Product loading error
    if (error || !bakery || !product) {

        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1>
                    Product unavailable
                </h1>

                <p className="text-secondary mb-0">
                    {error || "Product not found"}
                </p>

                <Link
                    to={`/store/${slug}`}
                    className="storefront-product-primary-button text-decoration-none"
                >
                    Back to Store
                </Link>

            </div>
        );
    }


    //Calculate the price added by selected options
    const customizationPrice = Object.values(selectedOptions).reduce(
        (total, option) =>
            total + Number(option?.additional_price || 0),
        0
    );


    //Calculate one configured Product price
    const configuredProductPrice =
        Number(product.base_price || 0) +
        customizationPrice;


    //Calculate total based on quantity
    const estimatedTotal =
        configuredProductPrice * quantity;


    //Calculate deposit when the Product requires one
    const depositPercentage =
        Number(product.deposit_percentage || 0);

    const depositAmount =
        depositPercentage > 0
            ? estimatedTotal * (depositPercentage / 100)
            : 0;


    //Use Product notice first and Bakery notice as a fallback
    const orderNotice =
        product.minimum_preparation_notice ||
        bakery.minimum_order_notice;


    //Checks required options before Cart
    function handleAddToCart() {

        //Find a required group without a selection
        const missingRequiredGroup = customizationDetails.find(
            (detail) =>
                detail.group?.is_required &&
                !selectedOptions[getGroupKey(detail.group)]
        );

        //Display validation message
        if (missingRequiredGroup) {

            setValidationError(
                `Please select an option for ${missingRequiredGroup.group.name}.`
            );

            return;
        }

        setValidationError("");

        //Cart functionality will be connected next
        console.log("Product ready for cart", {
            product,
            quantity,
            selectedOptions,
            specialInstructions,
            configuredProductPrice,
            estimatedTotal
        });
    }


    return (

        <div
            className="storefront-product-page min-vh-100"
            style={{
                "--storefront-primary": bakery.primary_color || "#C65F3A",
                "--storefront-secondary": bakery.secondary_color || "#F4E8DF",
                "--storefront-dark": bakery.dark_color || "#432C23"
            }}
        >

            {/* Announcement bar */}
            <div className="storefront-product-announcement">

                <div className="container-xxl text-center py-2 px-3">

                    <small>

                        {orderNotice && (
                            <>
                                Orders require at least {orderNotice} hours' notice
                            </>
                        )}

                        {orderNotice && bakery.address?.city && (
                            <> • </>
                        )}

                        {bakery.address?.city && (
                            <>
                                Pickup in {bakery.address.city}
                            </>
                        )}

                    </small>

                </div>

            </div>


            {/* Storefront Product navigation */}
            <header className="storefront-product-header">

                <div className="container-xxl px-3">

                    <div className="d-flex align-items-center justify-content-between gap-2 py-3">

                        {/* Bakery logo and name */}
                        <Link
                            to={`/store/${slug}`}
                            onClick={closeMobileMenu}
                            className="storefront-product-brand d-flex align-items-center gap-2 text-decoration-none flex-shrink-1"
                        >

                            {bakery.logo_image_url ? (

                                <img
                                    src={bakery.logo_image_url}
                                    alt={`${bakery.name} logo`}
                                    className="storefront-product-logo flex-shrink-0"
                                />

                            ) : (

                                <div className="storefront-product-logo-fallback d-flex align-items-center justify-content-center flex-shrink-0">
                                    {getBakeryInitials()}
                                </div>
                            )}

                            <span className="storefront-product-brand-name fw-semibold text-truncate">
                                {bakery.name}
                            </span>

                        </Link>


                        {/* Desktop navigation */}
                        <nav className="d-none d-lg-flex align-items-center gap-4">

                            <Link
                                to={`/store/${slug}#menu`}
                                className="storefront-product-nav-link text-decoration-none"
                            >
                                Menu
                            </Link>

                            <Link
                                to={`/store/${slug}#how-it-works`}
                                className="storefront-product-nav-link text-decoration-none"
                            >
                                How It Works
                            </Link>

                            <Link
                                to={`/store/${slug}#reviews`}
                                className="storefront-product-nav-link text-decoration-none"
                            >
                                Reviews
                            </Link>

                            <Link
                                to={`/store/${slug}#about`}
                                className="storefront-product-nav-link text-decoration-none"
                            >
                                About
                            </Link>

                        </nav>


                        {/* Desktop actions */}
                        <div className="d-none d-lg-flex align-items-center gap-3">

                            <button
                                type="button"
                                className="storefront-product-header-action d-flex align-items-center gap-1"
                            >
                                <ShoppingCart size={17} />
                                Cart (0)
                            </button>

                            <button
                                type="button"
                                className="storefront-product-header-action"
                            >
                                Sign In
                            </button>

                        </div>


                        {/* Mobile actions */}
                        <div className="d-flex d-lg-none align-items-center gap-2">

                            <button
                                type="button"
                                aria-label="Open cart"
                                className="storefront-product-header-action d-flex align-items-center gap-1"
                            >
                                <ShoppingCart size={19} />
                                <span className="small">(0)</span>
                            </button>

                            <button
                                type="button"
                                aria-expanded={isMobileMenuOpen}
                                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                                onClick={() =>
                                    setIsMobileMenuOpen(
                                        (currentValue) => !currentValue
                                    )
                                }
                                className="storefront-product-menu-button d-flex align-items-center justify-content-center"
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

                        <div className="d-lg-none pb-3">

                            <div className="storefront-product-mobile-menu p-3">

                                <nav className="d-grid gap-1">

                                    <Link
                                        to={`/store/${slug}#menu`}
                                        onClick={closeMobileMenu}
                                        className="storefront-product-mobile-link text-decoration-none px-3 py-2"
                                    >
                                        Menu
                                    </Link>

                                    <Link
                                        to={`/store/${slug}#how-it-works`}
                                        onClick={closeMobileMenu}
                                        className="storefront-product-mobile-link text-decoration-none px-3 py-2"
                                    >
                                        How It Works
                                    </Link>

                                    <Link
                                        to={`/store/${slug}#reviews`}
                                        onClick={closeMobileMenu}
                                        className="storefront-product-mobile-link text-decoration-none px-3 py-2"
                                    >
                                        Reviews
                                    </Link>

                                    <Link
                                        to={`/store/${slug}#about`}
                                        onClick={closeMobileMenu}
                                        className="storefront-product-mobile-link text-decoration-none px-3 py-2"
                                    >
                                        About
                                    </Link>

                                </nav>


                                <hr className="my-3" />


                                <button
                                    type="button"
                                    className="storefront-product-mobile-signin w-100 py-2"
                                >
                                    Sign In
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </header>


            <main className="container-xxl px-3 py-4 py-lg-5">

                {/* Product breadcrumb */}
                <div className="d-flex flex-wrap align-items-center gap-2 mb-4 storefront-product-breadcrumb">

                    <Link
                        to={`/store/${slug}`}
                        className="text-decoration-none"
                    >
                        Home
                    </Link>

                    <span>/</span>

                    <Link
                        to={`/store/${slug}#menu`}
                        className="text-decoration-none"
                    >
                        {product.category}
                    </Link>

                    <span>/</span>

                    <span>
                        {product.name}
                    </span>

                </div>


                <div className="row g-4 g-lg-5 align-items-start">

                    {/* Product media */}
                    <div className="col-12 col-lg-6">

                        {/* Main Product image */}
                        {product.image_url ? (

                            <div className="ratio ratio-1x1">

                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="storefront-product-main-image w-100 h-100"
                                />

                            </div>

                        ) : (

                            <div className="storefront-product-image-placeholder ratio ratio-1x1">

                                <div className="d-flex align-items-center justify-content-center text-center p-4">
                                    Product image coming soon
                                </div>

                            </div>
                        )}


                        {/* Product thumbnail */}
                        {product.image_url && (

                            <div className="d-flex gap-2 mt-3">

                                <button
                                    type="button"
                                    className="storefront-product-thumbnail active p-0"
                                >
                                    <img
                                        src={product.image_url}
                                        alt={`${product.name} thumbnail`}
                                        className="w-100 h-100"
                                    />
                                </button>

                            </div>
                        )}

                    </div>


                    {/* Product information and customization */}
                    <div className="col-12 col-lg-6">

                        {/* Product category */}
                        <p className="storefront-product-category-label mb-2">
                            {product.category}
                        </p>


                        {/* Product name */}
                        <h1 className="storefront-product-page-title mb-3">
                            {product.name}
                        </h1>


                        {/* Reviews placeholder */}
                        <div className="d-flex align-items-center gap-2 mb-3 storefront-product-review-placeholder">

                            <Star size={16} />

                            <span>
                                No reviews yet
                            </span>

                        </div>


                        {/* Product description */}
                        <p className="storefront-product-page-description mb-4">
                            {product.description}
                        </p>


                        {/* Product notice */}
                        {orderNotice && (

                            <div className="storefront-product-notice d-flex align-items-start gap-2 p-3 mb-4">

                                <Clock3 size={18} className="flex-shrink-0 mt-1" />

                                <div>
                                    <strong>
                                        Made to order
                                    </strong>

                                    <div>
                                        Please order at least{" "}
                                        {orderNotice} hours before pickup.
                                    </div>
                                </div>

                            </div>
                        )}


                        {/* Starting price */}
                        <div className="mb-4">

                            <p className="text-secondary small mb-1">
                                Starting at
                            </p>

                            <h2 className="storefront-product-page-price mb-0">
                                {formatPrice(product.base_price)}
                            </h2>

                        </div>


                        {/* Real Product customization groups */}
                        {customizationDetails.length > 0 && (

                            <div className="d-flex flex-column gap-4 mb-4">

                                {customizationDetails.map((detail) => {

                                    const groupKey =
                                        getGroupKey(detail.group);

                                    const selectedOption =
                                        selectedOptions[groupKey];

                                    return (

                                        <section
                                            key={groupKey}
                                            className="storefront-customization-group"
                                        >

                                            {/* Customization heading */}
                                            <div className="d-flex align-items-center justify-content-between gap-3 mb-2">

                                                <h3 className="storefront-customization-title mb-0">
                                                    {detail.group?.name}
                                                </h3>


                                                <span
                                                    className={
                                                        detail.group?.is_required
                                                            ? "storefront-required-label"
                                                            : "storefront-optional-label"
                                                    }
                                                >
                                                    {detail.group?.is_required
                                                        ? "Required"
                                                        : "Optional"}
                                                </span>

                                            </div>


                                            {/* Customization options */}
                                            <div className="d-grid gap-2">

                                                {detail.options?.map((option) => {

                                                    const isSelected =
                                                        selectedOption &&
                                                        getOptionKey(selectedOption) ===
                                                        getOptionKey(option);

                                                    return (

                                                        <button
                                                            key={getOptionKey(option)}
                                                            type="button"
                                                            onClick={() =>
                                                                selectOption(
                                                                    detail,
                                                                    option
                                                                )
                                                            }
                                                            className={
                                                                isSelected
                                                                    ? "storefront-option-card selected d-flex align-items-center justify-content-between gap-3 text-start p-3"
                                                                    : "storefront-option-card d-flex align-items-center justify-content-between gap-3 text-start p-3"
                                                            }
                                                        >

                                                            <div className="d-flex align-items-center gap-3">

                                                                {/* Custom radio indicator */}
                                                                <span
                                                                    className={
                                                                        isSelected
                                                                            ? "storefront-option-radio selected d-flex align-items-center justify-content-center flex-shrink-0"
                                                                            : "storefront-option-radio d-flex align-items-center justify-content-center flex-shrink-0"
                                                                    }
                                                                >
                                                                    {isSelected && (
                                                                        <span />
                                                                    )}
                                                                </span>


                                                                <span className="fw-medium">
                                                                    {option.name}
                                                                </span>

                                                            </div>


                                                            {/* Option additional price */}
                                                            {Number(option.additional_price || 0) > 0 && (

                                                                <span className="storefront-option-price flex-shrink-0">
                                                                    +{formatPrice(option.additional_price)}
                                                                </span>
                                                            )}

                                                        </button>
                                                    );
                                                })}

                                            </div>

                                        </section>
                                    );
                                })}

                            </div>
                        )}


                        {/* No Product customization */}
                        {customizationDetails.length === 0 && (

                            <div className="storefront-simple-product-message p-3 mb-4">
                                No customization is required for this item.
                            </div>
                        )}


                        {/* Special instructions */}
                        <div className="mb-4">

                            <label
                                htmlFor="specialInstructions"
                                className="storefront-customization-title d-block mb-2"
                            >
                                Special instructions
                                <span className="storefront-optional-label ms-2">
                                    Optional
                                </span>
                            </label>


                            <textarea
                                id="specialInstructions"
                                value={specialInstructions}
                                onChange={(event) =>
                                    setSpecialInstructions(
                                        event.target.value
                                    )
                                }
                                maxLength={300}
                                rows="3"
                                placeholder="Add a message, colour preference, allergy note or other request..."
                                className="storefront-product-textarea form-control"
                            />


                            <small className="text-secondary">
                                {specialInstructions.length}/300
                            </small>

                        </div>


                        {/* Quantity */}
                        <div className="mb-4">

                            <label className="storefront-customization-title d-block mb-2">
                                Quantity
                            </label>


                            <div className="d-inline-flex align-items-center gap-3">

                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={decreaseQuantity}
                                    className="storefront-quantity-button d-flex align-items-center justify-content-center"
                                >
                                    <Minus size={16} />
                                </button>


                                <span className="storefront-product-quantity fw-semibold text-center">
                                    {quantity}
                                </span>


                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={increaseQuantity}
                                    className="storefront-quantity-button d-flex align-items-center justify-content-center"
                                >
                                    <Plus size={16} />
                                </button>

                            </div>

                        </div>


                        {/* Validation message */}
                        {validationError && (

                            <div className="alert alert-danger py-2 mb-3">
                                {validationError}
                            </div>
                        )}


                        {/* Price summary */}
                        <div className="storefront-product-summary p-4">

                            <div className="d-flex justify-content-between gap-3 mb-2">

                                <span>
                                    Base price
                                </span>

                                <strong>
                                    {formatPrice(product.base_price)}
                                </strong>

                            </div>


                            {/* Selected customization prices */}
                            {customizationDetails.map((detail) => {

                                const selectedOption =
                                    selectedOptions[
                                    getGroupKey(detail.group)
                                    ];

                                if (
                                    !selectedOption ||
                                    Number(
                                        selectedOption.additional_price || 0
                                    ) <= 0
                                ) {
                                    return null;
                                }

                                return (

                                    <div
                                        key={getGroupKey(detail.group)}
                                        className="d-flex justify-content-between gap-3 mb-2 storefront-product-summary-option"
                                    >

                                        <span>
                                            {detail.group.name}:{" "}
                                            {selectedOption.name}
                                        </span>

                                        <span>
                                            +{formatPrice(
                                                selectedOption.additional_price
                                            )}
                                        </span>

                                    </div>
                                );
                            })}


                            {customizationPrice > 0 && (

                                <div className="d-flex justify-content-between gap-3 mb-2">

                                    <span>
                                        Customizations
                                    </span>

                                    <span>
                                        +{formatPrice(customizationPrice)}
                                    </span>

                                </div>
                            )}


                            {quantity > 1 && (

                                <div className="d-flex justify-content-between gap-3 mb-2">

                                    <span>
                                        Quantity
                                    </span>

                                    <span>
                                        × {quantity}
                                    </span>

                                </div>
                            )}


                            <hr />


                            {/* Estimated total */}
                            <div className="d-flex justify-content-between align-items-end gap-3">

                                <div>
                                    <strong className="d-block">
                                        Estimated total
                                    </strong>

                                    <small className="text-secondary">
                                        Before tax
                                    </small>
                                </div>

                                <strong className="storefront-product-total">
                                    {formatPrice(estimatedTotal)}
                                </strong>

                            </div>


                            {/* Deposit */}
                            {depositPercentage > 0 && (

                                <div className="storefront-product-deposit d-flex justify-content-between gap-3 mt-3 p-3">

                                    <span>
                                        {depositPercentage}% deposit
                                    </span>

                                    <strong>
                                        {formatPrice(depositAmount)}
                                    </strong>

                                </div>
                            )}


                            {/* Add to Cart */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="storefront-product-primary-button w-100 d-flex align-items-center justify-content-center gap-2 mt-4"
                            >
                                <ShoppingCart size={18} />

                                Add to Cart ·{" "}
                                {formatPrice(estimatedTotal)}
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}