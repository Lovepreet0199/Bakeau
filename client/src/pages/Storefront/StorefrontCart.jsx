import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useMemo,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useParams,
    useNavigate
} from "react-router-dom";

//Import Cart icons
import {
    Minus,
    Plus,
    ShoppingCart,
    X
} from "lucide-react";

//Import Customer Cart hook
import { useCart } from "../../context/useCart";

//Import Cart styles
import "./StorefrontCart.css";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Displays the Customer shopping Cart
export default function StorefrontCart() {

    //Get the Bakery slug from the URL
    const { slug } = useParams();

    //Used to navigate Customer to login or Checkout
    const navigate = useNavigate();

    //Stores public Bakery information
    const [bakery, setBakery] = useState(null);

    //Tracks Bakery loading
    const [
        isBakeryLoading,
        setIsBakeryLoading
    ] = useState(true);

    //Stores Bakery loading error
    const [
        bakeryError,
        setBakeryError
    ] = useState("");

    //Get Customer Cart information and functions
    const {
        cartItems,
        cartNote,
        setCartNote,
        removeFromCart,
        updateCartItem
    } = useCart();

    //Tracks which Cart item is updating
    const [
        updatingItemId,
        setUpdatingItemId
    ] = useState(null);

    //Stores individual Product update errors
    const [
        cartError,
        setCartError
    ] = useState("");

    //Stores trusted whole-Cart pricing
    const [
        cartQuote,
        setCartQuote
    ] = useState(null);

    //Tracks Cart quote loading
    const [
        isCartQuoteLoading,
        setIsCartQuoteLoading
    ] = useState(false);

    //Stores Cart quote errors
    const [
        cartQuoteError,
        setCartQuoteError
    ] = useState("");

    //Tracks Bakery note visibility
    const [
        isNoteOpen,
        setIsNoteOpen
    ] = useState(false);


    //Only use Cart items for the current Bakery
    const bakeryCartItems = useMemo(() => {

        return cartItems.filter(
            (item) =>
                item.bakery_slug === slug
        );

    }, [
        cartItems,
        slug
    ]);


    //Counts Cart quantity for the current Bakery
    const bakeryCartCount =
        bakeryCartItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    //Use loaded Bakery name with Cart fallback
    const bakeryName =
        bakery?.name ||
        bakeryCartItems[0]?.bakery_name ||
        "Bakery";


    //Load public Bakery information
    useEffect(() => {

        async function fetchBakery() {

            try {

                //Request Bakery using the Storefront slug
                const response =
                    await fetch(
                        `${API_URL}/api/bakeries/public/${slug}`
                    );

                //Convert response into JavaScript data
                const data =
                    await response.json();

                //Stop when Bakery could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load bakery"
                    );
                }

                //Store Bakery information
                setBakery(
                    data.bakery
                );

            } catch (error) {

                //Store loading error
                setBakeryError(
                    error.message
                );

            } finally {

                //Stop loading
                setIsBakeryLoading(
                    false
                );
            }
        }

        fetchBakery();

    }, [slug]);


    //Formats Product prices
    function formatPrice(price) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style:
                    "currency",

                currency:
                    cartQuote?.currency ||
                    bakery?.currency ||
                    "CAD"
            }
        ).format(
            Number(price) ||
            0
        );
    }


    //Gets trusted pricing for the whole Cart
    useEffect(() => {

        //Do not request pricing for an empty Cart
        if (
            bakeryCartItems.length ===
            0
        ) {
            return;
        }

        //Allows old requests to be cancelled
        const controller =
            new AbortController();

        //Wait briefly before requesting pricing
        const quoteTimer =
            setTimeout(
                async () => {

                    setIsCartQuoteLoading(
                        true
                    );

                    setCartQuoteError("");

                    try {

                        //Create Cart payload for backend
                        const items =
                            bakeryCartItems.map(
                                (item) => ({

                                    product_id:
                                        item.product_id,

                                    quantity:
                                        item.quantity,

                                    customization_option_ids:
                                        item.customization_option_ids
                                })
                            );

                        //Request trusted Cart quote
                        const response =
                            await fetch(
                                `${API_URL}/api/bakeries/public/${slug}/cart/quote`,
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            items:
                                                items
                                        }),

                                    signal:
                                        controller.signal
                                }
                            );

                        //Convert backend response
                        const data =
                            await response.json();

                        //Stop if pricing failed
                        if (!response.ok) {

                            throw new Error(
                                data.message ||
                                data.errors?.[0]?.msg ||
                                "Unable to calculate Cart price"
                            );
                        }

                        //Store trusted Cart quote
                        setCartQuote(
                            data.quote
                        );

                    } catch (error) {

                        //Ignore cancelled requests
                        if (
                            error.name ===
                            "AbortError"
                        ) {
                            return;
                        }

                        //Remove old pricing
                        setCartQuote(null);

                        //Store pricing error
                        setCartQuoteError(
                            error.message
                        );

                    } finally {

                        //Stop loading when request was not cancelled
                        if (
                            !controller.signal.aborted
                        ) {

                            setIsCartQuoteLoading(
                                false
                            );
                        }
                    }

                },
                250
            );


        //Cancel outdated Cart quote request
        return () => {

            clearTimeout(
                quoteTimer
            );

            controller.abort();
        };

    }, [
        bakeryCartItems,
        slug
    ]);


    //Removes a Product from the Cart
    function handleRemoveFromCart(
        cartItemId
    ) {

        //Remove current whole-Cart quote
        setCartQuote(null);

        //Clear previous Cart errors
        setCartQuoteError("");
        setCartError("");

        //Remove Product
        removeFromCart(
            cartItemId
        );
    }


    //Updates Product quantity using trusted backend pricing
    async function changeQuantity(
        item,
        newQuantity
    ) {

        //Do not allow quantities below one
        if (
            newQuantity < 1
        ) {
            return;
        }

        //Track updating Product
        setUpdatingItemId(
            item.cart_item_id
        );

        //Clear errors
        setCartError("");

        //Hide outdated whole-Cart pricing
        setCartQuote(null);

        try {

            //Request a trusted Product quote
            const response =
                await fetch(
                    `${API_URL}/api/bakeries/public/${item.bakery_slug}/products/${item.product_id}/quote`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                quantity:
                                    newQuantity,

                                customization_option_ids:
                                    item.customization_option_ids
                            })
                    }
                );

            //Convert response
            const data =
                await response.json();

            //Stop when Product pricing fails
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.errors?.[0]?.msg ||
                    "Unable to update Cart"
                );
            }

            //Update Cart Product
            updateCartItem(
                item.cart_item_id,
                {
                    quantity:
                        newQuantity,

                    quote:
                        data.quote,

                    customizations:
                        data.quote.customizations
                }
            );

        } catch (error) {

            //Display Cart update error
            setCartError(
                error.message
            );

        } finally {

            //Stop Product updating
            setUpdatingItemId(
                null
            );
        }
    }


    //Gets the currently logged-in Customer
    function getStoredCustomer() {

        //User may be stored in either storage location
        const storedUser =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        //No logged-in User
        if (!storedUser) {
            return null;
        }

        try {

            //Convert stored User back into JavaScript
            const user =
                JSON.parse(
                    storedUser
                );

            //Only Customer accounts can Checkout
            if (
                user.role !==
                "customer"
            ) {
                return null;
            }

            return user;

        } catch (error) {

            console.error(
                "Unable to read Customer account:",
                error
            );

            return null;
        }
    }


    //Gets Customer authentication token
    function getAuthToken() {

        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }


    //Handles Proceed to Checkout
    function handleProceedToCheckout() {

        //Do not continue without a valid Cart quote
        if (
            !cartQuote ||
            isCartQuoteLoading ||
            cartQuoteError
        ) {

            return;
        }

        const customer =
            getStoredCustomer();

        const token =
            getAuthToken();

        //Checkout page Customer should return to
        const checkoutPath =
            `/store/${slug}/checkout`;

        //Customer is not logged in
        if (
            !customer ||
            !token
        ) {

            //Save Customer authentication context
            //This also helps if email verification is needed
            localStorage.setItem(
                "authBakerySlug",
                slug
            );

            localStorage.setItem(
                "authReturnTo",
                checkoutPath
            );


            //Send Customer to Bakery login
            navigate(
                `/store/${slug}/login?redirect=${encodeURIComponent(
                    checkoutPath
                )}`
            );

            return;
        }


        //Logged-in Customer can continue to Checkout
        navigate(
            checkoutPath
        );
    }


    //Display Bakery loading state
    if (isBakeryLoading) {

        return (

            <div className="min-vh-100 d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading Cart...
                    </span>

                </div>

            </div>
        );
    }


    //Display Bakery loading error
    if (
        bakeryError ||
        !bakery
    ) {

        return (

            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="h3 mb-0">
                    Cart unavailable
                </h1>

                <p className="text-secondary mb-0">

                    {
                        bakeryError ||
                        "Bakery not found"
                    }

                </p>

                <Link
                    to={`/store/${slug}`}
                    className="btn btn-dark"
                >
                    Back to Store
                </Link>

            </div>
        );
    }


    return (

        //Apply Bakery theme to complete Cart page
        <div
            className="storefront-cart-page min-vh-100 d-flex flex-column"
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


            {/* Cart Content */}
            <main className="container-xl px-3 py-4 py-lg-5 flex-grow-1">

                {/* Cart heading */}
                <div className="mb-4">

                    <h1 className="storefront-cart-title mb-1">

                        Your Cart ({bakeryCartCount})

                    </h1>

                </div>


                {/* Product update error */}
                {cartError && (

                    <div className="alert alert-danger mb-4">

                        {
                            cartError
                        }

                    </div>
                )}


                {/* Empty Cart */}
                {bakeryCartItems.length ===
                    0 ? (

                    <div className="storefront-cart-empty text-center p-4 p-md-5">

                        <ShoppingCart
                            size={34}
                            className="mb-3"
                        />

                        <h2 className="h5 mb-2">
                            Your Cart is empty
                        </h2>

                        <p className="text-secondary mb-4">

                            Add something from the Bakery menu to get started.

                        </p>

                        <Link
                            to={`/store/${slug}#menu`}
                            className="storefront-cart-primary-button d-inline-flex align-items-center justify-content-center text-decoration-none"
                        >
                            Browse Menu
                        </Link>

                    </div>

                ) : (

                    <div className="row g-4 align-items-start">

                        {/* Cart Products */}
                        <div className="col-12 col-lg-8">

                            <div className="d-grid gap-3">

                                {bakeryCartItems.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        //Get newest trusted Cart Product
                                        const quotedItem =
                                            cartQuote?.items?.[
                                            index
                                            ];

                                        //Get trusted customization information
                                        const displayCustomizations =
                                            quotedItem?.customizations ||
                                            item.customizations ||
                                            [];

                                        //Get trusted Product total
                                        const displayItemTotal =
                                            quotedItem?.item_total ??
                                            item.quote?.item_total;

                                        return (

                                            <article
                                                key={
                                                    item.cart_item_id
                                                }
                                                className="storefront-cart-item p-3"
                                            >

                                                <div className="row g-3 align-items-center">

                                                    {/* Product image */}
                                                    <div className="col-auto">

                                                        {item.product_image_url ? (

                                                            <img
                                                                src={
                                                                    item.product_image_url
                                                                }
                                                                alt={
                                                                    item.product_name
                                                                }
                                                                className="storefront-cart-product-image"
                                                            />

                                                        ) : (

                                                            <div className="storefront-cart-product-placeholder d-flex align-items-center justify-content-center">

                                                                🍰

                                                            </div>
                                                        )}

                                                    </div>


                                                    {/* Product information */}
                                                    <div className="col">

                                                        <div className="d-flex justify-content-between align-items-start gap-3">

                                                            <div>

                                                                {/* Product name */}
                                                                <h2 className="storefront-cart-product-name mb-1">

                                                                    {
                                                                        item.product_name
                                                                    }

                                                                </h2>


                                                                {/* Product customizations */}
                                                                {displayCustomizations.length >
                                                                    0 && (

                                                                        <div className="storefront-cart-options">

                                                                            {displayCustomizations.map(
                                                                                (
                                                                                    customization
                                                                                ) => (

                                                                                    <span
                                                                                        key={
                                                                                            customization.option_id
                                                                                        }
                                                                                        className="d-block"
                                                                                    >

                                                                                        {
                                                                                            customization.group_name
                                                                                        }
                                                                                        :{" "}
                                                                                        {
                                                                                            customization.option_name
                                                                                        }

                                                                                        {Number(
                                                                                            customization.additional_price ||
                                                                                            0
                                                                                        ) >
                                                                                            0 && (

                                                                                                <>
                                                                                                    {" "}
                                                                                                    (+
                                                                                                    {
                                                                                                        formatPrice(
                                                                                                            customization.additional_price
                                                                                                        )
                                                                                                    }
                                                                                                    )
                                                                                                </>
                                                                                            )}

                                                                                    </span>
                                                                                )
                                                                            )}

                                                                        </div>
                                                                    )}


                                                                {/* Special instructions */}
                                                                {item.special_instructions && (

                                                                    <p className="storefront-cart-instructions mt-2 mb-0">

                                                                        {
                                                                            item.special_instructions
                                                                        }

                                                                    </p>
                                                                )}

                                                            </div>


                                                            {/* Remove Product */}
                                                            <button
                                                                type="button"
                                                                aria-label={`Remove ${item.product_name}`}
                                                                onClick={() =>
                                                                    handleRemoveFromCart(
                                                                        item.cart_item_id
                                                                    )
                                                                }
                                                                className="storefront-cart-remove-button d-flex align-items-center justify-content-center flex-shrink-0"
                                                            >

                                                                <X
                                                                    size={15}
                                                                />

                                                            </button>

                                                        </div>


                                                        {/* Quantity and Product total */}
                                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">

                                                            {/* Quantity */}
                                                            <div className="storefront-cart-quantity d-inline-flex align-items-center">

                                                                <button
                                                                    type="button"
                                                                    aria-label="Decrease quantity"
                                                                    onClick={() =>
                                                                        changeQuantity(
                                                                            item,
                                                                            item.quantity -
                                                                            1
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.quantity <=
                                                                        1 ||
                                                                        updatingItemId ===
                                                                        item.cart_item_id
                                                                    }
                                                                    className="storefront-cart-quantity-button d-flex align-items-center justify-content-center"
                                                                >

                                                                    <Minus
                                                                        size={13}
                                                                    />

                                                                </button>


                                                                <span className="storefront-cart-quantity-value text-center">

                                                                    {
                                                                        updatingItemId ===
                                                                            item.cart_item_id
                                                                            ? "..."
                                                                            : item.quantity
                                                                    }

                                                                </span>


                                                                <button
                                                                    type="button"
                                                                    aria-label="Increase quantity"
                                                                    onClick={() =>
                                                                        changeQuantity(
                                                                            item,
                                                                            item.quantity +
                                                                            1
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        updatingItemId ===
                                                                        item.cart_item_id
                                                                    }
                                                                    className="storefront-cart-quantity-button d-flex align-items-center justify-content-center"
                                                                >

                                                                    <Plus
                                                                        size={13}
                                                                    />

                                                                </button>

                                                            </div>


                                                            {/* Product total */}
                                                            <strong className="storefront-cart-item-price">

                                                                {
                                                                    formatPrice(
                                                                        displayItemTotal
                                                                    )
                                                                }

                                                            </strong>

                                                        </div>

                                                    </div>

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                            </div>


                            {/* Optional Bakery note */}
                            <div className="storefront-cart-note mt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsNoteOpen(
                                            !isNoteOpen
                                        )
                                    }
                                    className="storefront-cart-note-button w-100 d-flex align-items-center justify-content-between gap-3 text-start"
                                >

                                    <span>

                                        Add a note for the bakery{" "}

                                        <span className="storefront-cart-note-optional">
                                            (optional)
                                        </span>

                                    </span>

                                    <span>

                                        {
                                            isNoteOpen
                                                ? "▲"
                                                : "▼"
                                        }

                                    </span>

                                </button>


                                {isNoteOpen && (

                                    <div className="storefront-cart-note-body p-3">

                                        <textarea
                                            value={
                                                cartNote
                                            }
                                            onChange={(event) =>
                                                setCartNote(
                                                    event.target.value
                                                )
                                            }
                                            maxLength={300}
                                            rows={4}
                                            placeholder="Add any notes or requests for the bakery..."
                                            className="form-control storefront-cart-note-textarea"
                                        />

                                        <div className="d-flex justify-content-end mt-2">

                                            <small className="storefront-cart-note-count">

                                                {
                                                    cartNote.length
                                                }
                                                /300

                                            </small>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* Order Summary */}
                        <div className="col-12 col-lg-4">

                            <aside className="storefront-cart-summary p-4">

                                <h2 className="storefront-cart-summary-title mb-3">
                                    Order Summary
                                </h2>


                                {/* Cart quote loading */}
                                {isCartQuoteLoading && (

                                    <div className="d-flex align-items-center gap-2 storefront-cart-pricing-note mb-3">

                                        <div
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                        >

                                            <span className="visually-hidden">
                                                Updating Cart price...
                                            </span>

                                        </div>

                                        Updating Cart price...

                                    </div>
                                )}


                                {/* Cart quote error */}
                                {cartQuoteError && (

                                    <div className="alert alert-danger py-2 small">

                                        {
                                            cartQuoteError
                                        }

                                    </div>
                                )}


                                {/* Trusted Cart pricing */}
                                {cartQuote && (

                                    <>

                                        <div className="d-grid">

                                            {cartQuote.items.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <div
                                                        key={`${item.product_id}-${index}`}
                                                        className="storefront-cart-summary-product"
                                                    >

                                                        {/* Product heading */}
                                                        <div className="d-flex justify-content-between align-items-start gap-3">

                                                            <strong className="storefront-cart-summary-product-name">

                                                                {
                                                                    item.product_name
                                                                }

                                                                {" × "}

                                                                {
                                                                    item.quantity
                                                                }

                                                            </strong>


                                                            <strong className="storefront-cart-summary-product-total">

                                                                {
                                                                    formatPrice(
                                                                        item.item_total
                                                                    )
                                                                }

                                                            </strong>

                                                        </div>


                                                        {/* Pricing details */}
                                                        <div className="d-grid gap-1 mt-2">

                                                            {/* Base price */}
                                                            <div className="d-flex justify-content-between gap-3 storefront-cart-summary-detail">

                                                                <span>
                                                                    Base price
                                                                </span>

                                                                <span>

                                                                    {
                                                                        formatPrice(
                                                                            item.base_price
                                                                        )
                                                                    }

                                                                </span>

                                                            </div>


                                                            {/* Customizations */}
                                                            {item.customizations?.map(
                                                                (
                                                                    customization
                                                                ) => (

                                                                    <div
                                                                        key={
                                                                            customization.option_id
                                                                        }
                                                                        className="d-flex justify-content-between gap-3 storefront-cart-summary-detail"
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

                                                                            {Number(
                                                                                customization.additional_price ||
                                                                                0
                                                                            ) >
                                                                                0
                                                                                ? `+${formatPrice(
                                                                                    customization.additional_price
                                                                                )}`
                                                                                : "Included"}

                                                                        </span>

                                                                    </div>
                                                                )
                                                            )}


                                                            {/* Unit price */}
                                                            <div className="d-flex justify-content-between gap-3 storefront-cart-summary-detail">

                                                                <span>
                                                                    Unit price
                                                                </span>

                                                                <span>

                                                                    {
                                                                        formatPrice(
                                                                            item.unit_price
                                                                        )
                                                                    }

                                                                </span>

                                                            </div>


                                                            {/* Quantity */}
                                                            {item.quantity >
                                                                1 && (

                                                                    <div className="d-flex justify-content-between gap-3 storefront-cart-summary-detail">

                                                                        <span>
                                                                            Quantity
                                                                        </span>

                                                                        <span>
                                                                            × {item.quantity}
                                                                        </span>

                                                                    </div>
                                                                )}


                                                            {/* Product deposit */}
                                                            {item.payment_rule ===
                                                                "deposit" && (

                                                                    <div className="d-flex justify-content-between gap-3 storefront-cart-summary-detail">

                                                                        <span>

                                                                            Deposit{" "}
                                                                            (
                                                                            {
                                                                                item.deposit_percentage
                                                                            }
                                                                            %)

                                                                        </span>

                                                                        <span>

                                                                            {
                                                                                formatPrice(
                                                                                    item.amount_due_now
                                                                                )
                                                                            }

                                                                        </span>

                                                                    </div>
                                                                )}

                                                        </div>


                                                        {/* Divider between Products */}
                                                        {index <
                                                            cartQuote.items.length -
                                                            1 && (

                                                                <hr className="storefront-cart-summary-product-divider" />
                                                            )}

                                                    </div>
                                                )
                                            )}

                                        </div>


                                        <hr className="storefront-cart-summary-divider" />


                                        {/* Subtotal */}
                                        <div className="d-flex justify-content-between gap-3 mb-2">

                                            <span>
                                                Subtotal
                                            </span>

                                            <strong>

                                                {
                                                    formatPrice(
                                                        cartQuote.subtotal
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        {/* Total */}
                                        <div className="d-flex justify-content-between align-items-center gap-3">

                                            <strong>
                                                Total
                                            </strong>

                                            <strong className="storefront-cart-summary-total">

                                                {
                                                    formatPrice(
                                                        cartQuote.total
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        {/* Amount due now */}
                                        {cartQuote.deposit_required && (

                                            <div className="storefront-cart-deposit mt-3 p-3">

                                                <div className="d-flex justify-content-between gap-3">

                                                    <span>
                                                        Amount due now
                                                    </span>

                                                    <strong>

                                                        {
                                                            formatPrice(
                                                                cartQuote.amount_due_now
                                                            )
                                                        }

                                                    </strong>

                                                </div>

                                            </div>
                                        )}

                                    </>
                                )}


                                <hr className="storefront-cart-summary-divider" />


                                {/* Pricing notice */}
                                <p className="storefront-cart-pricing-note mb-3">

                                    Final pricing will be verified again before the order is placed.

                                </p>


                                {/* Checkout */}
                                <button
                                    type="button"
                                    onClick={
                                        handleProceedToCheckout
                                    }
                                    disabled={
                                        !cartQuote ||
                                        isCartQuoteLoading ||
                                        Boolean(
                                            cartQuoteError
                                        )
                                    }
                                    className="storefront-cart-primary-button w-100"
                                >

                                    {
                                        isCartQuoteLoading
                                            ? "Updating Price..."
                                            : "Proceed to Checkout"
                                    }

                                </button>


                                {/* Pickup information */}
                                <p className="storefront-cart-pickup-note text-center mb-0 mt-3">

                                    Pickup order from{" "}

                                    {
                                        bakeryName
                                    }

                                </p>

                            </aside>


                            {/* Continue Shopping */}
                            <div className="text-center mt-4">

                                <Link
                                    to={`/store/${slug}#menu`}
                                    className="storefront-cart-shopping-link text-decoration-none"
                                >
                                    ← Continue shopping
                                </Link>

                            </div>

                        </div>

                    </div>
                )}

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter
                bakery={bakery}
            />

        </div>
    );
}