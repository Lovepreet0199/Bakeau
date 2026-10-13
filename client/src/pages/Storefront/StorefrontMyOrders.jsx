//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import fallback Product icon
import { ShoppingBag } from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import My Orders styles
import "./StorefrontMyOrders.css";


//Displays Orders belonging to the logged-in Customer
export default function StorefrontMyOrders() {

    //Get Bakery slug and navigation
    const { slug } = useParams();
    const navigate = useNavigate();

    //Page data
    const [bakery, setBakery] = useState(null);
    const [orders, setOrders] = useState([]);

    //Tracks selected Orders tab
    const [activeTab, setActiveTab] = useState("active");

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


    //Formats Order status
    function formatStatus(status) {

        if (!status) return "";

        if (status === "ready") {
            return "Ready for pickup";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    }


    //Loads Bakery and Customer Orders
    useEffect(() => {

        async function loadOrders() {

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


                const currentBakery = bakeryData.bakery;

                setBakery(currentBakery);


                //Load Customer Orders
                const orderResponse = await fetch(
                    "http://localhost:3000/api/orders/mine",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const orderData = await orderResponse.json();


                if (!orderResponse.ok) {
                    throw new Error(
                        orderData.message || "Unable to load Orders"
                    );
                }


                //Only show Orders belonging to this Storefront
                const bakeryOrders = orderData.orders.filter(
                    (order) =>
                        order.bakery_id?.toString() ===
                        currentBakery._id.toString()
                );


                setOrders(bakeryOrders);


            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }


        loadOrders();

    }, [slug, navigate]);


    //Active Orders
    const activeOrders = orders.filter(
        (order) =>
            order.status !== "completed" &&
            order.status !== "cancelled"
    );


    //Past Orders
    const pastOrders = orders.filter(
        (order) =>
            order.status === "completed" ||
            order.status === "cancelled"
    );


    //Displays one Order
    function renderOrder(order) {

        //Show first Product as Order preview
        const firstItem = order.items?.[0];

        //Count other Products in this Order
        const extraItems = Math.max(
            0,
            (order.items?.length || 0) - 1
        );


        return (

            <div
                key={order._id}
                className="storefront-orders-card"
            >

                {/* Order heading */}
                <div className="storefront-orders-card-header d-flex justify-content-between align-items-start gap-3">

                    <div>

                        <span className="storefront-orders-label">
                            ORDER
                        </span>

                        <h3 className="storefront-orders-number">
                            {order.order_number}
                        </h3>

                    </div>


                    {/* Order status */}
                    <span className={`storefront-orders-status storefront-orders-status-${order.status}`}>
                        {formatStatus(order.status)}
                    </span>

                </div>


                {/* Order information */}
                <div className="row align-items-center g-3 mt-1">


                    {/* Product preview */}
                    <div className="col-12 col-md-5">

                        {firstItem && (

                            <div className="storefront-orders-product d-flex align-items-center gap-3">

                                {/* Product image */}
                                {firstItem.product_id?.image_url ? (

                                    <img
                                        src={firstItem.product_id.image_url}
                                        alt={firstItem.product_name}
                                        className="storefront-orders-product-image"
                                    />

                                ) : (

                                    <div className="storefront-orders-product-image storefront-orders-product-placeholder d-flex align-items-center justify-content-center">

                                        <ShoppingBag size={18} />

                                    </div>

                                )}


                                {/* Product information */}
                                <div>

                                    <strong className="d-block">
                                        {firstItem.product_name}
                                    </strong>

                                    <small className="d-block">
                                        Qty {firstItem.quantity}
                                    </small>


                                    {extraItems > 0 && (

                                        <small className="storefront-orders-more-items d-block">
                                            + {extraItems} more {extraItems === 1 ? "item" : "items"}
                                        </small>

                                    )}

                                </div>

                            </div>

                        )}

                    </div>


                    {/* Pickup */}
                    <div className="col-6 col-md-3">

                        <span className="storefront-orders-detail-label">
                            Pickup
                        </span>

                        <strong className="storefront-orders-detail-value d-block">
                            {formatPickupDate(order.pickup_date)}
                        </strong>

                        <small className="storefront-orders-detail-time">
                            {formatPickupTime(order.pickup_time)}
                        </small>

                    </div>


                    {/* Total */}
                    <div className="col-6 col-md-2">

                        <span className="storefront-orders-detail-label">
                            Total
                        </span>

                        <strong className="storefront-orders-detail-value d-block">
                            {formatPrice(order.total_price)}
                        </strong>

                    </div>


                    {/* Track / View */}
                    <div className="col-12 col-md-2">

                        <Link
                            to={`/store/${slug}/orders/${order._id}`}
                            className="storefront-orders-button text-decoration-none"
                        >
                            {order.status === "completed" || order.status === "cancelled"
                                ? "View order"
                                : "Track order"
                            }
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    //Loading
    if (isLoading) {

        return (
            <div className="storefront-orders-loading d-flex align-items-center justify-content-center">

                <div className="spinner-border" role="status">

                    <span className="visually-hidden">
                        Loading Orders...
                    </span>

                </div>

            </div>
        );
    }


    //Error
    if (error || !bakery) {

        return (
            <div className="storefront-orders-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center">

                <h1 className="h4">
                    Unable to load Orders
                </h1>

                <p>
                    {error || "Unable to load Bakery"}
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


    return (

        <div
            className="storefront-orders-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            <main className="storefront-orders-main flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">


                    {/* Page heading */}
                    <div className="storefront-orders-heading">

                        <h1>
                            My orders
                        </h1>

                        <p>
                            View and track your orders from {bakery.name}.
                        </p>

                    </div>


                    {/* Order tabs */}
                    <div className="storefront-orders-tabs mb-4">

                        {/* Active Orders */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("active")}
                            className={
                                activeTab === "active"
                                    ? "storefront-orders-tab storefront-orders-tab-active"
                                    : "storefront-orders-tab"
                            }
                        >

                            Active orders

                            <span>
                                {activeOrders.length}
                            </span>

                        </button>


                        {/* Past Orders */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("past")}
                            className={
                                activeTab === "past"
                                    ? "storefront-orders-tab storefront-orders-tab-active"
                                    : "storefront-orders-tab"
                            }
                        >

                            Past orders

                            <span>
                                {pastOrders.length}
                            </span>

                        </button>

                    </div>


                    {/* Active Orders tab */}
                    {activeTab === "active" && (

                        <section>

                            {activeOrders.length > 0 ? (

                                <div className="storefront-orders-list">

                                    {activeOrders.map((order) =>
                                        renderOrder(order)
                                    )}

                                </div>

                            ) : (

                                <div className="storefront-orders-empty text-center">

                                    <ShoppingBag size={30} />

                                    <h2>
                                        No active orders
                                    </h2>

                                    <p>
                                        Your active orders from {bakery.name} will appear here.
                                    </p>

                                    <Link
                                        to={`/store/${slug}`}
                                        className="storefront-orders-shop-button text-decoration-none"
                                    >
                                        Browse bakery
                                    </Link>

                                </div>

                            )}

                        </section>

                    )}


                    {/* Past Orders tab */}
                    {activeTab === "past" && (

                        <section>

                            {pastOrders.length > 0 ? (

                                <div className="storefront-orders-list">

                                    {pastOrders.map((order) =>
                                        renderOrder(order)
                                    )}

                                </div>

                            ) : (

                                <div className="storefront-orders-empty text-center">

                                    <ShoppingBag size={30} />

                                    <h2>
                                        No past orders
                                    </h2>

                                    <p>
                                        Completed and cancelled orders will appear here.
                                    </p>

                                </div>

                            )}

                        </section>

                    )}

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}