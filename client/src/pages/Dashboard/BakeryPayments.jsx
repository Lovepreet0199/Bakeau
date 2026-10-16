//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router navigation
import {
    useNavigate
} from "react-router-dom";

//Import API URL
import API_URL from "../../config/api.js";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage";

//Import Payments styles
import "./styles/BakeryPayments.css";


//Displays Bakery payment information
export default function BakeryPayments() {

    //Used to open Bakery Order details
    const navigate = useNavigate();


    //Stores Bakery Orders
    const [orders, setOrders] =
        useState([]);

    //Tracks loading state
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores loading errors
    const [error, setError] =
        useState("");


    //Loads Bakery Orders when the page opens
    useEffect(() => {

        async function loadPayments() {

            try {

                setIsLoading(true);
                setError("");


                //Get logged-in Bakery Owner token
                const token =
                    getAuthToken();


                //Get all Orders for the Bakery Owner
                const response =
                    await fetch(
                        `${API_URL}/api/orders/bakery`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                //Stop if Orders could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load payment information."
                    );
                }


                //Store Bakery Orders
                setOrders(
                    data.orders || []
                );


            } catch (error) {

                setError(
                    error.message
                );


            } finally {

                setIsLoading(false);
            }
        }


        loadPayments();

    }, []);


    //Calculate total money recorded as paid
    const totalCollected =
        orders.reduce(
            (total, order) =>
                total +
                Number(
                    order.amount_paid || 0
                ),
            0
        );


    //Calculate total amount still owing
    const totalOutstanding =
        orders.reduce(
            (total, order) => {

                //Do not count cancelled Orders
                if (
                    order.status ===
                    "cancelled"
                ) {
                    return total;
                }


                const orderTotal =
                    Number(
                        order.total_price || 0
                    );

                const amountPaid =
                    Number(
                        order.amount_paid || 0
                    );


                return (
                    total +
                    Math.max(
                        orderTotal -
                        amountPaid,
                        0
                    )
                );
            },
            0
        );


    //Count fully paid Orders
    const paidOrders =
        orders.filter(
            (order) =>
                order.payment_status ===
                "paid"
        ).length;


    //Count Orders that are not fully paid
    const unpaidOrders =
        orders.filter(
            (order) =>
                order.payment_status !==
                "paid" &&
                order.status !==
                "cancelled"
        ).length;


    //Sort Orders newest first
    const sortedOrders =
        [...orders].sort(
            (
                firstOrder,
                secondOrder
            ) =>
                new Date(
                    secondOrder.created_at
                ) -
                new Date(
                    firstOrder.created_at
                )
        );


    //Formats money as Canadian dollars
    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency: "CAD"
            }
        ).format(
            Number(amount || 0)
        );
    }


    //Formats the Order date
    function formatOrderDate(date) {

        if (!date) {
            return "—";
        }


        return new Intl.DateTimeFormat(
            "en-CA",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        ).format(
            new Date(date)
        );
    }


    //Displays the Customer's name
    function getCustomerName(order) {

        const firstName =
            order.customer_id?.first_name ||
            order.contact_first_name ||
            "";

        const lastName =
            order.customer_id?.last_name ||
            order.contact_last_name ||
            "";


        return (
            `${firstName} ${lastName}`.trim() ||
            "Customer"
        );
    }


    //Displays the correct Order status text
    function getOrderStatusLabel(status) {

        const statusLabels = {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "In Progress",
            ready: "Ready for Pickup",
            completed: "Completed",
            cancelled: "Cancelled"
        };


        return (
            statusLabels[status] ||
            status
        );
    }


    //Displays the correct Payment status text
    function getPaymentStatusLabel(status) {

        const statusLabels = {
            unpaid: "Unpaid",
            partially_paid: "Partially Paid",
            paid: "Paid",
            refunded: "Refunded"
        };


        return (
            statusLabels[status] ||
            status
        );
    }


    //Calculates the remaining amount on an Order
    function getRemainingAmount(order) {

        const total =
            Number(
                order.total_price || 0
            );

        const paid =
            Number(
                order.amount_paid || 0
            );


        return Math.max(
            total - paid,
            0
        );
    }


    return (

        <div className="bakery-payments-page">


            {/* Payments page heading */}
            <div className="bakery-payments-heading">

                <div>

                    <h1>
                        Payments
                    </h1>

                    <p>
                        View bakery payment activity
                        and order payment status.
                    </p>

                </div>

            </div>


            {/* Loading Payments */}
            {isLoading && (

                <div className="bakery-payments-loading">

                    <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading payments...
                        </span>
                    </div>


                    <span>
                        Loading payments...
                    </span>

                </div>

            )}


            {/* Payment loading error */}
            {error && (

                <div
                    className="alert alert-danger bakery-payments-error"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {/* Payments content */}
            {!isLoading && !error && (

                <>

                    {/* Payment summary */}
                    <div className="row g-3 bakery-payments-summary">


                        {/* Total Collected */}
                        <div className="col-12 col-sm-6 col-xl-3">

                            <div className="bakery-payment-summary-card h-100">

                                <p>
                                    Total Collected
                                </p>

                                <h2>
                                    {
                                        formatMoney(
                                            totalCollected
                                        )
                                    }
                                </h2>

                            </div>

                        </div>


                        {/* Outstanding */}
                        <div className="col-12 col-sm-6 col-xl-3">

                            <div className="bakery-payment-summary-card h-100">

                                <p>
                                    Outstanding
                                </p>

                                <h2>
                                    {
                                        formatMoney(
                                            totalOutstanding
                                        )
                                    }
                                </h2>

                            </div>

                        </div>


                        {/* Paid Orders */}
                        <div className="col-12 col-sm-6 col-xl-3">

                            <div className="bakery-payment-summary-card h-100">

                                <p>
                                    Paid Orders
                                </p>

                                <h2>
                                    {paidOrders}
                                </h2>

                            </div>

                        </div>


                        {/* Unpaid Orders */}
                        <div className="col-12 col-sm-6 col-xl-3">

                            <div className="bakery-payment-summary-card h-100">

                                <p>
                                    Unpaid / Partial
                                </p>

                                <h2>
                                    {unpaidOrders}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Payment activity */}
                    <div className="bakery-payments-card">

                        {/* Payment activity heading */}
                        <div className="bakery-payments-card-heading">

                            <div>

                                <h2>
                                    Payment activity
                                </h2>

                                <p>
                                    View payment progress
                                    for your bakery orders.
                                </p>

                            </div>

                        </div>


                        {/* Payments table */}
                        <div className="table-responsive">

                            <table className="table bakery-payments-table">

                                <thead>

                                    <tr>
                                        <th>Order</th>
                                        <th>Order Placed</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Paid</th>
                                        <th>Remaining</th>
                                        <th>Order Status</th>
                                        <th>Payment Status</th>
                                        <th></th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {sortedOrders.map(
                                        (order) => (

                                            <tr key={order._id}>

                                                {/* Order number */}
                                                <td>

                                                    <strong>
                                                        {
                                                            order.order_number
                                                        }
                                                    </strong>

                                                </td>


                                                {/* Order placed date */}
                                                <td>

                                                    {
                                                        formatOrderDate(
                                                            order.created_at
                                                        )
                                                    }

                                                </td>


                                                {/* Customer */}
                                                <td>

                                                    {
                                                        getCustomerName(
                                                            order
                                                        )
                                                    }

                                                </td>


                                                {/* Order total */}
                                                <td>

                                                    {
                                                        formatMoney(
                                                            order.total_price
                                                        )
                                                    }

                                                </td>


                                                {/* Amount paid */}
                                                <td>

                                                    {
                                                        formatMoney(
                                                            order.amount_paid
                                                        )
                                                    }

                                                </td>


                                                {/* Remaining amount */}
                                                <td>

                                                    {
                                                        formatMoney(
                                                            getRemainingAmount(
                                                                order
                                                            )
                                                        )
                                                    }

                                                </td>


                                                {/* Order status */}
                                                <td>

                                                    <span
                                                        className={
                                                            `bakery-order-status ${order.status}`
                                                        }
                                                    >
                                                        {
                                                            getOrderStatusLabel(
                                                                order.status
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* Payment status */}
                                                <td>

                                                    <span
                                                        className={
                                                            `bakery-payment-status ${order.payment_status}`
                                                        }
                                                    >
                                                        {
                                                            getPaymentStatusLabel(
                                                                order.payment_status
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* Order action */}
                                                <td className="text-end">

                                                    <button
                                                        type="button"
                                                        className="bakery-payment-view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/bakery/orders/${order._id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* Empty Payments state */}
                        {orders.length === 0 && (

                            <div className="bakery-payments-empty">

                                <h3>
                                    No payment activity yet
                                </h3>

                                <p>
                                    Order payment information
                                    will appear here.
                                </p>

                            </div>

                        )}

                    </div>

                </>

            )}


        </div>

    );
}