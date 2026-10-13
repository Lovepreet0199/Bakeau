//Import React hooks
import { useEffect, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import icons
import { CalendarDays, Check, CreditCard, ShoppingBag } from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Confirmation styles
import "./StorefrontOrderConfirmation.css";


//Displays the Order Confirmation page
export default function StorefrontOrderConfirmation() {

    //Get Bakery slug and Order ID
    const { slug, orderId } = useParams();
    const navigate = useNavigate();

    //Page data
    const [bakery, setBakery] = useState(null);
    const [order, setOrder] = useState(null);
    const [confirmation, setConfirmation] = useState(null);

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
            weekday: "long",
            month: "long",
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


    //Load Bakery and Order
    useEffect(() => {

        async function loadConfirmation() {

            const token = getToken();


            //Customer must be logged in
            if (!token) {
                navigate(`/store/${slug}/login`, { replace: true });
                return;
            }


            try {

                setError("");


                //Get Checkout confirmation information
                const savedConfirmation = sessionStorage.getItem(
                    `checkoutConfirmation:${slug}`
                );


                if (savedConfirmation) {
                    setConfirmation(JSON.parse(savedConfirmation));
                }


                //Get Bakery
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


                //Get Customer Order
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


        loadConfirmation();

    }, [slug, orderId, navigate]);


    //Loading
    if (isLoading) {

        return (
            <div className="storefront-confirmation-loading d-flex align-items-center justify-content-center">

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
            <div className="storefront-confirmation-loading d-flex flex-column align-items-center justify-content-center text-center gap-3">

                <h1 className="h4">
                    Unable to load Order
                </h1>

                <p>{error || "Order not found"}</p>

                <Link
                    to={`/store/${slug}`}
                    className="btn btn-dark"
                >
                    Back to Bakery
                </Link>

            </div>
        );
    }


    //Amount selected during Checkout
    const paymentAmount = Number(
        confirmation?.amount ||
        order.amount_due_now ||
        order.total_price
    );


    //Remaining Order balance
    const remainingBalance = Math.max(
        0,
        Number(order.total_price) - paymentAmount
    );


    //Pickup address
    const pickupAddress = [
        bakery.address?.city,
        bakery.address?.province
    ].filter(Boolean).join(", ");


    return (

        <div
            className="storefront-confirmation-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            <main className="storefront-confirmation-main flex-grow-1">

                <div className="container py-5">


                    {/* Confirmation heading */}
                    <div className="storefront-confirmation-heading text-center">

                        <div className="storefront-confirmation-check mx-auto">
                            <Check size={28} />
                        </div>

                        <h1>
                            Your order is placed!
                        </h1>

                        <p>
                            Thanks, {order.contact_first_name}. Your order has been sent to {bakery.name}.
                        </p>

                    </div>


                    {/* Confirmation Card */}
                    <div className="storefront-confirmation-card mx-auto">


                        {/* Order number and status */}
                        <div className="storefront-confirmation-order-header d-flex align-items-center justify-content-between">

                            <div>

                                <span>
                                    ORDER NUMBER
                                </span>

                                <h2>
                                    {order.order_number}
                                </h2>

                            </div>


                            <div className="storefront-confirmation-status">
                                {formatStatus(order.status)}
                            </div>

                        </div>


                        <hr />


                        {/* Products */}
                        <div className="storefront-confirmation-products">

                            {order.items?.map((item) => (

                                <div
                                    key={item._id}
                                    className="storefront-confirmation-product d-flex align-items-center gap-3"
                                >

                                    {/* Product image */}
                                    {item.product_id?.image_url ? (

                                        <img
                                            src={item.product_id.image_url}
                                            alt={item.product_name}
                                            className="storefront-confirmation-product-image"
                                        />

                                    ) : (

                                        <div className="storefront-confirmation-product-image storefront-confirmation-product-placeholder d-flex align-items-center justify-content-center">

                                            <ShoppingBag size={19} />

                                        </div>

                                    )}


                                    <div>

                                        <strong>
                                            {item.product_name}
                                        </strong>

                                        <small className="d-block">
                                            Qty {item.quantity}
                                        </small>


                                        {/* Customizations for this Product */}
                                        {item.customizations?.length > 0 && (

                                            <div className="storefront-confirmation-product-customizations mt-1">

                                                {item.customizations.map((customization) => (

                                                    <small
                                                        key={customization._id}
                                                        className="d-block"
                                                    >
                                                        {customization.group_name}: {customization.option_name}
                                                    </small>

                                                ))}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>


                        {/* Payment */}
                        <div className="storefront-confirmation-payment">

                            <div className="d-flex align-items-center gap-2 mb-2">

                                <CreditCard size={15} />

                                <strong>
                                    Manual payment pending
                                </strong>

                            </div>


                            {remainingBalance > 0 ? (

                                <>
                                    <div className="d-flex justify-content-between">

                                        <span>
                                            Deposit to pay
                                        </span>

                                        <strong>
                                            {formatPrice(paymentAmount)}
                                        </strong>

                                    </div>


                                    <div className="d-flex justify-content-between">

                                        <span>
                                            Remaining balance
                                        </span>

                                        <span>
                                            {formatPrice(remainingBalance)}
                                        </span>

                                    </div>
                                </>

                            ) : (

                                <div className="d-flex justify-content-between">

                                    <span>
                                        Full payment
                                    </span>

                                    <strong>
                                        {formatPrice(paymentAmount)}
                                    </strong>

                                </div>

                            )}

                        </div>


                        {/* Pickup */}
                        <div className="storefront-confirmation-pickup">

                            <div className="d-flex align-items-center gap-2 mb-2">

                                <CalendarDays size={15} />

                                <strong>
                                    Pickup
                                </strong>

                            </div>


                            <strong className="d-block">
                                {formatPickupDate(order.pickup_date)} at {formatPickupTime(order.pickup_time)}
                            </strong>


                            <span className="d-block">
                                {bakery.name}
                                {pickupAddress && ` · ${pickupAddress}`}
                            </span>


                            {bakery.pickup_instructions && (

                                <small className="d-block mt-1">
                                    {bakery.pickup_instructions}
                                </small>

                            )}

                        </div>

                    </div>


                    {/* Buttons */}
                    <div className="storefront-confirmation-actions mx-auto">

                        <Link
                            to={`/store/${slug}/orders/${orderId}`}
                            className="storefront-confirmation-track text-decoration-none"
                        >
                            Track my order
                        </Link>


                        <Link
                            to={`/store/${slug}/orders`}
                            className="storefront-confirmation-orders text-decoration-none"
                        >
                            View my orders
                        </Link>

                    </div>

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}