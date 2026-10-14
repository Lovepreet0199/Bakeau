//Import React hooks
import {
    useCallback,
    useEffect,
    useState
} from "react";

//Import Dashboard overview styles
import "./styles/DashboardOverview.css";

//Used for Dashboard navigation
import { useNavigate } from "react-router-dom";

//Import Dashboard icons
import {
    DollarSign,
    ShoppingCart,
    ReceiptText,
    CircleCheckBig,
    Plus,
    CalendarDays,
    ArrowRight,
    AlertTriangle,
    Package,
    CalendarClock
} from "lucide-react";

//Import reusable Dashboard components
import DashboardStatCard from "../../components/BakeryOwner/dashboard/DashboardStatCard";

//Import API URL
import API_URL from "../../config/api";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage";


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

    return statusLabels[status] || status;
}


//Displays money using the Bakery currency
function formatMoney(
    amount,
    currency = "CAD"
) {

    return new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency
        }
    ).format(
        Number(amount || 0)
    );
}


//Displays an Order date
function formatOrderDate(date) {

    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    ).format(
        new Date(date)
    );
}


//Displays the Bakery Owner Dashboard Overview
export default function BakeryDashboard() {

    //Used to navigate to other Bakery Owner pages
    const navigate = useNavigate();


    //Stores Dashboard API information
    const [
        dashboardData,
        setDashboardData
    ] = useState(null);


    //Tracks Dashboard loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    //Stores Dashboard errors
    const [
        error,
        setError
    ] = useState("");


    //Stores the selected start date
    const [
        fromDate,
        setFromDate
    ] = useState("");


    //Stores the selected end date
    const [
        toDate,
        setToDate
    ] = useState("");


    //Gets Dashboard information from the backend
    const fetchDashboardData = useCallback(
        async (
            selectedFrom = "",
            selectedTo = ""
        ) => {

            const token = getAuthToken();


            //Stop if the Bakery Owner is not signed in
            if (!token) {

                navigate("/login");

                return null;
            }


            //Create optional date range query
            const query =
                new URLSearchParams();


            //Add start date when selected
            if (selectedFrom) {

                query.append(
                    "from",
                    selectedFrom
                );
            }


            //Add end date when selected
            if (selectedTo) {

                query.append(
                    "to",
                    selectedTo
                );
            }


            //Create the Dashboard API URL
            const queryString =
                query.toString();


            const dashboardUrl =
                queryString
                    ? `${API_URL}/api/dashboard/bakery?${queryString}`
                    : `${API_URL}/api/dashboard/bakery`;


            //Get Dashboard information
            const response = await fetch(
                dashboardUrl,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            //Stop if the Dashboard could not be loaded
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load dashboard"
                );
            }


            return data;
        },
        [navigate]
    );


    //Loads Dashboard information after a user action
    async function getDashboardData(
        selectedFrom = "",
        selectedTo = ""
    ) {

        setIsLoading(true);
        setError("");


        try {

            const data =
                await fetchDashboardData(
                    selectedFrom,
                    selectedTo
                );


            if (data) {

                setDashboardData(data);
            }


        } catch (error) {

            setError(error.message);

        } finally {

            setIsLoading(false);
        }
    }


    //Loads Dashboard information when the page opens
    useEffect(() => {

        //Tracks whether this page is still open
        let isActive = true;


        //Loads the initial Dashboard information
        async function loadDashboard() {

            try {

                const data =
                    await fetchDashboardData();


                //Only update state if the page is still open
                if (
                    isActive &&
                    data
                ) {

                    setDashboardData(data);
                }


            } catch (error) {

                //Only update state if the page is still open
                if (isActive) {

                    setError(
                        error.message
                    );
                }

            } finally {

                //Only update state if the page is still open
                if (isActive) {

                    setIsLoading(false);
                }
            }
        }


        //Load Dashboard data
        loadDashboard();


        //Stops state updates after leaving the page
        return () => {

            isActive = false;
        };

    }, [fetchDashboardData]);


    //Loads Dashboard information for the selected date range
    function applyDateFilter(event) {

        event.preventDefault();


        getDashboardData(
            fromDate,
            toDate
        );
    }


    //Clears the selected date range
    function clearDateFilter() {

        setFromDate("");
        setToDate("");


        getDashboardData();
    }


    //Dashboard Bakery information
    const bakery =
        dashboardData?.bakery;


    //Dashboard summary information
    const summary =
        dashboardData?.summary;


    //Recent Bakery Orders
    const recentOrders =
        dashboardData?.recent_orders || [];


    //Orders requiring Bakery Owner attention
    const attentionOrders =
        dashboardData?.attention?.orders || [];


    //Total number of Orders requiring attention
    const attentionCount =
        dashboardData?.attention?.count || 0;


    //Checks whether a Dashboard date range is active
    const hasDateFilter =
        dashboardData?.date_range?.from ||
        dashboardData?.date_range?.to;


    //Text displayed below Dashboard statistics
    const summaryNote =
        hasDateFilter
            ? "Selected period"
            : "All time";


    return (

        <div className="bakery-dashboard-content">


            {/* Dashboard heading */}
            <div className="bakery-dashboard-header mb-4">

                <div className="row g-3 align-items-end">


                    {/* Welcome message */}
                    <div className="col-12 col-xl">

                        <h1>
                            Welcome back!
                        </h1>

                        <p className="mb-0">

                            Here's what's happening

                            {bakery?.name
                                ? ` at ${bakery.name}`
                                : " at your bakery"
                            }.

                        </p>

                    </div>


                    {/* Dashboard date filter */}
                    <div className="col-12 col-xl-auto">

                        <form
                            className="bakery-dashboard-date-filter"
                            onSubmit={applyDateFilter}
                        >

                            <CalendarDays
                                size={17}
                                strokeWidth={1.8}
                            />


                            {/* Start date */}
                            <input
                                type="date"
                                aria-label="Dashboard start date"
                                value={fromDate}
                                onChange={(event) =>
                                    setFromDate(
                                        event.target.value
                                    )
                                }
                            />


                            <span className="bakery-dashboard-date-separator">
                                –
                            </span>


                            {/* End date */}
                            <input
                                type="date"
                                aria-label="Dashboard end date"
                                value={toDate}
                                onChange={(event) =>
                                    setToDate(
                                        event.target.value
                                    )
                                }
                            />


                            {/* Apply date range */}
                            <button
                                type="submit"
                                disabled={isLoading}
                            >
                                Apply
                            </button>


                            {/* Reset date range */}
                            {(
                                fromDate ||
                                toDate ||
                                hasDateFilter
                            ) && (

                                    <button
                                        type="button"
                                        className="bakery-dashboard-date-clear"
                                        disabled={isLoading}
                                        onClick={clearDateFilter}
                                    >
                                        Reset
                                    </button>

                                )}

                        </form>

                    </div>


                    {/* Add Product action */}
                    <div className="col-12 col-md-auto">

                        <button
                            type="button"
                            className="btn bakery-dashboard-primary-button d-flex align-items-center justify-content-center gap-2 w-100"
                            onClick={() =>
                                navigate(
                                    "/bakery/products/new"
                                )
                            }
                        >

                            <Plus
                                size={17}
                                strokeWidth={2}
                            />

                            <span>
                                Add product
                            </span>

                        </button>

                    </div>

                </div>

            </div>


            {/* Dashboard error */}
            {error && (

                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {/* Dashboard loading */}
            {isLoading && (

                <div className="bakery-dashboard-loading">

                    <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                    />

                    <span>
                        Loading dashboard...
                    </span>

                </div>

            )}


            {/* Dashboard information */}
            {!isLoading &&
                !error &&
                dashboardData && (
                    <>


                        {/* Dashboard summary cards */}
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">


                            {/* Total sales */}
                            <DashboardStatCard
                                label="Total sales"
                                value={formatMoney(
                                    summary?.total_sales,
                                    bakery?.currency
                                )}
                                note={summaryNote}
                                icon={
                                    <DollarSign
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                }
                            />


                            {/* Orders */}
                            <DashboardStatCard
                                label="Orders"
                                value={
                                    summary?.total_orders || 0
                                }
                                note={summaryNote}
                                icon={
                                    <ShoppingCart
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                }
                            />


                            {/* Completed Orders */}
                            <DashboardStatCard
                                label="Completed orders"
                                value={
                                    summary?.completed_orders || 0
                                }
                                note={summaryNote}
                                icon={
                                    <CircleCheckBig
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                }
                            />


                            {/* Average Order */}
                            <DashboardStatCard
                                label="Average order"
                                value={formatMoney(
                                    summary?.average_order_value,
                                    bakery?.currency
                                )}
                                note={summaryNote}
                                icon={
                                    <ReceiptText
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                }
                            />

                        </div>


                        {/* Recent Orders */}
                        <div className="card bakery-dashboard-section-card mb-4">


                            {/* Recent Orders heading */}
                            <div className="card-header d-flex align-items-center justify-content-between gap-3">

                                <div>

                                    <h2 className="bakery-dashboard-section-title mb-1">
                                        Recent orders
                                    </h2>

                                    <p className="bakery-dashboard-section-description mb-0">
                                        Latest customer orders for your bakery.
                                    </p>

                                </div>


                                {/* Opens all Orders */}
                                <button
                                    type="button"
                                    className="btn bakery-dashboard-text-button d-flex align-items-center gap-1"
                                    onClick={() =>
                                        navigate(
                                            "/bakery/orders"
                                        )
                                    }
                                >

                                    View all

                                    <ArrowRight
                                        size={14}
                                        strokeWidth={1.8}
                                    />

                                </button>

                            </div>


                            {/* No Orders */}
                            {recentOrders.length === 0 ? (

                                <div className="bakery-dashboard-empty">

                                    <ShoppingCart
                                        size={24}
                                        strokeWidth={1.6}
                                    />

                                    <p className="mb-0">
                                        No orders found for this period.
                                    </p>

                                </div>

                            ) : (

                                /* Allows table scrolling on smaller screens */
                                <div className="table-responsive">

                                    <table className="table bakery-dashboard-table align-middle mb-0">


                                        {/* Order table headings */}
                                        <thead>

                                            <tr>

                                                <th scope="col">
                                                    Order
                                                </th>

                                                <th scope="col">
                                                    Date
                                                </th>

                                                <th scope="col">
                                                    Customer
                                                </th>

                                                <th scope="col">
                                                    Items
                                                </th>

                                                <th scope="col">
                                                    Total
                                                </th>

                                                <th scope="col">
                                                    Status
                                                </th>

                                                <th
                                                    scope="col"
                                                    className="text-end"
                                                >
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        {/* Recent Orders */}
                                        <tbody>

                                            {recentOrders.map(
                                                (order) => (

                                                    <tr key={order._id}>


                                                        {/* Order number */}
                                                        <td>

                                                            <strong>
                                                                {order.order_number}
                                                            </strong>

                                                        </td>


                                                        {/* Order date */}
                                                        <td>

                                                            {formatOrderDate(
                                                                order.created_at
                                                            )}

                                                        </td>


                                                        {/* Customer */}
                                                        <td>
                                                            {order.customer_name}
                                                        </td>


                                                        {/* Item count */}
                                                        <td>

                                                            {order.item_count}{" "}

                                                            {order.item_count === 1
                                                                ? "item"
                                                                : "items"
                                                            }

                                                        </td>


                                                        {/* Order total */}
                                                        <td>

                                                            {formatMoney(
                                                                order.total_price,
                                                                bakery?.currency
                                                            )}

                                                        </td>


                                                        {/* Order status */}
                                                        <td>

                                                            <span
                                                                className={
                                                                    `badge bakery-order-status bakery-order-status-${order.status}`
                                                                }
                                                            >

                                                                {getOrderStatusLabel(
                                                                    order.status
                                                                )}

                                                            </span>

                                                        </td>


                                                        {/* Opens Order details */}
                                                        <td className="text-end">

                                                            <button
                                                                type="button"
                                                                className="btn bakery-dashboard-table-action"
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

                            )}

                        </div>


                        {/* Lower Dashboard section */}
                        <div className="row g-4">


                            {/* Needs attention */}
                            <div className="col-12 col-lg-8">

                                <div className="card bakery-dashboard-section-card h-100">


                                    {/* Needs attention heading */}
                                    <div className="card-header d-flex align-items-center justify-content-between gap-3">

                                        <div>

                                            <h2 className="bakery-dashboard-section-title mb-1">
                                                Needs attention
                                            </h2>

                                            <p className="bakery-dashboard-section-description mb-0">
                                                Orders that may require action.
                                            </p>

                                        </div>


                                        {/* Total Attention Order count */}
                                        {attentionCount > 0 && (

                                            <span className="bakery-dashboard-attention-count">
                                                {attentionCount}
                                            </span>

                                        )}

                                    </div>


                                    {/* No Attention Orders */}
                                    {attentionOrders.length === 0 ? (

                                        <div className="bakery-dashboard-empty">

                                            <CircleCheckBig
                                                size={24}
                                                strokeWidth={1.6}
                                            />

                                            <p className="mb-0">
                                                Nothing needs your attention right now.
                                            </p>

                                        </div>

                                    ) : (

                                        /* Attention Orders */
                                        <div className="bakery-dashboard-attention-list">

                                            {attentionOrders.map(
                                                (order) => (

                                                    <div
                                                        key={order._id}
                                                        className="bakery-dashboard-attention-item"
                                                    >


                                                        {/* Warning icon */}
                                                        <div className="bakery-dashboard-attention-icon">

                                                            <AlertTriangle
                                                                size={17}
                                                                strokeWidth={1.8}
                                                            />

                                                        </div>


                                                        {/* Attention Order information */}
                                                        <div className="flex-grow-1">

                                                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">

                                                                <strong>
                                                                    {order.order_number}
                                                                </strong>


                                                                {/* Pending payment */}
                                                                {order.payment_status !== "paid" && (

                                                                    <span className="bakery-dashboard-attention-badge">
                                                                        Payment pending
                                                                    </span>

                                                                )}

                                                            </div>


                                                            <p className="mb-0">

                                                                {order.customer_name}

                                                                {" · "}

                                                                {formatMoney(
                                                                    order.total_price,
                                                                    bakery?.currency
                                                                )}

                                                                {" · "}

                                                                {getOrderStatusLabel(
                                                                    order.status
                                                                )}

                                                            </p>

                                                        </div>


                                                        {/* Opens Order details */}
                                                        <button
                                                            type="button"
                                                            className="btn bakery-dashboard-text-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/bakery/orders/${order._id}`
                                                                )
                                                            }
                                                        >
                                                            Review
                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* Quick actions */}
                            <div className="col-12 col-lg-4">

                                <div className="card bakery-dashboard-section-card h-100">


                                    {/* Quick actions heading */}
                                    <div className="card-header">

                                        <h2 className="bakery-dashboard-section-title mb-1">
                                            Quick actions
                                        </h2>

                                        <p className="bakery-dashboard-section-description mb-0">
                                            Common bakery management tasks.
                                        </p>

                                    </div>


                                    {/* Quick action buttons */}
                                    <div className="card-body bakery-dashboard-quick-actions">


                                        {/* Add Product */}
                                        <button
                                            type="button"
                                            className="bakery-dashboard-quick-action"
                                            onClick={() =>
                                                navigate(
                                                    "/bakery/products/new"
                                                )
                                            }
                                        >

                                            <div className="bakery-dashboard-quick-action-icon">

                                                <Package
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <span>
                                                Add product
                                            </span>

                                            <ArrowRight
                                                size={15}
                                                strokeWidth={1.8}
                                            />

                                        </button>


                                        {/* View Orders */}
                                        <button
                                            type="button"
                                            className="bakery-dashboard-quick-action"
                                            onClick={() =>
                                                navigate(
                                                    "/bakery/orders"
                                                )
                                            }
                                        >

                                            <div className="bakery-dashboard-quick-action-icon">

                                                <ShoppingCart
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <span>
                                                View orders
                                            </span>

                                            <ArrowRight
                                                size={15}
                                                strokeWidth={1.8}
                                            />

                                        </button>


                                        {/* Pickup Schedule */}
                                        <button
                                            type="button"
                                            className="bakery-dashboard-quick-action"
                                            onClick={() =>
                                                navigate(
                                                    "/bakery/pickup-slots"
                                                )
                                            }
                                        >

                                            <div className="bakery-dashboard-quick-action-icon">

                                                <CalendarClock
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <span>
                                                Pickup schedule
                                            </span>

                                            <ArrowRight
                                                size={15}
                                                strokeWidth={1.8}
                                            />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </>
                )}

        </div>
    );
}