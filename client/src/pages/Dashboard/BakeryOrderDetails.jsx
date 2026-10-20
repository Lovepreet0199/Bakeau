import API_URL from "../../config/api.js";

//Import React hooks
import { useEffect, useState } from "react";

//Import React Router helpers
import {
    useNavigate,
    useParams
} from "react-router-dom";

//Import Order details icons
import {
    CalendarDays,
    Clock3,
    Mail,
    ContactRound,
    User,
    Check,
    X,
    LoaderCircle
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Order details styles
import "./styles/OrderDetails.css";


//Gets one Bakery Order from the backend
async function getBakeryOrder(orderId) {

    const token = getAuthToken();

    const response = await fetch(
        `${API_URL}/api/orders/bakery/${orderId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to load order"
        );
    }

    return data.order;
}


//Displays one Bakery Order and its complete information
export default function BakeryOrderDetails() {

    //Get the selected Order ID from the URL
    const { id } = useParams();

    //Used to navigate between Bakery dashboard pages
    const navigate = useNavigate();

    //Stores the selected Order
    const [order, setOrder] = useState(null);

    //Tracks whether the Order is loading
    const [isLoading, setIsLoading] = useState(true);

    //Tracks whether the Order status is updating
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    //Tracks whether a Manual Payment is updating
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

    //Stores the Payment action waiting for confirmation
    const [paymentConfirmation, setPaymentConfirmation] = useState(null);

    //Stores the final Order status waiting for confirmation
    const [statusConfirmation, setStatusConfirmation] = useState(null);

    //Stores any Order loading or update error
    const [error, setError] = useState("");

    //Tracks whether the Contact Customer menu is open
    const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);


    //Load the selected Order when the page opens
    useEffect(() => {

        let isCancelled = false;

        async function loadOrder() {

            try {

                const orderData = await getBakeryOrder(id);

                if (!isCancelled) {
                    setOrder(orderData);
                    setError("");
                }

            } catch (error) {

                if (!isCancelled) {
                    setError(error.message);
                }

            } finally {

                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadOrder();


        //Stops state updates if the page closes before the request finishes
        return () => {
            isCancelled = true;
        };

    }, [id]);


    //Handles Order status changes before sending the update
    function requestOrderStatus(newStatus) {

        //Do nothing when the selected status is already active
        if (newStatus === order.status) {
            return;
        }

        //Final Order actions require confirmation first
        if (
            newStatus === "completed" ||
            newStatus === "cancelled"
        ) {
            setStatusConfirmation(newStatus);
            return;
        }

        //Normal workflow changes can update immediately
        updateOrderStatus(newStatus);
    }


    //Updates the current Order status
    async function updateOrderStatus(newStatus) {

        //Do not make another request for the current status
        if (newStatus === order.status) {
            return;
        }

        setIsUpdatingStatus(true);
        setError("");

        try {

            const token = getAuthToken();

            const response = await fetch(
                `${API_URL}/api/orders/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update order status"
                );
            }


            //Reload complete Order
            const updatedOrder = await getBakeryOrder(id);

            setOrder(updatedOrder);

            //Close final status confirmation modal
            setStatusConfirmation(null);

        } catch (error) {

            setError(error.message);

        } finally {

            setIsUpdatingStatus(false);
        }
    }


    //Updates a Manual Payment after Owner confirmation
    async function updateManualPayment(paymentId, action) {

        setIsUpdatingPayment(true);
        setError("");

        try {

            //Get Bakery Owner token
            const token = getAuthToken();


            //Choose receive or revert endpoint
            const endpoint =
                action === "receive"
                    ? `${API_URL}/api/payments/${paymentId}/receive`
                    : `${API_URL}/api/payments/${paymentId}/revert`;


            //Update Manual Payment
            const response = await fetch(
                endpoint,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();


            //Stop if Payment could not be updated
            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update payment"
                );
            }


            //Close confirmation modal
            setPaymentConfirmation(null);


            //Reload complete Order so Payment and totals update
            const updatedOrder = await getBakeryOrder(id);

            setOrder(updatedOrder);

        } catch (error) {

            setError(error.message);

        } finally {

            setIsUpdatingPayment(false);
        }
    }


    //Get all Payments belonging to this Order
    const payments =
        order?.payments || [];

    //Checks whether this Order already has money received
    const hasReceivedPayment =
        Number(
            order?.amount_paid || 0
        ) > 0;

    return (

        <div className="bakery-order-details-page">


            {/* Order loading state */}
            {isLoading && (

                <div className="bakery-order-details-loading">

                    <LoaderCircle
                        size={26}
                        strokeWidth={1.8}
                        className="bakery-order-details-loading-icon"
                    />

                    <div>

                        <strong>
                            Loading order
                        </strong>

                        <span>
                            Getting the latest Order details...
                        </span>

                    </div>

                </div>

            )}


            {/* Order error state */}
            {!isLoading && error && (

                <p className="bakery-order-details-error">
                    {error}
                </p>

            )}


            {/* Order details */}
            {!isLoading &&
                !error &&
                order && (

                    <>

                        {/* Order heading */}
                        <div className="bakery-order-details-heading">

                            <div>

                                {/* Orders breadcrumb */}
                                <div className="bakery-order-details-breadcrumb">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/bakery/orders")
                                        }
                                    >
                                        Orders
                                    </button>

                                    <span>/</span>

                                    <strong>
                                        {order.order_number}
                                    </strong>

                                </div>


                                {/* Order number and status badges */}
                                <div className="d-flex flex-wrap align-items-center gap-2">

                                    <h1 className="mb-0">
                                        {order.order_number}
                                    </h1>

                                    <span
                                        className={`bakery-order-status bakery-order-status-${order.status}`}
                                    >
                                        {order.status}
                                    </span>

                                    <span
                                        className={`bakery-orders-payment bakery-orders-payment-${order.payment_status}`}
                                    >
                                        {order.payment_status.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>

                                </div>

                            </div>


                            {/* Customer contact actions */}
                            {(order.customer_id?.email ||
                                order.customer_id?.phone_number) && (

                                    <div className="bakery-order-details-contact-wrapper">

                                        <button
                                            type="button"
                                            className="bakery-order-details-contact-button"
                                            onClick={() =>
                                                setIsContactMenuOpen(
                                                    !isContactMenuOpen
                                                )
                                            }
                                        >

                                            <ContactRound
                                                size={16}
                                                strokeWidth={1.8}
                                            />

                                            Contact customer

                                        </button>


                                        {/* Contact options */}
                                        {isContactMenuOpen && (

                                            <div className="bakery-order-details-contact-menu">


                                                {/* Call Customer */}
                                                {order.customer_id?.phone_number && (

                                                    <a
                                                        href={`tel:${order.customer_id.phone_number}`}
                                                        onClick={() =>
                                                            setIsContactMenuOpen(false)
                                                        }
                                                    >
                                                        Call customer

                                                        <span>
                                                            {order.customer_id.phone_number}
                                                        </span>

                                                    </a>

                                                )}


                                                {/* Email Customer */}
                                                {order.customer_id?.email && (

                                                    <a
                                                        href={`mailto:${order.customer_id.email}?subject=Bakeau Order ${order.order_number}`}
                                                        onClick={() =>
                                                            setIsContactMenuOpen(false)
                                                        }
                                                    >
                                                        Email customer

                                                        <span>
                                                            {order.customer_id.email}
                                                        </span>

                                                    </a>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                )}

                        </div>


                        <div className="row g-4">


                            {/* Main Order information */}
                            <div className="col-12 col-xl-8">


                                {/* Customer information */}
                                <section className="bakery-order-details-card">

                                    <div className="bakery-order-details-card-header">

                                        <h2>
                                            Customer
                                        </h2>

                                    </div>


                                    <div className="bakery-order-details-card-body">

                                        <div className="bakery-order-details-customer-row">

                                            <div className="bakery-order-details-icon">

                                                <User
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />

                                            </div>


                                            <div>

                                                <strong>
                                                    {order.customer_id
                                                        ? `${order.customer_id.first_name} ${order.customer_id.last_name}`
                                                        : "Customer"
                                                    }
                                                </strong>


                                                {/* Customer email */}
                                                {order.customer_id?.email && (

                                                    <div className="bakery-order-details-customer-email">

                                                        <Mail
                                                            size={14}
                                                            strokeWidth={1.8}
                                                        />

                                                        <span>
                                                            {order.customer_id.email}
                                                        </span>

                                                    </div>

                                                )}


                                                {/* Customer phone number */}
                                                {order.customer_id?.phone_number && (

                                                    <div className="bakery-order-details-customer-email">

                                                        <span>
                                                            {order.customer_id.phone_number}
                                                        </span>

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </section>


                                {/* Ordered Products */}
                                <section className="bakery-order-details-card">

                                    <div className="bakery-order-details-card-header">

                                        <h2>
                                            Order details
                                        </h2>

                                        <span>
                                            {order.items?.length || 0}{" "}
                                            {order.items?.length === 1
                                                ? "item"
                                                : "items"
                                            }
                                        </span>

                                    </div>


                                    <div className="bakery-order-details-card-body p-0">

                                        {order.items?.map((item) => (

                                            <div
                                                key={item._id}
                                                className="bakery-order-details-item"
                                            >


                                                {/* Main Product information */}
                                                <div className="bakery-order-details-item-main">

                                                    <div>

                                                        <strong className="bakery-order-details-product-name">
                                                            {item.product_name}
                                                        </strong>

                                                        <div className="bakery-order-details-item-meta">
                                                            Quantity: {item.quantity}
                                                        </div>

                                                    </div>


                                                    {/* Base Product subtotal */}
                                                    <strong>
                                                        $
                                                        {(
                                                            item.base_price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </strong>

                                                </div>


                                                {/* Product Customizations */}
                                                {item.customizations?.length > 0 && (

                                                    <div className="bakery-order-details-customizations">

                                                        {item.customizations.map(
                                                            (customization) => (

                                                                <div
                                                                    key={customization._id}
                                                                    className="bakery-order-details-customization"
                                                                >

                                                                    <span>
                                                                        {customization.group_name}
                                                                    </span>

                                                                    <strong>
                                                                        {customization.option_name}

                                                                        {customization.additional_price > 0 &&
                                                                            ` (+$${customization.additional_price.toFixed(2)})`
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )}


                                                {/* Final Product total */}
                                                <div className="bakery-order-details-item-total">

                                                    <span>
                                                        Item total
                                                    </span>

                                                    <strong>
                                                        ${item.item_total.toFixed(2)}
                                                    </strong>

                                                </div>


                                                {/* Product special notes */}
                                                {item.special_notes && (

                                                    <div className="bakery-order-details-note">

                                                        <span>
                                                            Customer note
                                                        </span>

                                                        <p>
                                                            {item.special_notes}
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        ))}

                                    </div>

                                </section>


                                {/* Order Activity history */}
                                <section className="bakery-order-details-card">

                                    <div className="bakery-order-details-card-header">

                                        <h2>
                                            Activity
                                        </h2>

                                    </div>


                                    <div className="bakery-order-details-card-body">

                                        {order.activities?.length > 0 ? (

                                            <div className="bakery-order-details-activity">

                                                {order.activities.map((activity) => (

                                                    <div
                                                        key={activity._id}
                                                        className="bakery-order-details-activity-item"
                                                    >

                                                        <span className="bakery-order-details-activity-dot"></span>

                                                        <div>

                                                            <strong>
                                                                {activity.description}
                                                            </strong>

                                                            <span>
                                                                {new Date(
                                                                    activity.created_at
                                                                ).toLocaleString(
                                                                    "en-CA",
                                                                    {
                                                                        dateStyle: "medium",
                                                                        timeStyle: "short"
                                                                    }
                                                                )}
                                                            </span>

                                                        </div>

                                                    </div>

                                                ))}

                                            </div>

                                        ) : (

                                            <p className="mb-0">
                                                No Order activity recorded yet.
                                            </p>

                                        )}

                                    </div>

                                </section>

                            </div>


                            {/* Order summary and actions */}
                            <div className="col-12 col-xl-4">


                                {/* Order summary */}
                                <section className="bakery-order-details-card">

                                    <div className="bakery-order-details-card-header">

                                        <h2>
                                            Order summary
                                        </h2>

                                    </div>


                                    {/* Products included in the Order */}
                                    <div className="bakery-order-details-summary-products">

                                        {order.items?.map((item) => (

                                            <div
                                                key={item._id}
                                                className="bakery-order-details-summary-product-group"
                                            >


                                                {/* Product heading */}
                                                <div className="bakery-order-details-summary-product">

                                                    <span>
                                                        {item.quantity} × {item.product_name}
                                                    </span>

                                                    <strong>
                                                        $
                                                        {(
                                                            item.base_price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </strong>

                                                </div>


                                                {/* Product Customizations */}
                                                {item.customizations?.length > 0 && (

                                                    <div className="bakery-order-details-summary-customizations">

                                                        {item.customizations.map(
                                                            (customization) => (

                                                                <div
                                                                    key={customization._id}
                                                                    className="bakery-order-details-summary-customization"
                                                                >

                                                                    <span>
                                                                        {customization.option_name}
                                                                    </span>

                                                                    <span>
                                                                        {customization.additional_price > 0
                                                                            ? `+$${customization.additional_price.toFixed(2)}`
                                                                            : "$0.00"
                                                                        }
                                                                    </span>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )}


                                                {/* Final item total */}
                                                <div className="bakery-order-details-summary-item-total">

                                                    <span>
                                                        Item total
                                                    </span>

                                                    <strong>
                                                        ${item.item_total.toFixed(2)}
                                                    </strong>

                                                </div>

                                            </div>

                                        ))}

                                    </div>


                                    {/* Order totals */}
                                    <div className="bakery-order-details-card-body">


                                        {/* Order total */}
                                        <div className="bakery-order-details-summary-row">

                                            <span>
                                                Total
                                            </span>

                                            <strong>
                                                ${order.total_price.toFixed(2)}
                                            </strong>

                                        </div>


                                        {/* Amount currently required */}
                                        <div className="bakery-order-details-summary-row">

                                            <span>
                                                Amount due now
                                            </span>

                                            <strong>
                                                ${order.amount_due_now.toFixed(2)}
                                            </strong>

                                        </div>


                                        {/* Amount already paid */}
                                        <div className="bakery-order-details-summary-row">

                                            <span>
                                                Amount paid
                                            </span>

                                            <strong>
                                                ${order.amount_paid.toFixed(2)}
                                            </strong>

                                        </div>


                                        {/* Remaining balance */}
                                        <div className="bakery-order-details-summary-total">

                                            <span>
                                                Remaining
                                            </span>

                                            <strong>
                                                $
                                                {Math.max(
                                                    0,
                                                    order.total_price -
                                                    order.amount_paid
                                                ).toFixed(2)}
                                            </strong>

                                        </div>

                                    </div>

                                </section>


                                {/* Pickup details */}
                                <section className="bakery-order-details-card">

                                    <div className="bakery-order-details-card-header">

                                        <h2>
                                            Pickup
                                        </h2>

                                    </div>


                                    <div className="bakery-order-details-card-body">


                                        {/* Pickup date */}
                                        <div className="bakery-order-details-info-row">

                                            <CalendarDays
                                                size={18}
                                                strokeWidth={1.8}
                                            />

                                            <div>

                                                <span>
                                                    Date
                                                </span>

                                                <strong>
                                                    {new Date(
                                                        order.pickup_date
                                                    ).toLocaleDateString(
                                                        "en-CA",
                                                        {
                                                            weekday: "long",
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            timeZone: "UTC"
                                                        }
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* Pickup time */}
                                        <div className="bakery-order-details-info-row">

                                            <Clock3
                                                size={18}
                                                strokeWidth={1.8}
                                            />

                                            <div>

                                                <span>
                                                    Time
                                                </span>

                                                <strong>
                                                    {order.pickup_time}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                </section>


                                {/* Order status and actions */}
                                <section className="bakery-order-details-card">

                                    <div className="bakery-order-details-card-header">

                                        <h2>
                                            Status & Actions
                                        </h2>

                                    </div>


                                    <div className="bakery-order-details-card-body">


                                        {/* Pending Order requires a Bakery decision */}
                                        {order.status === "pending" && (

                                            <div className="bakery-order-details-pending-actions">

                                                <div className="bakery-order-details-pending-message">

                                                    <strong>
                                                        This Order is waiting for your response.
                                                    </strong>

                                                    <p className="mb-0">
                                                        Review the Order details before accepting it.
                                                        Accepting the Order confirms it with the Customer.
                                                    </p>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="bakery-order-details-primary-action"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() =>
                                                        requestOrderStatus("confirmed")
                                                    }
                                                >

                                                    <Check
                                                        size={16}
                                                        strokeWidth={2}
                                                    />

                                                    Accept order

                                                </button>


                                                {/* Only allow cancellation before a Payment is received */}
                                                {!hasReceivedPayment ? (

                                                    <button
                                                        type="button"
                                                        className="bakery-order-details-danger-action"
                                                        disabled={isUpdatingStatus}
                                                        onClick={() =>
                                                            requestOrderStatus("cancelled")
                                                        }
                                                    >
                                                        Cancel order
                                                    </button>

                                                ) : (

                                                    <p className="mb-0">
                                                        This Order has a payment attached and cannot be cancelled until the payment is refunded.
                                                    </p>

                                                )}

                                            </div>

                                        )}


                                        {/* Accepted Orders */}
                                        {order.status !== "pending" &&
                                            order.status !== "completed" &&
                                            order.status !== "cancelled" && (

                                                <>


                                                    {/* Order status control */}
                                                    <div className="bakery-order-details-control-group">

                                                        <label htmlFor="orderStatus">
                                                            Order status
                                                        </label>

                                                        <select
                                                            id="orderStatus"
                                                            className="form-select bakery-order-details-status-select"
                                                            value={order.status}
                                                            disabled={isUpdatingStatus}
                                                            onChange={(event) =>
                                                                requestOrderStatus(
                                                                    event.target.value
                                                                )
                                                            }
                                                        >

                                                            {/* Current status */}
                                                            <option value={order.status}>
                                                                {order.status === "confirmed"
                                                                    ? "Confirmed"
                                                                    : order.status === "preparing"
                                                                        ? "Preparing"
                                                                        : "Ready for pickup"
                                                                }
                                                            </option>

                                                            {/* Only show the next legal workflow status */}
                                                            {order.status === "confirmed" && (
                                                                <option value="preparing">
                                                                    Preparing
                                                                </option>
                                                            )}

                                                            {order.status === "preparing" && (
                                                                <option value="ready">
                                                                    Ready for pickup
                                                                </option>
                                                            )}

                                                            {order.status === "ready" && (
                                                                <option value="completed">
                                                                    Completed
                                                                </option>
                                                            )}

                                                            {/* Only allow cancellation before a Payment is received */}
                                                            {!hasReceivedPayment && (

                                                                <option value="cancelled">
                                                                    Cancelled
                                                                </option>

                                                            )}

                                                        </select>


                                                        <span className="bakery-order-details-control-help">
                                                            Changing the Order status updates what
                                                            the Customer sees in their Bakeau account.
                                                        </span>

                                                    </div>


                                                    {/* Quick workflow actions */}
                                                    <div className="bakery-order-details-quick-actions">

                                                        <div className="bakery-order-details-quick-actions-heading">

                                                            <strong>
                                                                Next action
                                                            </strong>

                                                            <span>
                                                                Move the Order through its normal workflow.
                                                            </span>

                                                        </div>


                                                        {/* Confirmed Order */}
                                                        {order.status === "confirmed" && (

                                                            <button
                                                                type="button"
                                                                className="bakery-order-details-primary-action"
                                                                disabled={isUpdatingStatus}
                                                                onClick={() =>
                                                                    requestOrderStatus("preparing")
                                                                }
                                                            >
                                                                Start preparing
                                                            </button>

                                                        )}


                                                        {/* Preparing Order */}
                                                        {order.status === "preparing" && (

                                                            <button
                                                                type="button"
                                                                className="bakery-order-details-primary-action"
                                                                disabled={isUpdatingStatus}
                                                                onClick={() =>
                                                                    requestOrderStatus("ready")
                                                                }
                                                            >

                                                                <Check
                                                                    size={16}
                                                                    strokeWidth={2}
                                                                />

                                                                Mark ready for pickup

                                                            </button>

                                                        )}


                                                        {/* Ready Order */}
                                                        {order.status === "ready" && (

                                                            <button
                                                                type="button"
                                                                className="bakery-order-details-primary-action"
                                                                disabled={isUpdatingStatus}
                                                                onClick={() =>
                                                                    requestOrderStatus("completed")
                                                                }
                                                            >

                                                                <Check
                                                                    size={16}
                                                                    strokeWidth={2}
                                                                />

                                                                Complete order

                                                            </button>

                                                        )}


                                                        {/* Cancel accepted Order */}
                                                        {/* Only allow cancellation before a Payment is received */}
                                                        {!hasReceivedPayment ? (

                                                            <button
                                                                type="button"
                                                                className="bakery-order-details-danger-action"
                                                                disabled={isUpdatingStatus}
                                                                onClick={() =>
                                                                    requestOrderStatus("cancelled")
                                                                }
                                                            >
                                                                Cancel order
                                                            </button>

                                                        ) : (

                                                            <p className="mb-0">
                                                                This Order has a payment attached and cannot be cancelled until the payment is refunded.
                                                            </p>

                                                        )}

                                                    </div>

                                                </>

                                            )
                                        }


                                        {/* Completed Order */}
                                        {order.status === "completed" && (

                                            <div>

                                                <div className="bakery-order-details-final-status">

                                                    <Check
                                                        size={17}
                                                        strokeWidth={2}
                                                    />

                                                    Order completed

                                                </div>

                                                <span className="bakery-order-details-control-help">
                                                    This is a final status and cannot be changed.
                                                </span>

                                            </div>

                                        )}


                                        {/* Cancelled Order */}
                                        {order.status === "cancelled" && (

                                            <div>

                                                <div className="bakery-order-details-final-status cancelled">

                                                    <X
                                                        size={17}
                                                        strokeWidth={2}
                                                    />

                                                    Order cancelled

                                                </div>

                                                <span className="bakery-order-details-control-help">
                                                    This is a final status and cannot be changed.
                                                </span>

                                            </div>

                                        )}


                                        {/* Payment */}
                                        <div className="bakery-order-details-payment-section">

                                            <div className="bakery-order-details-control-group mb-0">

                                                <label>
                                                    Payment
                                                </label>


                                                {/* Current Order Payment status */}
                                                <div className="bakery-order-details-payment-display">

                                                    <span
                                                        className={`bakery-orders-payment bakery-orders-payment-${order.payment_status}`}
                                                    >
                                                        {order.payment_status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>

                                                </div>


                                                {/* Order Payments */}
                                                {payments.length > 0 ? (

                                                    <div className="d-flex flex-column gap-3">

                                                        {payments.map((payment) => (

                                                            <div
                                                                key={payment._id}
                                                                className="bakery-order-details-manual-payment"
                                                            >

                                                                {/* Payment information */}
                                                                <div className="bakery-order-details-payment-info">

                                                                    <div>

                                                                        <span>
                                                                            Payment method
                                                                        </span>

                                                                        <strong>
                                                                            {payment.payment_method}
                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            Payment type
                                                                        </span>

                                                                        <strong>
                                                                            {payment.payment_type}
                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            Amount
                                                                        </span>

                                                                        <strong>
                                                                            ${Number(payment.amount).toFixed(2)}
                                                                        </strong>

                                                                    </div>

                                                                </div>


                                                                {/* Pending Manual Payment */}
                                                                {payment.payment_method === "Manual" &&
                                                                    payment.payment_status === "Pending" && (

                                                                        <div className="bakery-order-details-payment-pending">

                                                                            <div>

                                                                                <strong>
                                                                                    Pending verification
                                                                                </strong>

                                                                                <span>
                                                                                    Confirm this payment only after
                                                                                    you have received it outside Bakeau.
                                                                                </span>

                                                                            </div>


                                                                            <button
                                                                                type="button"
                                                                                className="bakery-order-details-payment-button"
                                                                                disabled={isUpdatingPayment}
                                                                                onClick={() =>
                                                                                    setPaymentConfirmation({
                                                                                        action: "receive",
                                                                                        paymentId: payment._id,
                                                                                        amount: payment.amount
                                                                                    })
                                                                                }
                                                                            >
                                                                                Mark ${Number(
                                                                                    payment.amount
                                                                                ).toFixed(2)} as received
                                                                            </button>

                                                                        </div>

                                                                    )}


                                                                {/* Received Payment */}
                                                                {payment.payment_status === "Received" && (

                                                                    <div className="bakery-order-details-payment-received-wrapper">

                                                                        <div className="bakery-order-details-payment-received">

                                                                            <div className="bakery-order-details-payment-received-icon">

                                                                                <Check
                                                                                    size={16}
                                                                                    strokeWidth={2.5}
                                                                                />

                                                                            </div>


                                                                            <div>

                                                                                <strong>
                                                                                    Payment received
                                                                                </strong>


                                                                                {payment.received_at && (

                                                                                    <span>
                                                                                        {new Date(
                                                                                            payment.received_at
                                                                                        ).toLocaleString(
                                                                                            "en-CA",
                                                                                            {
                                                                                                dateStyle: "medium",
                                                                                                timeStyle: "short"
                                                                                            }
                                                                                        )}
                                                                                    </span>

                                                                                )}

                                                                            </div>

                                                                        </div>


                                                                        {/* Only Manual Payments can be reverted */}
                                                                        {payment.payment_method === "Manual" && (

                                                                            <button
                                                                                type="button"
                                                                                className="bakery-order-details-payment-revert"
                                                                                disabled={isUpdatingPayment}
                                                                                onClick={() =>
                                                                                    setPaymentConfirmation({
                                                                                        action: "revert",
                                                                                        paymentId: payment._id,
                                                                                        amount: payment.amount
                                                                                    })
                                                                                }
                                                                            >
                                                                                Mark as pending again
                                                                            </button>

                                                                        )}

                                                                    </div>

                                                                )}


                                                                {/* Pending Stripe Payment */}
                                                                {payment.payment_method === "Stripe" &&
                                                                    payment.payment_status === "Pending" && (

                                                                        <div className="bakery-order-details-payment-pending">

                                                                            <div>

                                                                                <strong>
                                                                                    Stripe payment pending
                                                                                </strong>

                                                                                <span>
                                                                                    Waiting for Stripe to confirm
                                                                                    this payment.
                                                                                </span>

                                                                            </div>

                                                                        </div>

                                                                    )}


                                                                {/* Failed Payment */}
                                                                {payment.payment_status === "Failed" && (

                                                                    <div className="alert alert-danger mb-0 mt-3">

                                                                        Payment failed.

                                                                    </div>

                                                                )}

                                                            </div>

                                                        ))}

                                                    </div>

                                                ) : (

                                                    <span className="bakery-order-details-control-help">
                                                        No payment has been created for this Order.
                                                    </span>

                                                )}

                                            </div>

                                        </div>


                                        {/* Status update progress */}
                                        {isUpdatingStatus && (

                                            <p className="bakery-order-details-updating mb-0">
                                                Updating Order status...
                                            </p>

                                        )}

                                    </div>

                                </section>

                            </div>

                        </div>

                    </>

                )}


            {/* Final Order status confirmation modal */}
            {statusConfirmation && (

                <>

                    {/* Modal */}
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div className="modal-content border-0 shadow rounded-4">


                                {/* Modal heading */}
                                <div className="modal-header border-0 pb-0">

                                    <h5 className="modal-title">
                                        {statusConfirmation === "completed"
                                            ? "Complete this Order?"
                                            : "Cancel this Order?"
                                        }
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        disabled={isUpdatingStatus}
                                        onClick={() =>
                                            setStatusConfirmation(null)
                                        }
                                    ></button>

                                </div>


                                {/* Modal content */}
                                <div className="modal-body">

                                    <p>
                                        {statusConfirmation === "completed"
                                            ? "Are you sure you want to mark this Order as completed?"
                                            : "Are you sure you want to cancel this Order?"
                                        }
                                    </p>

                                    <div
                                        className={
                                            statusConfirmation === "completed"
                                                ? "alert alert-success mb-0"
                                                : "alert alert-warning mb-0"
                                        }
                                        role="alert"
                                    >
                                        The Customer will be notified and this action cannot be undone.
                                    </div>

                                </div>


                                {/* Modal actions */}
                                <div className="modal-footer border-0 pt-0 d-flex flex-column flex-sm-row gap-2">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={isUpdatingStatus}
                                        onClick={() =>
                                            setStatusConfirmation(null)
                                        }
                                    >
                                        Go back
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            statusConfirmation === "completed"
                                                ? "btn btn-success"
                                                : "btn btn-danger"
                                        }
                                        disabled={isUpdatingStatus}
                                        onClick={() =>
                                            updateOrderStatus(
                                                statusConfirmation
                                            )
                                        }
                                    >
                                        {isUpdatingStatus
                                            ? "Updating..."
                                            : statusConfirmation === "completed"
                                                ? "Yes, complete order"
                                                : "Yes, cancel order"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Modal background */}
                    <div className="modal-backdrop show"></div>

                </>

            )}


            {/* Manual Payment confirmation modal */}
            {paymentConfirmation && (

                <>

                    {/* Modal */}
                    <div
                        className="modal d-block bakery-payment-confirm-modal-wrapper"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div className="modal-content bakery-payment-confirm-modal">


                                {/* Modal heading */}
                                <div className="modal-header">

                                    <h5 className="modal-title">

                                        {paymentConfirmation.action === "receive"
                                            ? "Confirm payment received?"
                                            : "Change payment back to pending?"
                                        }

                                    </h5>


                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        disabled={isUpdatingPayment}
                                        onClick={() =>
                                            setPaymentConfirmation(null)
                                        }
                                    ></button>

                                </div>


                                {/* Modal content */}
                                <div className="modal-body">

                                    {paymentConfirmation.action === "receive" ? (

                                        <>

                                            <p>
                                                You are about to confirm that you received:
                                            </p>

                                            <strong className="bakery-payment-confirm-amount">
                                                ${paymentConfirmation.amount.toFixed(2)}
                                            </strong>

                                            <p className="bakery-payment-confirm-warning mb-0">
                                                Only confirm this after you have verified that the Interac e-Transfer was received.
                                            </p>

                                        </>

                                    ) : (

                                        <>

                                            <p>
                                                This payment is currently marked as received.
                                            </p>

                                            <strong className="bakery-payment-confirm-amount">
                                                ${paymentConfirmation.amount.toFixed(2)}
                                            </strong>

                                            <p className="bakery-payment-confirm-warning mb-0">
                                                Changing it back to pending will update the Order's amount paid and Payment status.
                                            </p>

                                        </>

                                    )}

                                </div>


                                {/* Modal actions */}
                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={isUpdatingPayment}
                                        onClick={() =>
                                            setPaymentConfirmation(null)
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            paymentConfirmation.action === "receive"
                                                ? "btn bakery-payment-confirm-button"
                                                : "btn btn-outline-danger"
                                        }
                                        disabled={isUpdatingPayment}
                                        onClick={() =>
                                            updateManualPayment(
                                                paymentConfirmation.paymentId,
                                                paymentConfirmation.action
                                            )
                                        }
                                    >
                                        {isUpdatingPayment
                                            ? "Updating..."
                                            : paymentConfirmation.action === "receive"
                                                ? "Yes, mark received"
                                                : "Mark as pending"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Modal background */}
                    <div className="modal-backdrop show"></div>

                </>

            )}

        </div>

    );
}