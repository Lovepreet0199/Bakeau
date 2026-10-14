import API_URL from "../../config/api.js";
//Import React hooks
import { useEffect, useMemo, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import Checkout icons
import { ArrowLeft, CalendarDays, Check, CreditCard, ShoppingBag } from "lucide-react";

//Import Cart hook
import { useCart } from "../../context/useCart";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Payment styles
import "./StorefrontCheckoutPayment.css";


//Displays the Payment step of Storefront Checkout
export default function StorefrontCheckoutPayment() {

    //Get Bakery slug and navigation
    const { slug } = useParams();
    const navigate = useNavigate();

    //Get Cart information
    const { cartItems } = useCart();

    //Page data
    const [bakery, setBakery] = useState(null);
    const [cartQuote, setCartQuote] = useState(null);
    const [pickup, setPickup] = useState(null);
    const [contact, setContact] = useState(null);
    const [orderNote, setOrderNote] = useState("");

    //Payment selections
    const [paymentChoice, setPaymentChoice] = useState("full");
    const [paymentMethod, setPaymentMethod] = useState("manual");

    //Page states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");


    //Only get Cart items for this Bakery
    const bakeryCartItems = useMemo(() => {

        return cartItems.filter(
            (item) =>
                item.bakery_slug === slug
        );

    }, [cartItems, slug]);


    //Gets Customer authentication token
    function getToken() {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    }


    //Formats money
    function formatPrice(amount) {

        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: cartQuote?.currency || bakery?.currency || "CAD"
        }).format(Number(amount) || 0);
    }


    //Formats Pickup date
    function formatPickupDate(date) {

        if (!date) return "";

        return new Date(`${date}T12:00:00`).toLocaleDateString("en-CA", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
    }


    //Formats Pickup time
    function formatPickupTime(time) {

        if (!time) return "";

        const [hour, minute] = time.split(":");
        const date = new Date();

        date.setHours(Number(hour), Number(minute), 0, 0);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }


    //Get total Order price
    const orderTotal = Number(cartQuote?.total || 0);


    //Get minimum amount due now
    const depositAmount = Number(cartQuote?.amount_due_now || orderTotal);


    //Order has a Deposit when amount due now is less than total
    const depositRequired = depositAmount < orderTotal;


    //Amount Customer has selected to pay
    const selectedPaymentAmount =
        paymentChoice === "deposit" && depositRequired
            ? depositAmount
            : orderTotal;


    //Remaining balance after selected payment
    const remainingBalance =
        paymentChoice === "deposit" && depositRequired
            ? Math.max(0, orderTotal - depositAmount)
            : 0;


    //Create Pickup address
    const pickupAddress = [
        bakery?.address?.street,
        bakery?.address?.city,
        bakery?.address?.province
    ].filter(Boolean).join(", ");


    //Loads Checkout information
    useEffect(() => {

        async function loadPaymentPage() {

            const token = getToken();

            //Customer needs to be logged in
            if (!token) {

                const returnTo = `/${slug}/checkout/payment`;

                localStorage.setItem("authBakerySlug", slug);
                localStorage.setItem("authReturnTo", returnTo);

                navigate(`/${slug}/login?redirect=${encodeURIComponent(returnTo)}`, {
                    replace: true
                });

                return;
            }


            //Get information saved by previous Checkout steps
            const savedPickup = sessionStorage.getItem(`checkoutPickup:${slug}`);
            const savedContact = sessionStorage.getItem(`checkoutContact:${slug}`);
            const savedNote = sessionStorage.getItem(`checkoutNote:${slug}`);


            //Pickup must be completed first
            if (!savedPickup) {
                navigate(`/${slug}/checkout`, { replace: true });
                return;
            }


            //Contact Details must be completed first
            if (!savedContact) {
                navigate(`/${slug}/checkout/details`, { replace: true });
                return;
            }


            //Cart cannot be empty
            if (bakeryCartItems.length === 0) {
                navigate(`/${slug}/cart`, { replace: true });
                return;
            }


            try {

                setError("");

                //Restore Checkout information
                setPickup(JSON.parse(savedPickup));
                setContact(JSON.parse(savedContact));
                setOrderNote(savedNote || "");


                //Load Bakery
                const bakeryResponse = await fetch(
                    `${API_URL}/api/bakeries/public/${slug}`
                );

                const bakeryData = await bakeryResponse.json();


                if (!bakeryResponse.ok) {
                    throw new Error(
                        bakeryData.message || "Unable to load Bakery"
                    );
                }


                setBakery(bakeryData.bakery);


                //Make sure Customer login is still valid
                const customerResponse = await fetch(
                    `${API_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                if (customerResponse.status === 401) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user");

                    const returnTo = `/${slug}/checkout/payment`;

                    localStorage.setItem("authBakerySlug", slug);
                    localStorage.setItem("authReturnTo", returnTo);

                    navigate(`/${slug}/login?redirect=${encodeURIComponent(returnTo)}`, {
                        replace: true
                    });

                    return;
                }


                const customerData = await customerResponse.json();


                if (!customerResponse.ok) {
                    throw new Error(
                        customerData.message || "Unable to verify Customer"
                    );
                }


                const customer = customerData.user || customerData;


                if (customer.role !== "customer") {
                    throw new Error(
                        "Please sign in with a Customer account"
                    );
                }


                //Create trusted Cart quote request
                const items = bakeryCartItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    customization_option_ids: item.customization_option_ids
                }));


                //Load trusted Backend Cart pricing
                const quoteResponse = await fetch(
                    `${API_URL}/api/bakeries/public/${slug}/cart/quote`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            items: items
                        })
                    }
                );


                const quoteData = await quoteResponse.json();


                if (!quoteResponse.ok) {
                    throw new Error(
                        quoteData.message ||
                        quoteData.errors?.[0]?.msg ||
                        "Unable to verify Cart"
                    );
                }


                setCartQuote(quoteData.quote);


                //Use Deposit as default when one is required
                if (
                    Number(quoteData.quote.amount_due_now) <
                    Number(quoteData.quote.total)
                ) {
                    setPaymentChoice("deposit");
                } else {
                    setPaymentChoice("full");
                }


            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }


        loadPaymentPage();

    }, [slug, bakeryCartItems, navigate]);


    //Creates the Order and Manual Payment
    async function handlePlaceOrder() {

        if (isSubmitting) {
            return;
        }


        const token = getToken();


        if (
            !token ||
            !bakery ||
            !pickup ||
            !contact ||
            !cartQuote
        ) {
            setError("Checkout information is incomplete.");
            return;
        }


        if (!bakery.allow_manual_payment) {
            setError("Manual payment is not available for this Bakery.");
            return;
        }


        try {

            setIsSubmitting(true);
            setError("");


            /*
                If the Order was already created but Payment failed,
                reuse the existing Order instead of creating a duplicate.
            */
            let orderId = sessionStorage.getItem(
                `checkoutOrderId:${slug}`
            );

            let orderNumber = sessionStorage.getItem(
                `checkoutOrderNumber:${slug}`
            );


            //Create the Order only when it has not already been created
            if (!orderId) {

                //Prepare Order items
                const items = bakeryCartItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    customization_option_ids: item.customization_option_ids,
                    special_notes: item.special_notes || ""
                }));


                //Create Order
                const orderResponse = await fetch(
                    `${API_URL}/api/orders`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({

                            bakery_id: bakery._id,

                            pickup_slot_id:
                                pickup.pickup_slot_id,

                            pickup_time:
                                pickup.time,

                            contact: {
                                first_name:
                                    contact.first_name,

                                last_name:
                                    contact.last_name,

                                email:
                                    contact.email,

                                phone_number:
                                    contact.phone_number
                            },

                            bakery_note:
                                orderNote,

                            items: items
                        })
                    }
                );


                const orderData = await orderResponse.json();


                if (!orderResponse.ok) {
                    throw new Error(
                        orderData.message ||
                        orderData.errors?.[0]?.msg ||
                        "Unable to create Order"
                    );
                }


                orderId = orderData.order._id;
                orderNumber = orderData.order.order_number;


                //Remember created Order in case Payment request fails
                sessionStorage.setItem(
                    `checkoutOrderId:${slug}`,
                    orderId
                );

                sessionStorage.setItem(
                    `checkoutOrderNumber:${slug}`,
                    orderNumber
                );
            }


            //Create Manual Payment
            const paymentResponse = await fetch(
                `${API_URL}/api/payments/manual`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        payment_choice: paymentChoice
                    })
                }
            );


            const paymentData = await paymentResponse.json();


            /*
                If a Payment already exists, the Order was already
                successfully submitted during a previous request.
            */
            if (
                !paymentResponse.ok &&
                paymentResponse.status !== 409
            ) {
                throw new Error(
                    paymentData.message ||
                    paymentData.errors?.[0]?.msg ||
                    "Unable to create Payment"
                );
            }


            //Save Confirmation information
            sessionStorage.setItem(
                `checkoutConfirmation:${slug}`,
                JSON.stringify({
                    order_id: orderId,
                    order_number: orderNumber,
                    payment_choice: paymentChoice,
                    payment_method: paymentMethod,
                    amount: selectedPaymentAmount
                })
            );


            //Remove temporary Checkout information
            sessionStorage.removeItem(`checkoutPickup:${slug}`);
            sessionStorage.removeItem(`checkoutContact:${slug}`);
            sessionStorage.removeItem(`checkoutNote:${slug}`);
            sessionStorage.removeItem(`checkoutOrderId:${slug}`);
            sessionStorage.removeItem(`checkoutOrderNumber:${slug}`);


            //Go to Order Confirmation
            navigate(
                `/${slug}/order/${orderId}/confirmed`
            );


        } catch (error) {

            setError(error.message);

        } finally {

            setIsSubmitting(false);
        }
    }


    //Loading
    if (isLoading) {

        return (
            <div className="storefront-payment-loading d-flex align-items-center justify-content-center">

                <div className="spinner-border" role="status">
                    <span className="visually-hidden">
                        Loading Payment...
                    </span>
                </div>

            </div>
        );
    }


    //Page error
    if (error && (!bakery || !cartQuote)) {

        return (
            <div className="storefront-payment-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="h4">
                    Payment unavailable
                </h1>

                <p>{error}</p>

                <Link
                    to={`/${slug}/checkout/details`}
                    className="btn btn-dark"
                >
                    Back to Contact Details
                </Link>

            </div>
        );
    }


    return (

        <div
            className="storefront-payment-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            <main className="storefront-payment-main flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">


                    {/* Checkout steps */}
                    <div className="storefront-payment-steps d-flex align-items-center gap-3 mb-4">

                        <Link
                            to={`/${slug}/checkout/details`}
                            className="storefront-payment-back d-flex align-items-center gap-2 text-decoration-none"
                        >
                            <ArrowLeft size={15} />
                            Back
                        </Link>

                        <span>
                            Contact details
                        </span>

                        <span>
                            ›
                        </span>

                        <strong>
                            Payment
                        </strong>

                    </div>


                    <div className="row g-4 align-items-start">


                        {/* Payment section */}
                        <div className="col-12 col-lg-8">


                            {/* Payment amount */}
                            <section className="storefront-payment-card mb-3">

                                <h1 className="storefront-payment-section-title">
                                    Payment
                                </h1>

                                <p className="storefront-payment-help">
                                    Choose how much you would like to pay today.
                                </p>


                                {/* Deposit Order */}
                                {depositRequired ? (

                                    <div className="storefront-payment-options">


                                        {/* Deposit */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentChoice("deposit")}
                                            className={
                                                paymentChoice === "deposit"
                                                    ? "storefront-payment-option storefront-payment-option-selected"
                                                    : "storefront-payment-option"
                                            }
                                        >

                                            <div className="d-flex align-items-start gap-3">

                                                <div className="storefront-payment-radio">
                                                    {paymentChoice === "deposit" && (
                                                        <Check size={12} />
                                                    )}
                                                </div>

                                                <div>

                                                    <strong className="d-block">
                                                        Pay deposit
                                                    </strong>

                                                    <small>
                                                        Pay the required deposit now and the remaining balance later.
                                                    </small>

                                                </div>

                                            </div>

                                            <strong>
                                                {formatPrice(depositAmount)}
                                            </strong>

                                        </button>


                                        {/* Full Payment */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentChoice("full")}
                                            className={
                                                paymentChoice === "full"
                                                    ? "storefront-payment-option storefront-payment-option-selected"
                                                    : "storefront-payment-option"
                                            }
                                        >

                                            <div className="d-flex align-items-start gap-3">

                                                <div className="storefront-payment-radio">
                                                    {paymentChoice === "full" && (
                                                        <Check size={12} />
                                                    )}
                                                </div>

                                                <div>

                                                    <strong className="d-block">
                                                        Pay full amount
                                                    </strong>

                                                    <small>
                                                        Pay the complete Order total today.
                                                    </small>

                                                </div>

                                            </div>

                                            <strong>
                                                {formatPrice(orderTotal)}
                                            </strong>

                                        </button>

                                    </div>

                                ) : (

                                    //Full Payment only
                                    <div className="storefront-payment-full-amount d-flex justify-content-between align-items-center">

                                        <div>

                                            <strong className="d-block">
                                                Amount due today
                                            </strong>

                                            <small>
                                                Full payment is required for this Order.
                                            </small>

                                        </div>

                                        <strong className="storefront-payment-big-price">
                                            {formatPrice(orderTotal)}
                                        </strong>

                                    </div>

                                )}

                            </section>


                            {/* Payment Method */}
                            <section className="storefront-payment-card mb-3">

                                <h2 className="storefront-payment-section-title">
                                    Payment method
                                </h2>

                                <p className="storefront-payment-help">
                                    Select how you would like to pay.
                                </p>


                                {/* Manual Payment */}
                                {bakery?.allow_manual_payment && (

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("manual")}
                                        className="storefront-payment-method storefront-payment-method-selected w-100"
                                    >

                                        <div className="d-flex align-items-center gap-3">

                                            <div className="storefront-payment-method-icon">
                                                <CreditCard size={18} />
                                            </div>

                                            <div className="text-start">

                                                <strong className="d-block">
                                                    Interac e-Transfer / Manual Payment
                                                </strong>

                                                <small>
                                                    Your payment will be confirmed by the Bakery after it is received.
                                                </small>

                                            </div>

                                        </div>

                                        <div className="storefront-payment-radio">
                                            <Check size={12} />
                                        </div>

                                    </button>

                                )}


                                {/* Manual payment information */}
                                {paymentMethod === "manual" && bakery?.allow_manual_payment && (

                                    <div className="storefront-payment-manual-info mt-3">

                                        <strong className="d-block mb-1">
                                            Payment instructions
                                        </strong>

                                        <p className="mb-2">
                                            After placing your Order, follow the Bakery's payment instructions to complete your payment.
                                        </p>

                                        <span>
                                            Amount to send:
                                            <strong className="ms-1">
                                                {formatPrice(selectedPaymentAmount)}
                                            </strong>
                                        </span>

                                        <small className="d-block mt-2">
                                            Your payment will remain pending until the Bakery confirms that it has been received.
                                        </small>

                                    </div>

                                )}

                            </section>


                            {/* Error */}
                            {error && (

                                <div className="alert alert-danger">
                                    {error}
                                </div>

                            )}


                            {/* Place Order */}
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={
                                    isSubmitting ||
                                    !bakery?.allow_manual_payment
                                }
                                className="storefront-payment-primary-button w-100"
                            >

                                {isSubmitting
                                    ? "Placing order..."
                                    : `Place order · ${formatPrice(selectedPaymentAmount)}`
                                }

                            </button>

                        </div>


                        {/* Order Summary */}
                        <div className="col-12 col-lg-4">

                            <aside className="storefront-payment-summary">

                                <h2 className="storefront-payment-summary-title">
                                    Order summary
                                </h2>


                                {/* Products */}
                                {bakeryCartItems.map((item, index) => {

                                    const quotedItem =
                                        cartQuote?.items?.[index];


                                    return (

                                        <div
                                            key={item.cart_item_id}
                                            className="storefront-payment-product mb-3"
                                        >

                                            {item.product_image_url ? (

                                                <img
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    className="storefront-payment-product-image"
                                                />

                                            ) : (

                                                <div className="storefront-payment-product-placeholder d-flex align-items-center justify-content-center">

                                                    <ShoppingBag size={18} />

                                                </div>

                                            )}


                                            <div>

                                                <strong className="storefront-payment-product-name d-block">
                                                    {item.product_name}
                                                </strong>

                                                <small className="storefront-payment-product-info">
                                                    Qty {item.quantity}
                                                </small>


                                                {quotedItem?.customizations?.length > 0 && (

                                                    <small className="storefront-payment-product-info d-block">

                                                        {quotedItem.customizations
                                                            .map((option) => option.option_name)
                                                            .join(" · ")}

                                                    </small>

                                                )}

                                            </div>

                                        </div>
                                    );
                                })}


                                {/* Pickup */}
                                <div className="storefront-payment-info-box mb-3">

                                    <div className="d-flex gap-2 mb-1">

                                        <CalendarDays size={16} />

                                        <strong>
                                            Pickup
                                        </strong>

                                    </div>

                                    <span className="d-block">
                                        {formatPickupDate(pickup?.date)} at {formatPickupTime(pickup?.time)}
                                    </span>

                                    <small>
                                        {bakery?.name}
                                        {pickupAddress
                                            ? ` · ${pickupAddress}`
                                            : ""
                                        }
                                    </small>

                                </div>


                                {/* Contact */}
                                <div className="storefront-payment-contact mb-3">

                                    <strong className="d-block mb-1">
                                        Contact
                                    </strong>

                                    <span className="d-block">
                                        {contact?.first_name} {contact?.last_name}
                                    </span>

                                    <small className="d-block">
                                        {contact?.email}
                                    </small>

                                    <small className="d-block">
                                        {contact?.phone_number}
                                    </small>

                                </div>


                                <hr />


                                {/* Pricing */}
                                <div className="d-flex justify-content-between mb-2">
                                    <span>
                                        Order total
                                    </span>

                                    <strong>
                                        {formatPrice(orderTotal)}
                                    </strong>
                                </div>


                                {depositRequired && paymentChoice === "deposit" && (

                                    <>
                                        <div className="d-flex justify-content-between mb-2 storefront-payment-highlight">

                                            <span>
                                                Due today
                                            </span>

                                            <strong>
                                                {formatPrice(depositAmount)}
                                            </strong>

                                        </div>


                                        <div className="d-flex justify-content-between storefront-payment-muted">

                                            <span>
                                                Remaining balance
                                            </span>

                                            <span>
                                                {formatPrice(remainingBalance)}
                                            </span>

                                        </div>
                                    </>

                                )}


                                {paymentChoice === "full" && (

                                    <div className="d-flex justify-content-between storefront-payment-highlight">

                                        <span>
                                            Due today
                                        </span>

                                        <strong>
                                            {formatPrice(orderTotal)}
                                        </strong>

                                    </div>

                                )}

                            </aside>

                        </div>

                    </div>

                </div>

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}