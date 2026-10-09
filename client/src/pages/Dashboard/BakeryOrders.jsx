//Import React hooks
import { useEffect, useState } from "react";

//Import React Router navigation
import { useNavigate } from "react-router-dom";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Orders page icons
import {
    Search,
    LoaderCircle
} from "lucide-react";

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

    //Stores the Order search text
    const [searchTerm, setSearchTerm] = useState("");

    //Stores the selected Order status filter
    const [statusFilter, setStatusFilter] = useState("all");

    //Stores the selected payment status filter
    const [paymentFilter, setPaymentFilter] = useState("all");


    //Load Bakery Orders when the page first opens
    useEffect(() => {

        async function fetchOrders() {

            setIsLoading(true);
            setError("");

            try {

                const token = getAuthToken();

                const response = await fetch(
                    "http://localhost:3000/api/orders/bakery",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load orders"
                    );
                }

                setOrders(data.orders || []);

            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }

        fetchOrders();

    }, []);


    //Filters Orders using search, Order status, and payment status
    const filteredOrders = orders.filter((order) => {

        const customerName =
            `${order.customer_id?.first_name || ""} ${order.customer_id?.last_name || ""}`
                .toLowerCase();

        const productNames =
            order.items
                ?.map((item) => item.product_name)
                .join(" ")
                .toLowerCase() || "";

        const searchValue = searchTerm.toLowerCase();

        const matchesSearch =
            order.order_number
                .toLowerCase()
                .includes(searchValue) ||
            customerName.includes(searchValue) ||
            productNames.includes(searchValue);

        const matchesStatus =
            statusFilter === "all" ||
            order.status === statusFilter;

        const matchesPayment =
            paymentFilter === "all" ||
            order.payment_status === paymentFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
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
            <div className="row g-2 align-items-center mb-3">

                {/* Orders search */}
                <div className="col-12 col-md-5">

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
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                    </div>

                </div>


                {/* Order status filter */}
                <div className="col-6 col-md-auto">

                    <select
                        className="form-select bakery-orders-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All statuses
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="confirmed">
                            Confirmed
                        </option>

                        <option value="preparing">
                            Preparing
                        </option>

                        <option value="ready">
                            Ready
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>
                    </select>

                </div>


                {/* Payment status filter */}
                <div className="col-6 col-md-auto">

                    <select
                        className="form-select bakery-orders-filter"
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All payments
                        </option>

                        <option value="unpaid">
                            Unpaid
                        </option>

                        <option value="partially_paid">
                            Partially paid
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="refunded">
                            Refunded
                        </option>
                    </select>

                </div>

            </div>


            {/* Displays the number of matching Orders */}
            {!isLoading && !error && (
                <p className="bakery-orders-count">
                    {filteredOrders.length}{" "}
                    {filteredOrders.length === 1
                        ? "order"
                        : "orders"}
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


            {/* Orders empty state */}
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
                )
            }


            {/* No Orders match the selected filters */}
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
                )
            }


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
                                                        .map((item) =>
                                                            item.product_name
                                                        )
                                                        .join(", ")
                                                    : "-"
                                                }

                                            </td>


                                            {/* Pickup information */}
                                            <td>

                                                {new Date(
                                                    order.pickup_date
                                                ).toLocaleDateString(
                                                    "en-CA",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        timeZone: "UTC"
                                                    }
                                                )}

                                                <div className="bakery-orders-pickup-time">
                                                    {order.pickup_time}
                                                </div>

                                            </td>


                                            {/* Payment status */}
                                            <td>

                                                <span
                                                    className={`bakery-orders-payment bakery-orders-payment-${order.payment_status}`}
                                                >
                                                    {order.payment_status.replace(
                                                        "_",
                                                        " "
                                                    )}
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
                                                    ${order.total_price.toFixed(2)}
                                                </strong>

                                            </td>


                                            {/* Order details action */}
                                            <td className="text-end">

                                                {/* Opens the selected Order details page */}
                                                <button
                                                    type="button"
                                                    className="bakery-dashboard-table-action"
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

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )
            }

        </div>
    );
}