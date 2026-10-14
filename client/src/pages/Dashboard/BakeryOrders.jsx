import API_URL from "../../config/api.js";
//Import React hooks
import { useEffect, useState } from "react";

//Import React Router navigation
import { useNavigate } from "react-router-dom";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Orders page icons
import { Search, LoaderCircle } from "lucide-react";

//Import Orders page styles
import "./styles/Orders.css";


//Displays all Orders belonging to the authenticated Bakery Owner
export default function BakeryOrders() {

    //Used to navigate between Bakery dashboard pages
    const navigate = useNavigate();

    //Stores all Bakery Orders
    const [orders, setOrders] = useState([]);

    //Tracks whether Orders are loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores any Orders loading error
    const [error, setError] = useState("");

    //Stores Order search text
    const [searchTerm, setSearchTerm] = useState("");

    //Stores selected Order status
    const [statusFilter, setStatusFilter] = useState("all");

    //Stores selected Payment status
    const [paymentFilter, setPaymentFilter] = useState("all");

    //Stores starting Order date
    const [fromDate, setFromDate] = useState("");

    //Stores ending Order date
    const [toDate, setToDate] = useState("");


    //Loads Bakery Orders when page opens
    useEffect(() => {

        async function fetchOrders() {

            setIsLoading(true);
            setError("");

            try {

                //Get Bakery Owner token
                const token = getAuthToken();

                //Get Bakery Orders
                const response = await fetch(
                    `${API_URL}/api/orders/bakery`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                //Stop if Orders could not load
                if (!response.ok) {
                    throw new Error(data.message || "Unable to load orders");
                }

                //Store Orders
                setOrders(data.orders || []);

            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }

        fetchOrders();

    }, []);


    //Formats an Order date as YYYY-MM-DD
    function getOrderDate(date) {

        const orderDate = new Date(date);

        const year = orderDate.getFullYear();
        const month = String(orderDate.getMonth() + 1).padStart(2, "0");
        const day = String(orderDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    //Formats Pickup date
    function formatPickupDate(date) {

        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC"
        });
    }


    //Filters Orders using Search, dates, Order status and Payment status
    const filteredOrders = orders.filter((order) => {

        //Customer name used for Search
        const customerName =
            `${order.customer_id?.first_name || ""} ${order.customer_id?.last_name || ""}`
                .toLowerCase();

        //Product names used for Search
        const productNames = order.items
            ?.map((item) => item.product_name || "")
            .join(" ")
            .toLowerCase() || "";

        //Clean Search value
        const searchValue = searchTerm.trim().toLowerCase();

        //Search by Order number, Customer or Product
        const matchesSearch =
            String(order.order_number || "").toLowerCase().includes(searchValue) ||
            customerName.includes(searchValue) ||
            productNames.includes(searchValue);

        //Filter by Order status
        const matchesStatus =
            statusFilter === "all" ||
            order.status === statusFilter;

        //Filter by Payment status
        const matchesPayment =
            paymentFilter === "all" ||
            order.payment_status === paymentFilter;

        //Get date Order was placed
        const orderDate = getOrderDate(order.created_at);

        //Check starting date
        const matchesFromDate =
            !fromDate ||
            orderDate >= fromDate;

        //Check ending date
        const matchesToDate =
            !toDate ||
            orderDate <= toDate;

        //Order must match all active filters
        return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment &&
            matchesFromDate &&
            matchesToDate
        );
    });


    return (

        <div className="bakery-orders-page">

            {/* Orders page heading */}
            <div className="mb-4">

                <h1 className="mb-1">
                    Orders
                </h1>

                <p className="mb-0 bakery-orders-description">
                    Manage incoming bakery orders and track their progress.
                </p>

            </div>


            {/* Orders filters */}
            <div className="row g-2 align-items-end mb-3">

                {/* Orders Search */}
                <div className="col-12 col-md-4">

                    <div className="bakery-orders-search">

                        <Search
                            size={16}
                            strokeWidth={1.8}
                            className="bakery-orders-search-icon"
                        />

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search orders, customers..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />

                    </div>

                </div>


                {/* Order status filter */}
                <div className="col-6 col-md-auto">

                    <select
                        className="form-select bakery-orders-filter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                </div>


                {/* Payment status filter */}
                <div className="col-6 col-md-auto">

                    <select
                        className="form-select bakery-orders-filter"
                        value={paymentFilter}
                        onChange={(event) => setPaymentFilter(event.target.value)}
                    >
                        <option value="all">All payments</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partially_paid">Partially paid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                    </select>

                </div>


                {/* Starting Order date */}
                <div className="col-6 col-md-auto">

                    <label className="bakery-orders-date-label">
                        From
                    </label>

                    <input
                        type="date"
                        className="form-control bakery-orders-filter"
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                    />

                </div>


                {/* Ending Order date */}
                <div className="col-6 col-md-auto">

                    <label className="bakery-orders-date-label">
                        To
                    </label>

                    <input
                        type="date"
                        className="form-control bakery-orders-filter"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(event) => setToDate(event.target.value)}
                    />

                </div>


                {/* Clears all Order filters */}
                <div className="col-12 col-md-auto">

                    <button
                        type="button"
                        className="btn bakery-orders-clear-filter"
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setPaymentFilter("all");
                            setFromDate("");
                            setToDate("");
                        }}
                    >
                        Clear filters
                    </button>

                </div>

            </div>


            {/* Displays number of matching Orders */}
            {!isLoading && !error && (

                <p className="bakery-orders-count">

                    {filteredOrders.length}{" "}
                    {filteredOrders.length === 1 ? "order" : "orders"}

                </p>

            )}


            {/* Orders loading state */}
            {isLoading && (

                <div className="bakery-orders-loading">

                    <LoaderCircle
                        size={26}
                        strokeWidth={1.8}
                        className="bakery-orders-loading-icon"
                    />

                    <div>

                        <strong>
                            Loading orders
                        </strong>

                        <span>
                            Getting the latest bakery orders...
                        </span>

                    </div>

                </div>

            )}


            {/* Orders error state */}
            {!isLoading && error && (

                <p className="bakery-orders-error">
                    {error}
                </p>

            )}


            {/* No Orders yet */}
            {!isLoading &&
                !error &&
                orders.length === 0 && (

                    <div className="bakery-orders-empty-state">

                        <h2>
                            No orders yet
                        </h2>

                        <p className="mb-0">
                            New customer orders will appear here.
                        </p>

                    </div>

                )}


            {/* No Orders match selected filters */}
            {!isLoading &&
                !error &&
                orders.length > 0 &&
                filteredOrders.length === 0 && (

                    <div className="bakery-orders-empty-state">

                        <h2>
                            No orders found
                        </h2>

                        <p className="mb-0">
                            Try changing your search or selected filters.
                        </p>

                    </div>

                )}


            {/* Orders table */}
            {!isLoading &&
                !error &&
                filteredOrders.length > 0 && (

                    <div className="bakery-dashboard-section-card overflow-hidden">

                        <div className="table-responsive">

                            <table className="table mb-0 bakery-dashboard-table bakery-orders-table">

                                <thead>

                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Pickup</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredOrders.map((order) => (

                                        <tr key={order._id}>

                                            {/* Order number */}
                                            <td>

                                                <strong>
                                                    {order.order_number}
                                                </strong>

                                            </td>


                                            {/* Customer information */}
                                            <td>

                                                {order.customer_id
                                                    ? `${order.customer_id.first_name} ${order.customer_id.last_name}`
                                                    : "Customer"
                                                }

                                            </td>


                                            {/* Ordered Products */}
                                            <td>

                                                {order.items?.length > 0
                                                    ? order.items
                                                        .map((item) => item.product_name)
                                                        .join(", ")
                                                    : "-"
                                                }

                                            </td>


                                            {/* Pickup information */}
                                            <td>

                                                {formatPickupDate(order.pickup_date)}

                                                <div className="bakery-orders-pickup-time">
                                                    {order.pickup_time}
                                                </div>

                                            </td>


                                            {/* Payment status */}
                                            <td>

                                                <span
                                                    className={`bakery-orders-payment bakery-orders-payment-${order.payment_status}`}
                                                >
                                                    {order.payment_status?.replace("_", " ")}
                                                </span>

                                            </td>


                                            {/* Order status */}
                                            <td>

                                                <span
                                                    className={`bakery-order-status bakery-order-status-${order.status}`}
                                                >
                                                    {order.status}
                                                </span>

                                            </td>


                                            {/* Order total */}
                                            <td>

                                                <strong>
                                                    ${Number(order.total_price || 0).toFixed(2)}
                                                </strong>

                                            </td>


                                            {/* Order details button */}
                                            <td className="text-end">

                                                <button
                                                    type="button"
                                                    className="bakery-dashboard-table-action"
                                                    onClick={() => navigate(`/bakery/orders/${order._id}`)}
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

        </div>
    );
}