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
        `http://localhost:3000/api/orders/bakery/${orderId}`,
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
                `http://localhost:3000/api/orders/${id}/status`,
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

            //Reload the complete Order so new status and Activity are displayed
            const updatedOrder = await getBakeryOrder(id);

            setOrder(updatedOrder);

        } catch (error) {

            setError(error.message);

        } finally {

            setIsUpdatingStatus(false);
        }
    }


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
                                                : "items"}
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


                                                {/* Final Product total including Customizations */}
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

                                                        {/* Activity timeline marker */}
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

                                                {/* Pending Order explanation */}
                                                <div className="bakery-order-details-pending-message">

                                                    <strong>
                                                        This Order is waiting for your response.
                                                    </strong>

                                                    <p className="mb-0">
                                                        Review the Order details before accepting it.
                                                        Accepting the Order confirms it with the Customer.
                                                    </p>

                                                </div>


                                                {/* Accept Order */}
                                                <button
                                                    type="button"
                                                    className="bakery-order-details-primary-action"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() =>
                                                        updateOrderStatus("confirmed")
                                                    }
                                                >
                                                    <Check
                                                        size={16}
                                                        strokeWidth={2}
                                                    />

                                                    Accept order
                                                </button>


                                                {/* Cancel pending Order */}
                                                <button
                                                    type="button"
                                                    className="bakery-order-details-danger-action"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() =>
                                                        updateOrderStatus("cancelled")
                                                    }
                                                >
                                                    Cancel order
                                                </button>

                                            </div>

                                        )}


                                        {/* Accepted Orders can move through their normal workflow */}
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
                                                                updateOrderStatus(
                                                                    event.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="confirmed">
                                                                Confirmed
                                                            </option>

                                                            <option value="preparing">
                                                                Preparing
                                                            </option>

                                                            <option value="ready">
                                                                Ready for pickup
                                                            </option>

                                                            <option value="completed">
                                                                Completed
                                                            </option>

                                                            <option value="cancelled">
                                                                Cancelled
                                                            </option>
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
                                                                    updateOrderStatus("preparing")
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
                                                                    updateOrderStatus("ready")
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
                                                                    updateOrderStatus("completed")
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
                                                        <button
                                                            type="button"
                                                            className="bakery-order-details-danger-action"
                                                            disabled={isUpdatingStatus}
                                                            onClick={() =>
                                                                updateOrderStatus("cancelled")
                                                            }
                                                        >
                                                            Cancel order
                                                        </button>

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

                                                <button
                                                    type="button"
                                                    className="bakery-order-details-secondary-action"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() =>
                                                        updateOrderStatus("ready")
                                                    }
                                                >
                                                    Reopen order
                                                </button>

                                                <span className="bakery-order-details-control-help">
                                                    Use this if the Order was marked completed by mistake.
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

                                                <button
                                                    type="button"
                                                    className="bakery-order-details-secondary-action"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() =>
                                                        updateOrderStatus("confirmed")
                                                    }
                                                >
                                                    Restore order
                                                </button>

                                                <span className="bakery-order-details-control-help">
                                                    Use this if the Order was cancelled by mistake.
                                                </span>

                                            </div>

                                        )}


                                        {/* Payment status */}
                                        <div className="bakery-order-details-payment-section">

                                            <div className="bakery-order-details-control-group mb-0">

                                                <label>
                                                    Payment status
                                                </label>

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

                                                <span className="bakery-order-details-control-help">
                                                    Payment status is currently read-only and
                                                    will update through the payment system.
                                                </span>

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
                )
            }

        </div>
    );
}