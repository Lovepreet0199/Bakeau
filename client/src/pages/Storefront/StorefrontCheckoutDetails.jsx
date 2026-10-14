import API_URL from "../../config/api.js";
//Import React hooks
import { useEffect, useMemo, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import Checkout icons
import { ArrowLeft, CalendarDays, ShoppingBag } from "lucide-react";

//Import Cart hook
import { useCart } from "../../context/useCart";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Checkout Details styles
import "./StorefrontCheckoutDetails.css";


//Displays the Contact Details step of Checkout
export default function StorefrontCheckoutDetails() {

    //Get Bakery slug and navigation
    const { slug } = useParams();
    const navigate = useNavigate();

    //Get Cart information
    const { cartItems, cartNote } = useCart();

    //Page states
    const [bakery, setBakery] = useState(null);
    const [cartQuote, setCartQuote] = useState(null);
    const [pickup, setPickup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    //Contact form values
    const [contact, setContact] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: ""
    });

    //Order note
    const [orderNote, setOrderNote] = useState("");

    //Form error
    const [formError, setFormError] = useState("");

    //Only get Cart items for this Bakery
    const bakeryCartItems = useMemo(() => {

        return cartItems.filter(
            (item) =>
                item.bakery_slug === slug
        );

    }, [cartItems, slug]);


    //Gets Customer token
    function getToken() {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    }


    //Formats Pickup date
    function formatPickupDate(date) {

        if (!date) return "";

        return new Date(`${date}T12:00:00`).toLocaleDateString("en-CA", {
            weekday: "short",
            month: "short",
            day: "numeric"
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


    //Formats money
    function formatPrice(price) {

        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: cartQuote?.currency || bakery?.currency || "CAD"
        }).format(Number(price) || 0);
    }


    //Create Pickup address
    const pickupAddress = [
        bakery?.address?.street,
        bakery?.address?.city,
        bakery?.address?.province
    ].filter(Boolean).join(", ");


    //Loads Customer, Bakery, Pickup and Cart information
    useEffect(() => {

        async function loadCheckoutDetails() {

            const token = getToken();

            //Customer needs to be logged in
            if (!token) {

                const returnTo = `/store/${slug}/checkout/details`;

                localStorage.setItem("authBakerySlug", slug);
                localStorage.setItem("authReturnTo", returnTo);

                navigate(`/store/${slug}/login?redirect=${encodeURIComponent(returnTo)}`, {
                    replace: true
                });

                return;
            }


            //Customer must select Pickup before coming here
            const savedPickup = sessionStorage.getItem(`checkoutPickup:${slug}`);

            if (!savedPickup) {
                navigate(`/store/${slug}/checkout`, { replace: true });
                return;
            }


            //Cart should not be empty
            if (bakeryCartItems.length === 0) {
                navigate(`/store/${slug}/cart`, { replace: true });
                return;
            }


            try {

                setError("");

                //Restore selected Pickup
                const pickupData = JSON.parse(savedPickup);
                setPickup(pickupData);


                //Load Bakery
                const bakeryResponse = await fetch(`${API_URL}/api/bakeries/public/${slug}`);
                const bakeryData = await bakeryResponse.json();

                if (!bakeryResponse.ok) {
                    throw new Error(bakeryData.message || "Unable to load Bakery");
                }

                setBakery(bakeryData.bakery);


                //Load logged-in Customer
                const customerResponse = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const customerData = await customerResponse.json();


                //Login expired
                if (customerResponse.status === 401) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user");

                    const returnTo = `/store/${slug}/checkout/details`;

                    localStorage.setItem("authBakerySlug", slug);
                    localStorage.setItem("authReturnTo", returnTo);

                    navigate(`/store/${slug}/login?redirect=${encodeURIComponent(returnTo)}`, {
                        replace: true
                    });

                    return;
                }


                if (!customerResponse.ok) {
                    throw new Error(customerData.message || "Unable to load Customer information");
                }


                //Get Customer from response
                const customer = customerData.user || customerData;


                //Only Customers should use Storefront Checkout
                if (customer.role !== "customer") {
                    throw new Error("Please sign in with a Customer account");
                }


                //Check if Contact Details were already saved
                const savedContact = sessionStorage.getItem(`checkoutContact:${slug}`);


                if (savedContact) {

                    //Restore edited Checkout Contact Details
                    setContact(JSON.parse(savedContact));

                } else {

                    //Pre-fill Contact Details from Customer account
                    setContact({
                        first_name: customer.first_name || "",
                        last_name: customer.last_name || "",
                        email: customer.email || "",
                        phone_number: customer.phone_number || ""
                    });
                }


                //Restore saved Order note
                const savedNote = sessionStorage.getItem(`checkoutNote:${slug}`);
                setOrderNote(savedNote !== null ? savedNote : cartNote || "");


                //Create Cart payload
                const items = bakeryCartItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    customization_option_ids: item.customization_option_ids
                }));


                //Get trusted Cart price
                const quoteResponse = await fetch(
                    `${API_URL}/api/bakeries/public/${slug}/cart/quote`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ items })
                    }
                );

                const quoteData = await quoteResponse.json();

                if (!quoteResponse.ok) {
                    throw new Error(quoteData.message || quoteData.errors?.[0]?.msg || "Unable to verify Cart");
                }

                setCartQuote(quoteData.quote);

            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }

        loadCheckoutDetails();

    }, [slug, bakeryCartItems, cartNote, navigate]);


    //Updates Contact form
    function handleContactChange(event) {

        const { name, value } = event.target;

        setContact({
            ...contact,
            [name]: value
        });
    }


    //Continues to Payment
    function handleContinue(event) {

        event.preventDefault();
        setFormError("");

        //Make sure required Contact fields are completed
        if (!contact.first_name.trim() || !contact.last_name.trim() || !contact.email.trim() || !contact.phone_number.trim()) {

            setFormError("Please complete all Contact information before continuing.");
            return;
        }


        //Save Contact Details for this Order only
        sessionStorage.setItem(
            `checkoutContact:${slug}`,
            JSON.stringify({
                first_name: contact.first_name.trim(),
                last_name: contact.last_name.trim(),
                email: contact.email.trim(),
                phone_number: contact.phone_number.trim()
            })
        );


        //Save updated Order note
        sessionStorage.setItem(`checkoutNote:${slug}`, orderNote.trim());


        //Continue to Payment
        navigate(`/store/${slug}/checkout/payment`);
    }


    //Loading
    if (isLoading) {

        return (
            <div className="storefront-details-loading d-flex align-items-center justify-content-center">

                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading Checkout...</span>
                </div>

            </div>
        );
    }


    //Page error
    if (error || !bakery || !pickup) {

        return (
            <div className="storefront-details-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="h4">Checkout unavailable</h1>

                <p>{error || "Unable to load Checkout"}</p>

                <Link to={`/store/${slug}/checkout`} className="btn btn-dark">
                    Back to Pickup
                </Link>

            </div>
        );
    }


    return (

        <div
            className="storefront-details-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            {/* Checkout Details */}
            <main className="storefront-details-main flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">


                    {/* Checkout steps */}
                    <div className="storefront-details-steps d-flex align-items-center gap-3 mb-4">

                        <Link
                            to={`/store/${slug}/checkout`}
                            className="storefront-details-back d-flex align-items-center gap-2 text-decoration-none"
                        >
                            <ArrowLeft size={15} />
                            Back
                        </Link>

                        <strong>Contact details</strong>

                        <span>›</span>

                        <span className="storefront-details-next-step">Payment</span>

                    </div>


                    <div className="row g-4 align-items-start">

                        {/* Contact Details */}
                        <div className="col-12 col-lg-8">

                            <form onSubmit={handleContinue}>

                                {/* Contact information */}
                                <section className="storefront-details-card mb-3">

                                    <h1 className="storefront-details-section-title">
                                        Contact information
                                    </h1>

                                    <p className="storefront-details-help">
                                        These details are pre-filled from your account. You can change them for this order if needed.
                                    </p>


                                    <div className="row g-3">

                                        {/* First name */}
                                        <div className="col-12 col-md-6">

                                            <label htmlFor="first_name" className="storefront-details-label">
                                                First name
                                            </label>

                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                className="form-control storefront-details-input"
                                                value={contact.first_name}
                                                onChange={handleContactChange}
                                                required
                                            />

                                        </div>


                                        {/* Last name */}
                                        <div className="col-12 col-md-6">

                                            <label htmlFor="last_name" className="storefront-details-label">
                                                Last name
                                            </label>

                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                className="form-control storefront-details-input"
                                                value={contact.last_name}
                                                onChange={handleContactChange}
                                                required
                                            />

                                        </div>


                                        {/* Email */}
                                        <div className="col-12 col-md-6">

                                            <label htmlFor="email" className="storefront-details-label">
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="form-control storefront-details-input"
                                                value={contact.email}
                                                onChange={handleContactChange}
                                                required
                                            />

                                        </div>


                                        {/* Phone */}
                                        <div className="col-12 col-md-6">

                                            <label htmlFor="phone_number" className="storefront-details-label">
                                                Phone number
                                            </label>

                                            <input
                                                type="tel"
                                                id="phone_number"
                                                name="phone_number"
                                                className="form-control storefront-details-input"
                                                value={contact.phone_number}
                                                onChange={handleContactChange}
                                                placeholder="(647) 555-0100"
                                                required
                                            />

                                        </div>

                                    </div>

                                </section>


                                {/* Order notes */}
                                <section className="storefront-details-card mb-3">

                                    <label htmlFor="orderNote" className="storefront-details-section-title d-block">
                                        Order notes <span>(optional)</span>
                                    </label>

                                    <textarea
                                        id="orderNote"
                                        className="form-control storefront-details-textarea"
                                        rows="4"
                                        value={orderNote}
                                        onChange={(event) => setOrderNote(event.target.value)}
                                        placeholder="Dietary requirements, design notes, pickup instructions..."
                                    />

                                </section>


                                {/* Form error */}
                                {formError && (

                                    <div className="alert alert-danger">
                                        {formError}
                                    </div>

                                )}


                                {/* Continue to Payment */}
                                <button
                                    type="submit"
                                    className="storefront-details-primary-button w-100"
                                >
                                    Continue to payment →
                                </button>

                            </form>

                        </div>


                        {/* Order Summary */}
                        <div className="col-12 col-lg-4">

                            <aside className="storefront-details-summary">

                                <h2 className="storefront-details-summary-title">
                                    Order summary
                                </h2>


                                {/* Products */}
                                {bakeryCartItems.map((item, index) => {

                                    const quotedItem = cartQuote?.items?.[index];

                                    return (

                                        <div
                                            key={item.cart_item_id}
                                            className="storefront-details-product mb-3"
                                        >

                                            {/* Product image */}
                                            {item.product_image_url ? (

                                                <img
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    className="storefront-details-product-image"
                                                />

                                            ) : (

                                                <div className="storefront-details-product-placeholder d-flex align-items-center justify-content-center">
                                                    <ShoppingBag size={18} />
                                                </div>

                                            )}


                                            {/* Product details */}
                                            <div>

                                                <strong className="storefront-details-product-name d-block">
                                                    {item.product_name}
                                                </strong>

                                                <small className="storefront-details-product-info">
                                                    Qty {item.quantity}
                                                </small>

                                                {quotedItem?.customizations?.length > 0 && (

                                                    <small className="storefront-details-product-info d-block">
                                                        {quotedItem.customizations.map((option) => option.option_name).join(" · ")}
                                                    </small>

                                                )}

                                            </div>

                                        </div>
                                    );
                                })}


                                {/* Pickup */}
                                <div className="storefront-details-pickup mb-3">

                                    <div className="d-flex gap-2 mb-1">

                                        <CalendarDays size={16} />

                                        <strong>Pickup</strong>

                                    </div>

                                    <span className="d-block">
                                        {formatPickupDate(pickup.date)} at {formatPickupTime(pickup.time)}
                                    </span>

                                    <small>
                                        {bakery.name}{pickupAddress ? ` · ${pickupAddress}` : ""}
                                    </small>

                                </div>


                                <hr />


                                {/* Pricing */}
                                {cartQuote && (

                                    <>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Subtotal</span>
                                            <strong>{formatPrice(cartQuote.total)}</strong>
                                        </div>

                                        {cartQuote.deposit_required && (

                                            <div className="d-flex justify-content-between storefront-details-deposit">
                                                <span>Deposit required</span>
                                                <strong>{formatPrice(cartQuote.amount_due_now)}</strong>
                                            </div>

                                        )}
                                    </>

                                )}

                            </aside>

                        </div>

                    </div>

                </div>

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter bakery={bakery} />

        </div>
    );
}