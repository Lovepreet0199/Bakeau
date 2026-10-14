//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

//Import icons
import {
    Check,
    ShoppingBag,
    X
} from "lucide-react";

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
    const {
        slug,
        orderId
    } = useParams();

    //Used to navigate Customer
    const navigate =
        useNavigate();

    //Used to get page navigation state
    const location =
        useLocation();


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);

    //Stores Customer Order
    const [
        order,
        setOrder
    ] = useState(null);


    //Tracks page loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    //Stores page loading errors
    const [
        error,
        setError
    ] = useState("");


    //Tracks Cancel Order modal
    const [
        isCancelModalOpen,
        setIsCancelModalOpen
    ] = useState(false);


    //Tracks Order cancellation request
    const [
        isCancelling,
        setIsCancelling
    ] = useState(false);


    //Stores Order action errors
    const [
        actionError,
        setActionError
    ] = useState("");


    //Stores successful Order action message
    const [
        actionMessage,
        setActionMessage
    ] = useState("");


    //Stores Review for this Order
    const [
        review,
        setReview
    ] = useState(null);


    //Gets Customer token
    function getToken() {

        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }


    //Formats money
    function formatPrice(amount) {

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
            Number(amount) ||
            0
        );
    }


    //Formats Pickup date
    function formatPickupDate(date) {

        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-CA",
            {
                weekday:
                    "short",

                month:
                    "short",

                day:
                    "numeric",

                timeZone:
                    "UTC"
            }
        );
    }


    //Formats Pickup time
    function formatPickupTime(time) {

        if (!time) {
            return "";
        }

        const [
            hour,
            minute
        ] = time.split(":");

        const date =
            new Date();

        date.setHours(
            Number(hour),
            Number(minute),
            0,
            0
        );

        return date.toLocaleTimeString(
            "en-US",
            {
                hour:
                    "numeric",

                minute:
                    "2-digit",

                hour12:
                    true
            }
        );
    }


    //Capitalizes Order status
    function formatStatus(status) {

        if (!status) {
            return "";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
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

        const currentIndex =
            statusOrder.indexOf(
                order.status
            );

        const stageIndex =
            statusOrder.indexOf(
                status
            );

        return (
            currentIndex >=
            stageIndex
        );
    }


    //Loads Bakery, Order and Review
    useEffect(() => {

        async function loadOrder() {

            const token =
                getToken();


            //Customer must be logged in
            if (!token) {

                navigate(
                    `/store/${slug}/login`,
                    {
                        replace:
                            true
                    }
                );

                return;
            }


            try {

                setError("");


                //Load Bakery
                const bakeryResponse =
                    await fetch(
                        `http://localhost:3000/api/bakeries/public/${slug}`
                    );

                const bakeryData =
                    await bakeryResponse.json();


                //Stop if Bakery could not be loaded
                if (!bakeryResponse.ok) {

                    throw new Error(
                        bakeryData.message ||
                        "Unable to load Bakery"
                    );
                }


                //Save Bakery information
                setBakery(
                    bakeryData.bakery
                );


                //Load Customer Order
                const orderResponse =
                    await fetch(
                        `http://localhost:3000/api/orders/mine/${orderId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const orderData =
                    await orderResponse.json();


                //Stop if Order could not be loaded
                if (!orderResponse.ok) {

                    throw new Error(
                        orderData.message ||
                        "Unable to load Order"
                    );
                }


                //Save Customer Order
                setOrder(
                    orderData.order
                );


                //Check if Customer already reviewed this Order
                const reviewResponse =
                    await fetch(
                        `http://localhost:3000/api/reviews/order/${orderId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const reviewData =
                    await reviewResponse.json();


                //Save Review when one exists
                if (reviewResponse.ok) {

                    setReview(
                        reviewData.review
                    );
                }


            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setIsLoading(
                    false
                );
            }
        }


        loadOrder();

    }, [
        slug,
        orderId,
        navigate
    ]);


    //Cancels a pending Customer Order
    async function handleCancelOrder() {

        //Only pending Orders can be cancelled
        if (
            !order ||
            order.status !==
            "pending"
        ) {

            return;
        }


        setIsCancelling(
            true
        );

        setActionError("");

        setActionMessage("");


        try {

            //Get Customer authentication token
            const token =
                getToken();


            //Request Order cancellation
            const response =
                await fetch(
                    `http://localhost:3000/api/orders/mine/${orderId}/cancel`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            //Stop if Order could not be cancelled
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to cancel Order"
                );
            }


            //Update Order immediately on the page
            setOrder(
                (currentOrder) => ({
                    ...currentOrder,

                    status:
                        data.order?.status ||
                        "cancelled",

                    updated_at:
                        data.order?.updated_at ||
                        new Date().toISOString()
                })
            );


            //Close confirmation modal
            setIsCancelModalOpen(
                false
            );


            //Show success message
            setActionMessage(
                "Your Order has been cancelled."
            );


        } catch (error) {

            //Display cancellation error
            setActionError(
                error.message
            );

        } finally {

            //Stop cancellation loading
            setIsCancelling(
                false
            );
        }
    }


    //Display loading state
    if (isLoading) {

        return (

            <div className="storefront-tracking-loading d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading Order...
                    </span>

                </div>

            </div>
        );
    }


    //Display loading error
    if (
        error ||
        !bakery ||
        !order
    ) {

        return (

            <div className="storefront-tracking-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center">

                <h1 className="h4">
                    Unable to load Order
                </h1>

                <p>
                    {
                        error ||
                        "Order not found"
                    }
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
    const payment =
        order.payments?.[0];


    //Payment has actually been received
    const paymentReceived =
        payment?.payment_status ===
        "Received";


    //Payment waiting for Bakery verification
    const paymentPending =
        payment?.payment_status ===
        "Pending";


    //Amount connected to the Payment
    const paymentAmount =
        Number(
            payment?.amount ||
            0
        );


    //Remaining balance after a received payment
    const remainingBalance =
        paymentReceived
            ? Math.max(
                0,
                Number(
                    order.total_price
                ) -
                paymentAmount
            )
            : Number(
                order.total_price
            );


    //Pickup address
    const pickupLocation = [
        bakery.address?.city,
        bakery.address?.province
    ]
        .filter(Boolean)
        .join(", ");


    //Order stages displayed in the timeline
    const stages = [

        {
            status:
                "pending",

            title:
                "Order placed",

            description:
                `Your order has been received by ${bakery.name}.`
        },

        {
            status:
                "confirmed",

            title:
                "Order confirmed",

            description:
                "The bakery has accepted your order."
        },

        {
            status:
                "preparing",

            title:
                "Preparing",

            description:
                "Your order is being made with care."
        },

        {
            status:
                "ready",

            title:
                "Ready for pickup",

            description:
                "Your order is ready for pickup."
        },

        {
            status:
                "completed",

            title:
                "Completed",

            description:
                "Your order has been completed."
        }

    ];


    return (

        //Apply Bakery theme to Order Tracking page
        <div
            className="storefront-tracking-page min-vh-100 d-flex flex-column"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar
                bakery={bakery}
            />


            {/* Order Tracking Content */}
            <main className="storefront-tracking-main flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">


                    {/* Back to Orders */}
                    <Link
                        to={`/store/${slug}/orders`}
                        className="storefront-tracking-back text-decoration-none"
                    >
                        ‹ My orders
                    </Link>


                    {/* Review success message */}
                    {location.state?.reviewSubmitted && (

                        <div className="storefront-tracking-review-success">

                            ✓ Review posted successfully. Thank you for sharing your experience!

                        </div>

                    )}


                    {/* Order heading */}
                    <div className="storefront-tracking-heading d-flex justify-content-between align-items-end gap-3 flex-wrap">

                        <div>

                            <span>
                                ORDER TRACKING
                            </span>

                            <h1>
                                {
                                    order.order_number
                                }
                            </h1>

                        </div>


                        {/* Order status */}
                        <div
                            className={
                                `storefront-tracking-status storefront-tracking-status-${order.status}`
                            }
                        >
                            {
                                formatStatus(
                                    order.status
                                )
                            }
                        </div>

                    </div>


                    {/* Order action success */}
                    {actionMessage && (

                        <div
                            className="alert alert-success mb-4"
                            role="alert"
                        >
                            {
                                actionMessage
                            }
                        </div>

                    )}


                    {/* Order action error */}
                    {actionError &&
                        !isCancelModalOpen && (

                            <div
                                className="alert alert-danger mb-4"
                                role="alert"
                            >
                                {
                                    actionError
                                }
                            </div>

                        )}


                    <div className="row g-4">


                        {/* Main Order information */}
                        <div className="col-12 col-lg-8">


                            {/* Ordered Products */}
                            <section className="storefront-tracking-card mb-3">

                                {order.items?.map(
                                    (item) => (

                                        <div
                                            key={
                                                item._id
                                            }
                                            className="storefront-tracking-product"
                                        >

                                            <div className="d-flex gap-3">

                                                {/* Product image */}
                                                {item.product_id?.image_url ? (

                                                    <img
                                                        src={
                                                            item.product_id.image_url
                                                        }
                                                        alt={
                                                            item.product_name
                                                        }
                                                        className="storefront-tracking-product-image"
                                                    />

                                                ) : (

                                                    <div className="storefront-tracking-product-image storefront-tracking-product-placeholder d-flex align-items-center justify-content-center">

                                                        <ShoppingBag
                                                            size={19}
                                                        />

                                                    </div>

                                                )}


                                                {/* Product information */}
                                                <div className="flex-grow-1">

                                                    <strong className="d-block">
                                                        {
                                                            item.product_name
                                                        }
                                                    </strong>

                                                    <small className="d-block">
                                                        Qty{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </small>


                                                    {/* Product Customizations */}
                                                    {item.customizations?.length >
                                                        0 && (

                                                            <div className="storefront-tracking-product-customizations mt-2">

                                                                {item.customizations.map(
                                                                    (
                                                                        customization
                                                                    ) => (

                                                                        <div
                                                                            key={
                                                                                customization._id
                                                                            }
                                                                            className="storefront-tracking-product-option"
                                                                        >

                                                                            <span>
                                                                                {
                                                                                    customization.group_name
                                                                                }
                                                                                :
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    customization.option_name
                                                                                }
                                                                            </strong>

                                                                        </div>

                                                                    )
                                                                )}

                                                            </div>

                                                        )}


                                                    {/* Product special notes */}
                                                    {item.special_notes && (

                                                        <small className="storefront-tracking-product-note d-block mt-2">

                                                            Note: "
                                                            {
                                                                item.special_notes
                                                            }
                                                            "

                                                        </small>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </section>


                            {/* Preparing Order message */}
                            {order.status ===
                                "preparing" && (

                                    <section className="storefront-tracking-current mb-3">

                                        <strong className="d-block">
                                            Preparing
                                        </strong>

                                        <span>
                                            Your order is being made with care.
                                        </span>

                                    </section>

                                )}


                            {/* Ready Order message */}
                            {order.status ===
                                "ready" && (

                                    <section className="storefront-tracking-current mb-3">

                                        <strong className="d-block">
                                            Ready for pickup
                                        </strong>

                                        <span>
                                            Your order is ready for pickup.
                                        </span>

                                    </section>

                                )}


                            {/* Cancelled Order */}
                            {order.status ===
                                "cancelled" ? (

                                <section className="storefront-tracking-cancelled mb-3">

                                    <strong className="d-block mb-1">
                                        Order cancelled
                                    </strong>

                                    <span>
                                        This Order was cancelled and will not move forward.
                                    </span>

                                </section>

                            ) : (

                                /* Order Status Timeline */
                                <section className="storefront-tracking-card mb-3">

                                    <h2 className="storefront-tracking-card-title">
                                        Order status
                                    </h2>


                                    <div className="storefront-tracking-timeline">

                                        {stages.map(
                                            (
                                                stage,
                                                index
                                            ) => {

                                                //Check completed stage
                                                const complete =
                                                    isStatusComplete(
                                                        stage.status
                                                    );

                                                //Check current stage
                                                const current =
                                                    order.status ===
                                                    stage.status;


                                                return (

                                                    <div
                                                        key={
                                                            stage.status
                                                        }
                                                        className="storefront-tracking-stage"
                                                    >

                                                        {/* Timeline indicator */}
                                                        <div className="storefront-tracking-stage-left">

                                                            <div
                                                                className={
                                                                    complete
                                                                        ? "storefront-tracking-circle storefront-tracking-circle-complete"
                                                                        : "storefront-tracking-circle"
                                                                }
                                                            >

                                                                {complete ? (

                                                                    <Check
                                                                        size={15}
                                                                    />

                                                                ) : (

                                                                    index +
                                                                    1

                                                                )}

                                                            </div>


                                                            {/* Timeline connection */}
                                                            {index <
                                                                stages.length -
                                                                1 && (

                                                                    <div
                                                                        className={
                                                                            complete
                                                                                ? "storefront-tracking-line storefront-tracking-line-complete"
                                                                                : "storefront-tracking-line"
                                                                        }
                                                                    />

                                                                )}

                                                        </div>


                                                        {/* Timeline text */}
                                                        <div
                                                            className={
                                                                current
                                                                    ? "storefront-tracking-stage-text storefront-tracking-stage-current"
                                                                    : "storefront-tracking-stage-text"
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    stage.title
                                                                }
                                                            </strong>

                                                            <p>
                                                                {
                                                                    stage.description
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                );
                                            }
                                        )}

                                    </div>

                                </section>

                            )}


                            {/* Order Customizations */}
                            {order.items?.some(
                                (item) =>
                                    item.customizations?.length >
                                    0
                            ) && (

                                    <section className="storefront-tracking-card">

                                        <h2 className="storefront-tracking-card-title">
                                            Your customizations
                                        </h2>


                                        <div className="row g-3">

                                            {order.items
                                                .flatMap(
                                                    (item) =>
                                                        item.customizations ||
                                                        []
                                                )
                                                .map(
                                                    (
                                                        customization
                                                    ) => (

                                                        <div
                                                            key={
                                                                customization._id
                                                            }
                                                            className="col-12 col-sm-6"
                                                        >

                                                            <span className="storefront-tracking-custom-label">

                                                                {
                                                                    customization.group_name
                                                                }

                                                            </span>

                                                            <strong className="d-block storefront-tracking-custom-value">

                                                                {
                                                                    customization.option_name
                                                                }

                                                            </strong>

                                                        </div>

                                                    )
                                                )}

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

                                    {
                                        formatPickupDate(
                                            order.pickup_date
                                        )
                                    }

                                    {" · "}

                                    {
                                        formatPickupTime(
                                            order.pickup_time
                                        )
                                    }

                                </strong>

                                <span className="d-block mt-1">
                                    {
                                        bakery.name
                                    }
                                </span>


                                {pickupLocation && (

                                    <span className="d-block">
                                        {
                                            pickupLocation
                                        }
                                    </span>

                                )}


                                {bakery.pickup_instructions && (

                                    <small className="d-block mt-3">
                                        {
                                            bakery.pickup_instructions
                                        }
                                    </small>

                                )}

                            </section>


                            {/* Payment details */}
                            <section className="storefront-tracking-card mb-3">

                                <h2 className="storefront-tracking-card-title">
                                    Payment
                                </h2>


                                {/* Total */}
                                <div className="d-flex justify-content-between mb-2">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {
                                            formatPrice(
                                                order.total_price
                                            )
                                        }
                                    </strong>

                                </div>


                                {/* Pending Payment */}
                                {paymentPending && (

                                    <div className="d-flex justify-content-between mb-2 storefront-tracking-payment-pending">

                                        <span>
                                            Payment pending
                                        </span>

                                        <strong>
                                            {
                                                formatPrice(
                                                    paymentAmount
                                                )
                                            }
                                        </strong>

                                    </div>

                                )}


                                {/* Received Payment */}
                                {paymentReceived && (

                                    <div className="d-flex justify-content-between mb-2 storefront-tracking-payment-received">

                                        <span>
                                            Payment received
                                        </span>

                                        <strong>

                                            ✓{" "}

                                            {
                                                formatPrice(
                                                    paymentAmount
                                                )
                                            }

                                        </strong>

                                    </div>

                                )}


                                {/* Remaining balance */}
                                <div className="d-flex justify-content-between">

                                    <span>
                                        Balance
                                    </span>

                                    <strong>
                                        {
                                            formatPrice(
                                                remainingBalance
                                            )
                                        }
                                    </strong>

                                </div>


                                {/* Payment method */}
                                {payment && (

                                    <small className="d-block mt-3">

                                        {
                                            payment.payment_method ===
                                                "Manual"
                                                ? "Manual Interac e-Transfer"
                                                : "Paid via Stripe"
                                        }

                                    </small>

                                )}

                            </section>


                            {/* Pending Order actions */}
                            {order.status ===
                                "pending" && (

                                    <section className="storefront-tracking-card mb-3">

                                        <h2 className="storefront-tracking-card-title">
                                            Order actions
                                        </h2>

                                        <p className="storefront-tracking-action-text mb-3">

                                            You can edit/cancel this Order while it is still pending.

                                        </p>

                                        {/* Edit Order */}
                                        <Link
                                            to={`/store/${slug}/orders/${orderId}/edit`}
                                            className="storefront-tracking-edit-button d-flex align-items-center justify-content-center text-decoration-none w-100 mb-2"
                                        >
                                            Edit Order
                                        </Link>

                                        <button
                                            type="button"
                                            className="storefront-tracking-cancel-button w-100"
                                            onClick={() => {

                                                //Clear old errors
                                                setActionError("");

                                                //Open confirmation modal
                                                setIsCancelModalOpen(
                                                    true
                                                );

                                            }}
                                        >
                                            Cancel Order
                                        </button>

                                    </section>

                                )}


                            {/* Customer Review action */}
                            {order.status ===
                                "completed" && (

                                    <Link
                                        to={`/store/${slug}/orders/${orderId}/review`}
                                        className="storefront-tracking-review-button text-decoration-none"
                                    >

                                        {
                                            review
                                                ? "View your review"
                                                : "Leave a review"
                                        }

                                    </Link>

                                )}

                        </div>

                    </div>

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter
                bakery={bakery}
            />


            {/* Cancel Order confirmation modal */}
            {isCancelModalOpen && (

                <div className="storefront-cancel-modal-backdrop d-flex align-items-center justify-content-center p-3">

                    <div className="storefront-cancel-modal w-100">


                        {/* Modal Header */}
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">

                            <h2 className="mb-0">
                                Cancel Order?
                            </h2>

                            <button
                                type="button"
                                className="storefront-cancel-modal-close d-flex align-items-center justify-content-center"
                                onClick={() => {

                                    setIsCancelModalOpen(
                                        false
                                    );

                                    setActionError("");

                                }}
                                disabled={
                                    isCancelling
                                }
                                aria-label="Close cancel Order confirmation"
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


                        {/* Confirmation message */}
                        <p className="storefront-cancel-modal-text mb-2">

                            Are you sure you want to cancel Order{" "}

                            <strong>
                                {
                                    order.order_number
                                }
                            </strong>

                            ?

                        </p>


                        {/* Warning */}
                        <p className="storefront-cancel-modal-note mb-0">

                            This action cannot be undone.

                        </p>


                        {/* Cancellation error */}
                        {actionError && (

                            <div
                                className="alert alert-danger py-2 mt-3 mb-0"
                                role="alert"
                            >
                                {
                                    actionError
                                }
                            </div>

                        )}


                        {/* Modal Actions */}
                        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">

                            {/* Keep Order */}
                            <button
                                type="button"
                                className="storefront-cancel-modal-secondary"
                                onClick={() => {

                                    setIsCancelModalOpen(
                                        false
                                    );

                                    setActionError("");

                                }}
                                disabled={
                                    isCancelling
                                }
                            >
                                Keep Order
                            </button>


                            {/* Confirm Cancel Order */}
                            <button
                                type="button"
                                className="storefront-cancel-modal-danger"
                                onClick={
                                    handleCancelOrder
                                }
                                disabled={
                                    isCancelling
                                }
                            >

                                {
                                    isCancelling
                                        ? "Cancelling..."
                                        : "Yes, Cancel Order"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}