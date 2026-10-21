import API_URL from "../../config/api.js";

//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useParams
} from "react-router-dom";

//Import Product icons
import {
    Clock3,
    Minus,
    Plus,
    ShoppingCart
} from "lucide-react";

//Import Product page styles
import "./StorefrontProduct.css";

//Import Customer Cart hook
import {
    useCart
} from "../../context/useCart";

//Import shared Storefront components
import StorefrontNavbar
    from "../../components/storefront/StorefrontNavbar";

import StorefrontFooter
    from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import {
    getStorefrontTheme
} from "../../utils/storefrontTheme";


//Displays a Product from a public Bakery Storefront
export default function StorefrontProduct() {

    //Get Bakery slug and Product ID from the URL
    const {
        slug,
        productId
    } = useParams();


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);


    //Stores Product information
    const [
        product,
        setProduct
    ] = useState(null);


    //Stores Product customization Groups and Options
    const [
        customizationDetails,
        setCustomizationDetails
    ] = useState([]);


    //Stores selected customization Options
    const [
        selectedOptions,
        setSelectedOptions
    ] = useState({});


    //Stores the trusted backend-calculated Product quote
    const [
        quote,
        setQuote
    ] = useState(null);


    //Tracks whether the backend quote is loading
    const [
        isQuoteLoading,
        setIsQuoteLoading
    ] = useState(false);


    //Stores backend quote errors
    const [
        quoteError,
        setQuoteError
    ] = useState("");


    //Stores Customer special instructions
    const [
        specialInstructions,
        setSpecialInstructions
    ] = useState("");


    //Tracks Product quantity
    const [
        quantity,
        setQuantity
    ] = useState(1);


    //Stores Product validation errors
    const [
        validationError,
        setValidationError
    ] = useState("");


    //Tracks page loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    //Stores loading errors
    const [
        error,
        setError
    ] = useState("");


    //Tracks successful Add to Cart feedback
    const [
        isAddedToCart,
        setIsAddedToCart
    ] = useState(false);


    //Tracks whether View Cart should be shown
    const [
        showViewCart,
        setShowViewCart
    ] = useState(false);


    //Get Customer Cart functions
    const {
        addToCart
    } = useCart();


    //Loads the Bakery and selected Product
    useEffect(() => {

        async function fetchProduct() {

            setIsLoading(
                true
            );

            setError(
                ""
            );


            //Reset Cart feedback when opening another Product
            setIsAddedToCart(
                false
            );

            setShowViewCart(
                false
            );


            try {

                //Load Bakery and Product information together
                const [
                    bakeryResponse,
                    productResponse
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/api/bakeries/public/${slug}`
                    ),

                    fetch(
                        `${API_URL}/api/bakeries/public/${slug}/products/${productId}`
                    )
                ]);


                //Convert responses into JavaScript data
                const bakeryData =
                    await bakeryResponse.json();

                const productData =
                    await productResponse.json();


                //Stop if the Bakery could not be loaded
                if (
                    !bakeryResponse.ok
                ) {

                    throw new Error(
                        bakeryData.message ||
                        "Unable to load bakery"
                    );
                }


                //Stop if the Product could not be loaded
                if (
                    !productResponse.ok
                ) {

                    throw new Error(
                        productData.message ||
                        "Unable to load product"
                    );
                }


                //Get Product customization information
                const details =
                    productData.customizationDetails ||
                    [];


                //Stores default required selections
                const defaultSelections =
                    {};


                //Select the first Option for each required Group
                details.forEach(
                    (detail) => {

                        if (
                            detail.group?.is_required &&
                            detail.options?.length > 0
                        ) {

                            const groupKey =
                                detail.group._id ||
                                detail.group.name;


                            defaultSelections[
                                groupKey
                            ] =
                                detail.options[0];
                        }
                    }
                );


                //Save Bakery information
                setBakery(
                    bakeryData.bakery
                );


                //Save Product information
                setProduct(
                    productData.product ||
                    productData
                );


                //Save customization information
                setCustomizationDetails(
                    details
                );


                //Save default required Options
                setSelectedOptions(
                    defaultSelections
                );


            } catch (error) {

                //Display loading error
                setError(
                    error.message
                );


            } finally {

                //Stop page loading
                setIsLoading(
                    false
                );
            }
        }


        fetchProduct();


    }, [
        slug,
        productId
    ]);


    //Gets a trusted Product quote whenever selections or quantity change
    useEffect(() => {

        //Wait until the Product has loaded
        if (
            !product
        ) {

            return;
        }


        //Check if any required Group does not have a selection
        const missingRequiredGroup =
            customizationDetails.find(
                (detail) => {

                    const groupKey =
                        detail.group?._id ||
                        detail.group?.name;


                    return (
                        detail.group?.is_required &&
                        !selectedOptions[
                        groupKey
                        ]
                    );
                }
            );


        //Do not request a quote until required Options are selected
        if (
            missingRequiredGroup
        ) {

            return;
        }


        //Create a controller so outdated quote requests can be cancelled
        const controller =
            new AbortController();


        //Wait briefly before requesting a new quote
        const quoteTimer =
            setTimeout(

                async () => {

                    setIsQuoteLoading(
                        true
                    );

                    setQuoteError(
                        ""
                    );


                    try {

                        //Get only the selected Option IDs
                        const customizationOptionIds =
                            Object.values(
                                selectedOptions
                            )
                                .map(
                                    (option) =>
                                        option?._id
                                )
                                .filter(
                                    Boolean
                                );


                        //Request trusted pricing from the backend
                        const quoteResponse =
                            await fetch(

                                `${API_URL}/api/bakeries/public/${slug}/products/${productId}/quote`,

                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({

                                            //Send quantity but never calculate its price here
                                            quantity:
                                                quantity,

                                            //Send only selected Option IDs
                                            customization_option_ids:
                                                customizationOptionIds
                                        }),

                                    signal:
                                        controller.signal
                                }
                            );


                        //Convert the backend response into JavaScript data
                        const quoteData =
                            await quoteResponse.json();


                        //Stop if the backend could not create the quote
                        if (
                            !quoteResponse.ok
                        ) {

                            const errorMessage =
                                quoteData.message ||
                                quoteData.errors?.[0]?.msg ||
                                "Unable to calculate product price";


                            throw new Error(
                                errorMessage
                            );
                        }


                        //Save the trusted backend-calculated quote
                        setQuote(
                            quoteData.quote
                        );


                    } catch (error) {

                        //Ignore cancelled quote requests
                        if (
                            error.name ===
                            "AbortError"
                        ) {

                            return;
                        }


                        //Remove the old quote when pricing fails
                        setQuote(
                            null
                        );


                        //Display the backend pricing error
                        setQuoteError(
                            error.message
                        );


                    } finally {

                        //Only stop loading when this request was not cancelled
                        if (
                            !controller.signal.aborted
                        ) {

                            setIsQuoteLoading(
                                false
                            );
                        }
                    }
                },

                250
            );


        //Cancel old quote requests when selections change quickly
        return () => {

            clearTimeout(
                quoteTimer
            );

            controller.abort();
        };


    }, [
        slug,
        productId,
        product,
        customizationDetails,
        selectedOptions,
        quantity
    ]);


    //Returns a unique key for a customization Group
    function getGroupKey(
        group
    ) {

        return (
            group?._id ||
            group?.name
        );
    }


    //Returns a unique key for a customization Option
    function getOptionKey(
        option
    ) {

        return (
            option?._id ||
            option?.name
        );
    }


    //Formats backend price values for display
    function formatPrice(
        price
    ) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style:
                    "currency",

                currency:
                    bakery?.currency ||
                    "CAD"
            }
        ).format(
            Number(
                price
            ) ||
            0
        );
    }


    //Selects a Product customization Option
    function selectOption(
        detail,
        option
    ) {

        const groupKey =
            getGroupKey(
                detail.group
            );


        const currentOption =
            selectedOptions[
            groupKey
            ];


        //Allow an optional Option to be removed
        if (
            !detail.group?.is_required &&
            currentOption &&
            getOptionKey(
                currentOption
            ) ===
            getOptionKey(
                option
            )
        ) {

            setSelectedOptions(
                (currentSelections) => {

                    const updatedSelections = {
                        ...currentSelections
                    };


                    delete updatedSelections[
                        groupKey
                    ];


                    return updatedSelections;
                }
            );


            setValidationError(
                ""
            );


            return;
        }


        //Save the selected Option
        setSelectedOptions(
            (currentSelections) => ({

                ...currentSelections,

                [groupKey]:
                    option
            })
        );


        //Clear previous validation error
        setValidationError(
            ""
        );
    }


    //Increase Product quantity
    function increaseQuantity() {

        setQuantity(
            (currentQuantity) =>
                currentQuantity + 1
        );
    }


    //Decrease Product quantity
    function decreaseQuantity() {

        if (
            quantity > 1
        ) {

            setQuantity(
                (currentQuantity) =>
                    currentQuantity - 1
            );
        }
    }


    //Validates the configured Product before adding it to Cart
    function handleAddToCart() {

        //Find a required Group without a selection
        const missingRequiredGroup =
            customizationDetails.find(
                (detail) => {

                    const groupKey =
                        getGroupKey(
                            detail.group
                        );


                    return (
                        detail.group?.is_required &&
                        !selectedOptions[
                        groupKey
                        ]
                    );
                }
            );


        //Stop if a required Option is missing
        if (
            missingRequiredGroup
        ) {

            setValidationError(
                `Please select an option for ${missingRequiredGroup.group.name}.`
            );


            return;
        }


        //Do not continue without a trusted backend quote
        if (
            !quote
        ) {

            setValidationError(
                "Please wait for the price to update."
            );


            return;
        }


        //Clear previous validation errors
        setValidationError(
            ""
        );


        //Add the configured Product to the Customer Cart
        addToCart({

            //Store the Bakery information
            bakery_id:
                bakery._id,

            bakery_slug:
                slug,

            bakery_name:
                bakery.name,


            //Store the Product information
            product_id:
                product._id,

            product_name:
                product.name,

            product_image_url:
                product.image_url,


            //Store the selected quantity
            quantity:
                quantity,


            //Store only the selected customization Option IDs
            customization_option_ids:
                Object.values(
                    selectedOptions
                )
                    .map(
                        (option) =>
                            option?._id
                    )
                    .filter(
                        Boolean
                    ),


            //Store customization information for Cart display
            customizations:
                quote.customizations,


            //Store Customer instructions
            special_instructions:
                specialInstructions,


            //Store the backend quote for display
            quote:
                quote
        });


        //Show Customer that Product was added
        setIsAddedToCart(
            true
        );


        //Show View Cart after Product is added
        setShowViewCart(
            true
        );


        //Remove success message after a short delay
        setTimeout(
            () => {

                setIsAddedToCart(
                    false
                );

            },
            1800
        );
    }


    //Display loading screen
    if (
        isLoading
    ) {

        return (

            <div className="min-vh-100 d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading product...
                    </span>

                </div>

            </div>
        );
    }


    //Display Product loading error
    if (
        error ||
        !bakery ||
        !product
    ) {

        return (

            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1>
                    Product unavailable
                </h1>


                <p className="text-secondary mb-0">

                    {
                        error ||
                        "Product not found"
                    }

                </p>


                <Link
                    to={`/${slug}`}
                    className="storefront-product-primary-button text-decoration-none"
                >
                    Back to Store
                </Link>

            </div>
        );
    }


    //Use Product notice or Bakery notice
    const orderNotice =
        product.minimum_preparation_notice ||
        bakery.minimum_order_notice;


    return (

        //Theme comes from the Bakery Owner and applies to the whole Product page
        <div
            className="storefront-product-page min-vh-100"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar
                bakery={
                    bakery
                }
                orderNotice={
                    orderNotice
                }
            />


            <main className="container-xxl px-3 py-4 py-lg-5">

                {/* Product breadcrumb */}
                <div className="d-flex flex-wrap align-items-center gap-2 mb-4 storefront-product-breadcrumb">

                    <Link
                        to={`/${slug}`}
                        className="text-decoration-none"
                    >
                        Home
                    </Link>


                    <span>
                        /
                    </span>


                    <Link
                        to={`/${slug}#menu`}
                        className="text-decoration-none"
                    >
                        {
                            product.category
                        }
                    </Link>


                    <span>
                        /
                    </span>


                    <span>
                        {
                            product.name
                        }
                    </span>

                </div>


                <div className="row g-4 g-lg-5 align-items-start">

                    {/* Product media */}
                    <div className="col-12 col-lg-6">

                        {/* Main Product image */}
                        {
                            product.image_url
                                ? (

                                    <div className="ratio ratio-1x1">

                                        <img
                                            src={
                                                product.image_url
                                            }
                                            alt={
                                                product.name
                                            }
                                            className="storefront-product-main-image w-100 h-100"
                                        />

                                    </div>
                                )
                                : (

                                    <div className="storefront-product-image-placeholder ratio ratio-1x1">

                                        <div className="d-flex align-items-center justify-content-center text-center p-4">
                                            Product image coming soon
                                        </div>

                                    </div>
                                )
                        }


                        {/* Product thumbnail */}
                        {
                            product.image_url &&
                            (

                                <div className="d-flex gap-2 mt-3">

                                    <button
                                        type="button"
                                        className="storefront-product-thumbnail active p-0"
                                    >

                                        <img
                                            src={
                                                product.image_url
                                            }
                                            alt={
                                                `${product.name} thumbnail`
                                            }
                                            className="w-100 h-100"
                                        />

                                    </button>

                                </div>
                            )
                        }

                    </div>


                    {/* Product information */}
                    <div className="col-12 col-lg-6">

                        {/* Product category */}
                        <p className="storefront-product-category-label mb-2">

                            {
                                product.category
                            }

                        </p>


                        {/* Product name */}
                        <h1 className="storefront-product-page-title mb-3">

                            {
                                product.name
                            }

                        </h1>


                        {/* Product description */}
                        <p className="storefront-product-page-description mb-4">

                            {
                                product.description
                            }

                        </p>


                        {/* Product notice */}
                        {
                            orderNotice &&
                            (

                                <div className="storefront-product-notice d-flex align-items-start gap-2 p-3 mb-4">

                                    <Clock3
                                        size={18}
                                        className="flex-shrink-0 mt-1"
                                    />


                                    <div>

                                        <strong>
                                            Made to order
                                        </strong>


                                        <div>

                                            Please order at least{" "}

                                            {
                                                orderNotice
                                            }{" "}

                                            hours before pickup.

                                        </div>

                                    </div>

                                </div>
                            )
                        }


                        {/* Starting price */}
                        <div className="mb-4">

                            <p className="text-secondary small mb-1">
                                Starting at
                            </p>


                            <h2 className="storefront-product-page-price mb-0">

                                {
                                    formatPrice(
                                        quote?.base_price ??
                                        product.base_price
                                    )
                                }

                            </h2>

                        </div>


                        {/* Product customization Groups */}
                        {
                            customizationDetails.length > 0 &&
                            (

                                <div className="d-flex flex-column gap-4 mb-4">

                                    {
                                        customizationDetails.map(
                                            (detail) => {

                                                const groupKey =
                                                    getGroupKey(
                                                        detail.group
                                                    );


                                                const selectedOption =
                                                    selectedOptions[
                                                    groupKey
                                                    ];


                                                return (

                                                    <section
                                                        key={
                                                            groupKey
                                                        }
                                                        className="storefront-customization-group"
                                                    >

                                                        {/* Customization heading */}
                                                        <div className="d-flex align-items-center justify-content-between gap-3 mb-2">

                                                            <h3 className="storefront-customization-title mb-0">

                                                                {
                                                                    detail.group
                                                                        ?.name
                                                                }

                                                            </h3>


                                                            <span
                                                                className={
                                                                    detail.group
                                                                        ?.is_required
                                                                        ? "storefront-required-label"
                                                                        : "storefront-optional-label"
                                                                }
                                                            >

                                                                {
                                                                    detail.group
                                                                        ?.is_required
                                                                        ? "Required"
                                                                        : "Optional"
                                                                }

                                                            </span>

                                                        </div>


                                                        {/* Customization Options */}
                                                        <div className="d-grid gap-2">

                                                            {
                                                                detail.options?.map(
                                                                    (option) => {

                                                                        const isSelected =
                                                                            selectedOption &&
                                                                            getOptionKey(
                                                                                selectedOption
                                                                            ) ===
                                                                            getOptionKey(
                                                                                option
                                                                            );


                                                                        return (

                                                                            <button
                                                                                key={
                                                                                    getOptionKey(
                                                                                        option
                                                                                    )
                                                                                }
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

                                                                                    {/* Radio indicator */}
                                                                                    <span
                                                                                        className={
                                                                                            isSelected
                                                                                                ? "storefront-option-radio selected d-flex align-items-center justify-content-center flex-shrink-0"
                                                                                                : "storefront-option-radio d-flex align-items-center justify-content-center flex-shrink-0"
                                                                                        }
                                                                                    >

                                                                                        {
                                                                                            isSelected &&
                                                                                            (
                                                                                                <span />
                                                                                            )
                                                                                        }

                                                                                    </span>


                                                                                    <span className="fw-medium">

                                                                                        {
                                                                                            option.name
                                                                                        }

                                                                                    </span>

                                                                                </div>


                                                                                {/* Backend Option price shown for selection */}
                                                                                {
                                                                                    Number(
                                                                                        option.additional_price ||
                                                                                        0
                                                                                    ) > 0 &&
                                                                                    (

                                                                                        <span className="storefront-option-price flex-shrink-0">

                                                                                            +

                                                                                            {
                                                                                                formatPrice(
                                                                                                    option.additional_price
                                                                                                )
                                                                                            }

                                                                                        </span>
                                                                                    )
                                                                                }

                                                                            </button>
                                                                        );
                                                                    }
                                                                )
                                                            }

                                                        </div>

                                                    </section>
                                                );
                                            }
                                        )
                                    }

                                </div>
                            )
                        }


                        {/* Product without customization */}
                        {
                            customizationDetails.length === 0 &&
                            (

                                <div className="storefront-simple-product-message p-3 mb-4">
                                    No customization is required for this item.
                                </div>
                            )
                        }


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
                                value={
                                    specialInstructions
                                }
                                onChange={
                                    (event) =>
                                        setSpecialInstructions(
                                            event.target.value
                                        )
                                }
                                maxLength={300}
                                rows="3"
                                placeholder="Add a message, color preference, allergy note or other request..."
                                className="storefront-product-textarea form-control"
                            />


                            <small className="text-secondary">

                                {
                                    specialInstructions.length
                                }

                                /300

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
                                    onClick={
                                        decreaseQuantity
                                    }
                                    className="storefront-quantity-button d-flex align-items-center justify-content-center"
                                >

                                    <Minus
                                        size={16}
                                    />

                                </button>


                                <span className="storefront-product-quantity fw-semibold text-center">

                                    {
                                        quantity
                                    }

                                </span>


                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={
                                        increaseQuantity
                                    }
                                    className="storefront-quantity-button d-flex align-items-center justify-content-center"
                                >

                                    <Plus
                                        size={16}
                                    />

                                </button>

                            </div>

                        </div>


                        {/* Quote loading */}
                        {
                            isQuoteLoading &&
                            (

                                <div className="d-flex align-items-center gap-2 text-secondary small mb-3">

                                    <div
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                    >

                                        <span className="visually-hidden">
                                            Updating price...
                                        </span>

                                    </div>


                                    Updating price...

                                </div>
                            )
                        }


                        {/* Backend quote error */}
                        {
                            quoteError &&
                            (

                                <div className="alert alert-danger py-2 mb-3">

                                    {
                                        quoteError
                                    }

                                </div>
                            )
                        }


                        {/* Product validation error */}
                        {
                            validationError &&
                            (

                                <div className="alert alert-danger py-2 mb-3">

                                    {
                                        validationError
                                    }

                                </div>
                            )
                        }


                        {/* Trusted backend Price breakdown */}
                        <div className="storefront-product-summary p-4">

                            <h3 className="storefront-product-summary-title mb-3">
                                Price breakdown
                            </h3>


                            {/* Trusted base price */}
                            <div className="d-flex justify-content-between gap-3 mb-2">

                                <span>
                                    Base price
                                </span>


                                <strong>

                                    {
                                        quote
                                            ? formatPrice(
                                                quote.base_price
                                            )
                                            : "—"
                                    }

                                </strong>

                            </div>


                            {/* Trusted customization charges */}
                            {
                                quote?.customizations
                                    ?.filter(
                                        (customization) =>
                                            Number(
                                                customization.additional_price ||
                                                0
                                            ) > 0
                                    )
                                    .map(
                                        (customization) => (

                                            <div
                                                key={
                                                    customization.option_id
                                                }
                                                className="d-flex justify-content-between gap-3 mb-2 storefront-product-summary-option"
                                            >

                                                <span>

                                                    {
                                                        customization.group_name
                                                    }

                                                    :{" "}

                                                    {
                                                        customization.option_name
                                                    }

                                                </span>


                                                <span>

                                                    +

                                                    {
                                                        formatPrice(
                                                            customization.additional_price
                                                        )
                                                    }

                                                </span>

                                            </div>
                                        )
                                    )
                            }


                            {/* Quantity */}
                            {
                                quote &&
                                quote.quantity > 1 &&
                                (

                                    <div className="d-flex justify-content-between gap-3 mb-2">

                                        <span>
                                            Quantity
                                        </span>


                                        <span>
                                            × {quote.quantity}
                                        </span>

                                    </div>
                                )
                            }


                            <hr className="my-3" />


                            {/* Trusted estimated total */}
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

                                    {
                                        quote
                                            ? formatPrice(
                                                quote.item_total
                                            )
                                            : "—"
                                    }

                                </strong>

                            </div>


                            {/* Trusted deposit */}
                            {
                                quote?.payment_rule ===
                                "deposit" &&
                                quote.deposit_percentage >
                                0 &&
                                (

                                    <div className="storefront-product-deposit d-flex justify-content-between gap-3 mt-3 p-3">

                                        <span>

                                            Deposit due at checkout{" "}

                                            (
                                            {
                                                quote.deposit_percentage
                                            }
                                            %)

                                        </span>


                                        <strong>

                                            {
                                                formatPrice(
                                                    quote.amount_due_now
                                                )
                                            }

                                        </strong>

                                    </div>
                                )
                            }


                            {/* Product actions */}
                            <div className="d-flex flex-column flex-sm-row gap-2 mt-4">

                                {/* Add to Cart */}
                                <button
                                    type="button"
                                    onClick={
                                        handleAddToCart
                                    }
                                    disabled={
                                        isQuoteLoading ||
                                        !quote
                                    }
                                    className="storefront-product-primary-button flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                >

                                    <ShoppingCart
                                        size={18}
                                    />


                                    {
                                        isQuoteLoading
                                            ? "Updating price..."
                                            : quote
                                                ? `Add to Cart · ${formatPrice(
                                                    quote.item_total
                                                )}`
                                                : "Add to Cart"
                                    }

                                </button>


                                {/* Open Cart after Product is added */}
                                {
                                    showViewCart &&
                                    (

                                        <Link
                                            to={`/${slug}/cart`}
                                            className="storefront-product-view-cart-button d-flex align-items-center justify-content-center text-decoration-none"
                                        >
                                            View Cart
                                        </Link>
                                    )
                                }

                            </div>


                            {/* Add to Cart success message */}
                            {
                                isAddedToCart &&
                                (

                                    <div
                                        className="alert alert-success py-2 mt-3 mb-0"
                                        role="alert"
                                    >

                                        ✓ {product.name} was added to your cart.

                                    </div>
                                )
                            }

                        </div>

                    </div>

                </div>

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter
                bakery={
                    bakery
                }
            />

        </div>
    );
}