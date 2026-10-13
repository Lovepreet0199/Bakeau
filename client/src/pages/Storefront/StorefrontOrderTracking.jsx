//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import icons
import { Check, ShoppingBag } from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Order Tracking styles
import "./StorefrontOrderTracking.css";


//Displays one Customer Order and its current progress
export default function StorefrontOrderTracking() {

    //Get Bakery slug and Order ID
    const { slug, orderId } = useParams();
    const navigate = useNavigate();

    //Page data
    const [bakery, setBakery] = useState(null);
    const [order, setOrder] = useState(null);

    //Page states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");


    //Gets Customer token
    function getToken() {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    }


    //Formats money
    function formatPrice(amount) {

        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: bakery?.currency || "CAD"
        }).format(Number(amount) || 0);
    }


    //Formats Pickup date
    function formatPickupDate(date) {

        if (!date) return "";

        return new Date(date).toLocaleDateString("en-CA", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC"
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


    //Capitalizes Order status
    function formatStatus(status) {

        if (!status) return "";

        return status.charAt(0).toUpperCase() + status.slice(1);
    }


    //Checks whether an Order stage has been completed
    function isStatusComplete(status) {

        const statusOrder = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "completed"
        ];

        const currentIndex = statusOrder.indexOf(order.status);
        const stageIndex = statusOrder.indexOf(status);

        return currentIndex >= stageIndex;
    }


    //Loads Bakery and Order
    useEffect(() => {

        async function loadOrder() {

            const token = getToken();


            //Customer must be logged in
            if (!token) {

                navigate(`/store/${slug}/login`, {
                    replace: true
                });

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
                        bakeryData.message || "Unable to load Bakery"
                    );
                }


                setBakery(bakeryData.bakery);


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
                        orderData.message || "Unable to load Order"
                    );
                }


                setOrder(orderData.order);


            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }


        loadOrder();

    }, [slug, orderId, navigate]);


    //Loading
    if (isLoading) {

        return (
            <div className="storefront-tracking-loading d-flex align-items-center justify-content-center">

                <div className="spinner-border" role="status">

                    <span className="visually-hidden">
                        Loading Order...
                    </span>

                </div>

            </div>
        );
    }


    //Error
    if (error || !bakery || !order) {

        return (
            <div className="storefront-tracking-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center">

                <h1 className="h4">
                    Unable to load Order
                </h1>

                <p>
                    {error || "Order not found"}
                </p>

                <Link
                    to={`/store/${slug}`}
                    className="btn btn-dark"
                >
                    Back to Bakery
                </Link>

            </div>
        );
    }


    //Use the first Payment for this Order
    const payment = order.payments?.[0];


    //Payment has actually been received
    const paymentReceived =
        payment?.payment_status === "Received";


    //Payment waiting for Bakery verification
    const paymentPending =
        payment?.payment_status === "Pending";


    //Amount connected to the Payment
    const paymentAmount =
        Number(payment?.amount || 0);


    //Remaining balance after a received payment
    const remainingBalance = paymentReceived
        ? Math.max(0, Number(order.total_price) - paymentAmount)
        : Number(order.total_price);


    //Pickup address
    const pickupLocation = [
        bakery.address?.city,
        bakery.address?.province
    ].filter(Boolean).join(", ");


    //Order stages displayed in the timeline
    const stages = [
        {
            status: "pending",
            title: "Order placed",
            description: `Your order has been received by ${bakery.name}.`
        },
        {
            status: "confirmed",
            title: "Order confirmed",
            description: "The bakery has accepted your order."
        },
        {
            status: "preparing",
            title: "Preparing",
            description: "Your order is being made with care."
        },
        {
            status: "ready",
            title: "Ready for pickup",
            description: "Your order is ready for pickup."
        },
        {
            status: "completed",
            title: "Completed",
            description: "Your order has been completed."
        }
    ];


    return (

        <div
            className="storefront-tracking-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            <main className="storefront-tracking-main flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">


                    {/* Back */}
                    <Link
                        to={`/store/${slug}/orders`}
                        className="storefront-tracking-back text-decoration-none"
                    >
                        ‹ My orders
                    </Link>


                    {/* Order heading */}
                    <div className="storefront-tracking-heading d-flex justify-content-between align-items-end gap-3 flex-wrap">

                        <div>

                            <span>
                                ORDER TRACKING
                            </span>

                            <h1>
                                {order.order_number}
                            </h1>

                        </div>


                        <div className={`storefront-tracking-status storefront-tracking-status-${order.status}`}>
                            {formatStatus(order.status)}
                        </div>

                    </div>


                    <div className="row g-4">


                        {/* Main Order information */}
                        <div className="col-12 col-lg-8">


                            {/* Products */}
                            <section className="storefront-tracking-card mb-3">

                                {order.items?.map((item) => (

                                    <div
                                        key={item._id}
                                        className="storefront-tracking-product"
                                    >

                                        <div className="d-flex gap-3">

                                            {/* Product image */}
                                            {item.product_id?.image_url ? (

                                                <img
                                                    src={item.product_id.image_url}
                                                    alt={item.product_name}
                                                    className="storefront-tracking-product-image"
                                                />

                                            ) : (

                                                <div className="storefront-tracking-product-image storefront-tracking-product-placeholder d-flex align-items-center justify-content-center">

                                                    <ShoppingBag size={19} />

                                                </div>

                                            )}

                                            {/* Product information */}
                                            <div className="flex-grow-1">

                                                <strong className="d-block">
                                                    {item.product_name}
                                                </strong>

                                                <small className="d-block">
                                                    Qty {item.quantity}
                                                </small>


                                                {/* Customizations for THIS Product */}
                                                {item.customizations?.length > 0 && (

                                                    <div className="storefront-tracking-product-customizations mt-2">

                                                        {item.customizations.map((customization) => (

                                                            <div
                                                                key={customization._id}
                                                                className="storefront-tracking-product-option"
                                                            >

                                                                <span>
                                                                    {customization.group_name}:
                                                                </span>

                                                                <strong>
                                                                    {customization.option_name}
                                                                </strong>

                                                            </div>

                                                        ))}

                                                    </div>

                                                )}


                                                {/* Notes for THIS Product */}
                                                {item.special_notes && (

                                                    <small className="storefront-tracking-product-note d-block mt-2">
                                                        Note: "{item.special_notes}"
                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </section>


                            {/* Current Order status message */}
                            {order.status === "preparing" && (

                                <section className="storefront-tracking-current mb-3">

                                    <strong className="d-block">
                                        Preparing
                                    </strong>

                                    <span>
                                        Your order is being made with care.
                                    </span>

                                </section>

                            )}


                            {order.status === "ready" && (

                                <section className="storefront-tracking-current mb-3">

                                    <strong className="d-block">
                                        Ready for pickup
                                    </strong>

                                    <span>
                                        Your order is ready for pickup.
                                    </span>

                                </section>

                            )}


                            {/* Status Timeline */}
                            <section className="storefront-tracking-card mb-3">

                                <h2 className="storefront-tracking-card-title">
                                    Order status
                                </h2>


                                <div className="storefront-tracking-timeline">


                                    {/* Order stages */}
                                    {stages.map((stage, index) => {

                                        const complete =
                                            isStatusComplete(stage.status);

                                        const current =
                                            order.status === stage.status;


                                        return (

                                            <div
                                                key={stage.status}
                                                className="storefront-tracking-stage"
                                            >

                                                <div className="storefront-tracking-stage-left">

                                                    <div
                                                        className={
                                                            complete
                                                                ? "storefront-tracking-circle storefront-tracking-circle-complete"
                                                                : "storefront-tracking-circle"
                                                        }
                                                    >

                                                        {complete ? (
                                                            <Check size={15} />
                                                        ) : (
                                                            index + 1
                                                        )}

                                                    </div>


                                                    {index < stages.length - 1 && (

                                                        <div
                                                            className={
                                                                complete
                                                                    ? "storefront-tracking-line storefront-tracking-line-complete"
                                                                    : "storefront-tracking-line"
                                                            }
                                                        />

                                                    )}

                                                </div>


                                                <div
                                                    className={
                                                        current
                                                            ? "storefront-tracking-stage-text storefront-tracking-stage-current"
                                                            : "storefront-tracking-stage-text"
                                                    }
                                                >

                                                    <strong>
                                                        {stage.title}
                                                    </strong>

                                                    <p>
                                                        {stage.description}
                                                    </p>

                                                </div>

                                            </div>

                                        );
                                    })}

                                </div>

                            </section>


                            {/* Customizations */}
                            {order.items?.some(
                                (item) => item.customizations?.length > 0
                            ) && (

                                    <section className="storefront-tracking-card">

                                        <h2 className="storefront-tracking-card-title">
                                            Your customizations
                                        </h2>


                                        <div className="row g-3">

                                            {order.items
                                                .flatMap((item) => item.customizations || [])
                                                .map((customization) => (

                                                    <div
                                                        key={customization._id}
                                                        className="col-12 col-sm-6"
                                                    >

                                                        <span className="storefront-tracking-custom-label">
                                                            {customization.group_name}
                                                        </span>

                                                        <strong className="d-block storefront-tracking-custom-value">
                                                            {customization.option_name}
                                                        </strong>

                                                    </div>

                                                ))}

                                        </div>

                                    </section>

                                )}

                        </div>


                        {/* Right side */}
                        <div className="col-12 col-lg-4">


                            {/* Pickup details */}
                            <section className="storefront-tracking-card mb-3">

                                <h2 className="storefront-tracking-card-title">
                                    Pickup details
                                </h2>

                                <strong className="d-block">
                                    {formatPickupDate(order.pickup_date)} · {formatPickupTime(order.pickup_time)}
                                </strong>

                                <span className="d-block mt-1">
                                    {bakery.name}
                                </span>

                                {pickupLocation && (

                                    <span className="d-block">
                                        {pickupLocation}
                                    </span>

                                )}


                                {bakery.pickup_instructions && (

                                    <small className="d-block mt-3">
                                        {bakery.pickup_instructions}
                                    </small>

                                )}

                            </section>


                            {/* Payment details */}
                            <section className="storefront-tracking-card mb-3">

                                <h2 className="storefront-tracking-card-title">
                                    Payment
                                </h2>


                                <div className="d-flex justify-content-between mb-2">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatPrice(order.total_price)}
                                    </strong>

                                </div>


                                {paymentPending && (

                                    <div className="d-flex justify-content-between mb-2 storefront-tracking-payment-pending">

                                        <span>
                                            Payment pending
                                        </span>

                                        <strong>
                                            {formatPrice(paymentAmount)}
                                        </strong>

                                    </div>

                                )}


                                {paymentReceived && (

                                    <div className="d-flex justify-content-between mb-2 storefront-tracking-payment-received">

                                        <span>
                                            Payment received
                                        </span>

                                        <strong>
                                            ✓ {formatPrice(paymentAmount)}
                                        </strong>

                                    </div>

                                )}


                                <div className="d-flex justify-content-between">

                                    <span>
                                        Balance
                                    </span>

                                    <strong>
                                        {formatPrice(remainingBalance)}
                                    </strong>

                                </div>


                                {payment && (

                                    <small className="d-block mt-3">
                                        {payment.payment_method === "Manual"
                                            ? "Manual Interact e-Transfer"
                                            : "Paid via Stripe"
                                        }
                                    </small>

                                )}

                            </section>


                            {/* Review placeholder */}
                            <div className="storefront-tracking-review text-center">
                                Leave a review after pickup →
                            </div>

                        </div>

                    </div>

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}