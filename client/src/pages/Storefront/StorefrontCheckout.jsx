import API_URL from "../../config/api.js";
//Import React hooks
import { useEffect, useMemo, useState } from "react";

//Import React Router tools
import { Link, useNavigate, useParams } from "react-router-dom";

//Import Checkout icons
import { ArrowLeft, ChevronLeft, ChevronRight, Clock3, MapPin, ShoppingBag } from "lucide-react";

//Import Cart hook
import { useCart } from "../../context/useCart";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Checkout styles
import "./StorefrontCheckout.css";


//Customer Pickup times will be created every 30 minutes
const PICKUP_INTERVAL = 30;


//Displays the Pickup step of Checkout
export default function StorefrontCheckout() {

    //Get Bakery slug and navigation
    const { slug } = useParams();
    const navigate = useNavigate();

    //Get Cart information
    const { cartItems, cartNote } = useCart();

    //Checkout states
    const [bakery, setBakery] = useState(null);
    const [cartQuote, setCartQuote] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedPickupSlotId, setSelectedPickupSlotId] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [availabilityError, setAvailabilityError] = useState("");

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


    //Gets logged-in Customer
    function getCustomer() {

        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!storedUser) return null;

        try {

            const user = JSON.parse(storedUser);

            if (user.role !== "customer") return null;

            return user;

        } catch {
            return null;
        }
    }


    //Formats Date as YYYY-MM-DD
    function formatDateKey(date) {

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    //Formats Calendar Month heading
    function formatMonth(date) {
        return date.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
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


    //Formats 24-hour time into Customer friendly time
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


    //Converts time like 9:30 AM into minutes
    function convertTimeToMinutes(time) {

        const [timeValue, period] = time.trim().split(" ");
        let [hours, minutes] = timeValue.split(":").map(Number);

        //Convert PM time into 24-hour time
        if (period === "PM" && hours !== 12) {
            hours += 12;
        }

        //12 AM should become 0
        if (period === "AM" && hours === 12) {
            hours = 0;
        }

        return (hours * 60) + minutes;
    }


    //Converts minutes back into 24-hour time like 09:30
    function convertMinutesToTime(totalMinutes) {

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }


    //Creates Customer Pickup times from Bakery Pickup windows
    function createPickupTimes(windows) {

        const pickupTimes = [];

        windows.forEach((window) => {

            //Example: "9:30 AM - 7:30 PM"
            const [startTime, endTime] = window.pickup_window.split(" - ");

            const startMinutes = convertTimeToMinutes(startTime);
            const endMinutes = convertTimeToMinutes(endTime);

            //Create a Customer Pickup time every 30 minutes
            for (let time = startMinutes; time < endMinutes; time += PICKUP_INTERVAL) {

                pickupTimes.push({
                    time: convertMinutesToTime(time),
                    pickupSlotId: window.pickup_slot_id
                });
            }
        });


        //Remove duplicate times if Pickup windows overlap
        const uniqueTimes = new Map();

        pickupTimes.forEach((pickupTime) => {
            uniqueTimes.set(pickupTime.time, pickupTime);
        });

        return Array.from(uniqueTimes.values());
    }


    //Formats money
    function formatPrice(price) {

        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: cartQuote?.currency || bakery?.currency || "CAD"
        }).format(Number(price) || 0);
    }


    //Creates the Calendar days for selected month
    function buildCalendarDays() {

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        //First and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        //Tells us how many empty boxes are needed before day 1
        const firstWeekday = firstDay.getDay();

        const days = [];

        //Add empty boxes before day 1
        for (let i = 0; i < firstWeekday; i++) {
            days.push({ empty: true, key: `empty-${i}` });
        }

        //Add all actual days
        for (let day = 1; day <= lastDay.getDate(); day++) {

            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);

            days.push({
                empty: false,
                day: day,
                date: dateKey,
                key: dateKey
            });
        }

        return days;
    }


    //Calendar days
    const calendarDays = buildCalendarDays();


    //Find availability for one date
    function getDayAvailability(date) {
        return availability?.days?.find((day) => day.date === date);
    }


    //Get selected day's availability
    const selectedDay = getDayAvailability(selectedDate);


    //Create Customer Pickup times from selected day's window
    const availablePickupTimes = selectedDay?.windows
        ? createPickupTimes(selectedDay.windows)
        : [];


    //Create Pickup address
    const pickupAddress = [
        bakery?.address?.street,
        bakery?.address?.city,
        bakery?.address?.province,
        bakery?.address?.postal_code
    ].filter(Boolean).join(", ");


    //Load Bakery and Cart quote
    useEffect(() => {

        async function loadCheckout() {

            const customer = getCustomer();
            const token = getToken();

            //Customer needs to Login first
            if (!customer || !token) {

                const returnTo = `/${slug}/checkout`;

                localStorage.setItem("authBakerySlug", slug);
                localStorage.setItem("authReturnTo", returnTo);

                navigate(`/${slug}/login?redirect=${encodeURIComponent(returnTo)}`, {
                    replace: true
                });

                return;
            }


            //Cart should not be empty
            if (bakeryCartItems.length === 0) {
                navigate(`/${slug}/cart`, { replace: true });
                return;
            }


            try {

                setError("");

                //Load Bakery
                const bakeryResponse = await fetch(`${API_URL}/api/bakeries/public/${slug}`);
                const bakeryData = await bakeryResponse.json();

                if (!bakeryResponse.ok) {
                    throw new Error(bakeryData.message || "Unable to load Bakery");
                }

                setBakery(bakeryData.bakery);


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
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ items })
                    }
                );

                const quoteData = await quoteResponse.json();

                if (!quoteResponse.ok) {
                    throw new Error(quoteData.message || quoteData.errors?.[0]?.msg || "Unable to verify Cart");
                }

                setCartQuote(quoteData.quote);


                //Restore Pickup if Customer comes back to this page
                const savedPickup = sessionStorage.getItem(`checkoutPickup:${slug}`);

                if (savedPickup) {

                    try {

                        const pickup = JSON.parse(savedPickup);

                        setSelectedDate(pickup.date || "");
                        setSelectedTime(pickup.time || "");
                        setSelectedPickupSlotId(pickup.pickup_slot_id || "");

                        if (pickup.date) {
                            setCurrentMonth(new Date(`${pickup.date}T12:00:00`));
                        }

                    } catch (error) {
                        console.error("Unable to restore Pickup:", error);
                    }
                }

            } catch (error) {

                setError(error.message);

            } finally {

                setIsLoading(false);
            }
        }

        loadCheckout();

    }, [slug, bakeryCartItems, navigate]);


    //Load Pickup availability when Bakery or Calendar month changes
    useEffect(() => {

        if (!bakery) return;

        async function loadAvailability() {

            try {

                setAvailabilityError("");

                const year = currentMonth.getFullYear();
                const month = String(currentMonth.getMonth() + 1).padStart(2, "0");

                //Get Pickup windows from Backend
                const response = await fetch(
                    `${API_URL}/api/pickup-slots/public/${slug}/availability?month=${year}-${month}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load Pickup availability");
                }

                setAvailability(data.availability);

            } catch (error) {

                setAvailability(null);
                setAvailabilityError(error.message);
            }
        }

        loadAvailability();

    }, [bakery, currentMonth, slug]);


    //Go to previous month
    function previousMonth() {

        setCurrentMonth(new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 1,
            1
        ));

        setSelectedDate("");
        setSelectedTime("");
        setSelectedPickupSlotId("");
    }


    //Go to next month
    function nextMonth() {

        setCurrentMonth(new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1
        ));

        setSelectedDate("");
        setSelectedTime("");
        setSelectedPickupSlotId("");
    }


    //Select Pickup date
    function selectDate(date) {

        const day = getDayAvailability(date);

        //Do not allow blocked dates
        if (!day?.available) return;

        setSelectedDate(date);
        setSelectedTime("");
        setSelectedPickupSlotId("");
    }


    //Select Customer Pickup time
    function selectPickupTime(pickupTime) {

        setSelectedTime(pickupTime.time);
        setSelectedPickupSlotId(pickupTime.pickupSlotId);
    }


    //Continue to Contact Details
    function continueCheckout() {

        if (!selectedDate || !selectedTime || !selectedPickupSlotId) return;

        //Save Pickup selection for next Checkout pages
        sessionStorage.setItem(
            `checkoutPickup:${slug}`,
            JSON.stringify({
                date: selectedDate,
                time: selectedTime,
                pickup_slot_id: selectedPickupSlotId
            })
        );

        //Save Cart note
        sessionStorage.setItem(`checkoutNote:${slug}`, cartNote || "");

        navigate(`/${slug}/checkout/details`);
    }


    //Loading
    if (isLoading) {

        return (
            <div className="storefront-checkout-loading d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading Checkout...</span>
                </div>
            </div>
        );
    }


    //Main Checkout error
    if (error || !bakery) {

        return (
            <div className="storefront-checkout-loading d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="h4">Checkout unavailable</h1>

                <p>{error || "Unable to load Checkout"}</p>

                <Link to={`/${slug}/cart`} className="btn btn-dark">
                    Back to Cart
                </Link>

            </div>
        );
    }


    return (

        <div
            className="storefront-checkout-page min-vh-100 d-flex flex-column"
            style={getStorefrontTheme(bakery)}
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar bakery={bakery} />


            {/* Checkout Content */}
            <main className="storefront-checkout-main flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">

                    {/* Back to Cart */}
                    <Link
                        to={`/${slug}/cart`}
                        className="storefront-checkout-back d-inline-flex align-items-center gap-2 text-decoration-none mb-4"
                    >
                        <ArrowLeft size={15} />
                        Back to Cart
                    </Link>


                    {/* Page heading */}
                    <div className="storefront-checkout-heading mb-4">
                        <h1 className="mb-2">Choose pickup</h1>
                        <p className="mb-0">Select an available date and time for your order.</p>
                    </div>


                    <div className="row g-4 align-items-start">

                        {/* Left side */}
                        <div className="col-12 col-lg-8">

                            {/* Pickup information */}
                            <div className="storefront-checkout-notice d-flex align-items-start gap-3 mb-4">

                                <Clock3 size={18} className="flex-shrink-0 mt-1" />

                                <span>
                                    Pickup times are available every {PICKUP_INTERVAL} minutes during the bakery's pickup window.
                                </span>

                            </div>


                            {/* Calendar */}
                            <section className="storefront-checkout-card">

                                {/* Calendar month */}
                                <div className="storefront-checkout-calendar-header d-flex align-items-center justify-content-between">

                                    <button
                                        type="button"
                                        onClick={previousMonth}
                                        className="storefront-checkout-calendar-nav"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <strong>{formatMonth(currentMonth)}</strong>

                                    <button
                                        type="button"
                                        onClick={nextMonth}
                                        className="storefront-checkout-calendar-nav"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight size={18} />
                                    </button>

                                </div>


                                {/* Weekdays */}
                                <div className="storefront-checkout-weekdays">

                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                        <span key={day}>{day}</span>
                                    ))}

                                </div>


                                {/* Calendar dates */}
                                <div className="storefront-checkout-calendar-grid">

                                    {calendarDays.map((calendarDay) => {

                                        //Display blank space before first day
                                        if (calendarDay.empty) {
                                            return <div key={calendarDay.key} className="storefront-checkout-calendar-empty" />;
                                        }

                                        const dayInfo = getDayAvailability(calendarDay.date);
                                        const available = Boolean(dayInfo?.available);
                                        const selected = selectedDate === calendarDay.date;

                                        return (

                                            <button
                                                key={calendarDay.key}
                                                type="button"
                                                disabled={!available}
                                                onClick={() => selectDate(calendarDay.date)}
                                                className={`storefront-checkout-calendar-day ${available
                                                    ? "storefront-checkout-calendar-day-available"
                                                    : "storefront-checkout-calendar-day-blocked"
                                                    } ${selected
                                                        ? "storefront-checkout-calendar-day-selected"
                                                        : ""
                                                    }`}
                                            >
                                                {calendarDay.day}
                                            </button>
                                        );
                                    })}

                                </div>


                                {/* Calendar key */}
                                <div className="storefront-checkout-calendar-legend d-flex flex-wrap gap-3 mt-3">

                                    <span className="d-flex align-items-center gap-2">
                                        <span className="storefront-checkout-legend storefront-checkout-legend-selected" />
                                        Selected
                                    </span>

                                    <span className="d-flex align-items-center gap-2">
                                        <span className="storefront-checkout-legend storefront-checkout-legend-available" />
                                        Available
                                    </span>

                                    <span className="d-flex align-items-center gap-2">
                                        <span className="storefront-checkout-legend storefront-checkout-legend-blocked" />
                                        Blocked
                                    </span>

                                </div>

                            </section>


                            {/* Pickup availability error */}
                            {availabilityError && (

                                <div className="alert alert-warning mt-3 mb-0">
                                    {availabilityError}
                                </div>

                            )}


                            {/* Available times */}
                            {selectedDate && (

                                <section className="storefront-checkout-card mt-3">

                                    <h2 className="storefront-checkout-section-title mb-3">
                                        Available times · {formatPickupDate(selectedDate)}
                                    </h2>


                                    {availablePickupTimes.length > 0 ? (

                                        <div className="d-flex flex-wrap gap-2">

                                            {availablePickupTimes.map((pickupTime) => (

                                                <button
                                                    key={`${pickupTime.pickupSlotId}-${pickupTime.time}`}
                                                    type="button"
                                                    onClick={() => selectPickupTime(pickupTime)}
                                                    className={
                                                        selectedTime === pickupTime.time
                                                            ? "storefront-checkout-time storefront-checkout-time-selected"
                                                            : "storefront-checkout-time"
                                                    }
                                                >
                                                    {formatPickupTime(pickupTime.time)}
                                                </button>

                                            ))}

                                        </div>

                                    ) : (

                                        <p className="small text-secondary mb-0">
                                            No Pickup times are available.
                                        </p>

                                    )}

                                </section>
                            )}


                            {/* Pickup location */}
                            <section className="storefront-checkout-pickup-location mt-3">

                                <div className="d-flex gap-3">

                                    <MapPin size={18} className="flex-shrink-0 mt-1" />

                                    <div>
                                        <strong className="d-block mb-1">Pickup location</strong>
                                        <span>{pickupAddress || bakery.name}</span>
                                    </div>

                                </div>

                            </section>


                            {/* Continue */}
                            <div className="mt-4">

                                <button
                                    type="button"
                                    onClick={continueCheckout}
                                    disabled={!selectedDate || !selectedTime || !selectedPickupSlotId}
                                    className="storefront-checkout-primary-button"
                                >
                                    Continue to details →
                                </button>


                                {(!selectedDate || !selectedTime) && (

                                    <p className="storefront-checkout-helper mt-2 mb-0">
                                        Please select both a date and time to continue.
                                    </p>

                                )}

                            </div>

                        </div>


                        {/* Order Summary */}
                        <div className="col-12 col-lg-4">

                            <aside className="storefront-checkout-summary">

                                <h2 className="storefront-checkout-summary-title">
                                    Order summary
                                </h2>


                                {/* Cart items */}
                                {bakeryCartItems.map((item, index) => {

                                    const quotedItem = cartQuote?.items?.[index];

                                    return (

                                        <div key={item.cart_item_id} className="storefront-checkout-summary-item mb-3">

                                            {/* Product image */}
                                            {item.product_image_url ? (

                                                <img
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    className="storefront-checkout-product-image"
                                                />

                                            ) : (

                                                <div className="storefront-checkout-product-placeholder d-flex align-items-center justify-content-center">
                                                    <ShoppingBag size={18} />
                                                </div>

                                            )}


                                            {/* Product information */}
                                            <div className="min-w-0">

                                                <strong className="storefront-checkout-product-name d-block">
                                                    {item.product_name}
                                                </strong>

                                                <small className="storefront-checkout-product-details">
                                                    Qty {item.quantity}
                                                </small>

                                                {quotedItem?.customizations?.length > 0 && (

                                                    <small className="storefront-checkout-product-details d-block">
                                                        {quotedItem.customizations.map((option) => option.option_name).join(" · ")}
                                                    </small>

                                                )}

                                            </div>

                                        </div>
                                    );
                                })}


                                <hr />


                                {/* Price */}
                                {cartQuote && (

                                    <>
                                        <div className="d-flex justify-content-between gap-3 mb-2">
                                            <span>Total</span>
                                            <strong>{formatPrice(cartQuote.total)}</strong>
                                        </div>


                                        {cartQuote.deposit_required && (

                                            <div className="d-flex justify-content-between gap-3 storefront-checkout-deposit">
                                                <span>Deposit</span>
                                                <strong>{formatPrice(cartQuote.amount_due_now)}</strong>
                                            </div>

                                        )}
                                    </>

                                )}


                                {/* Selected Pickup */}
                                {selectedDate && selectedTime && (

                                    <div className="storefront-checkout-selected-pickup mt-3">

                                        <strong className="d-block mb-1">
                                            Pickup selected
                                        </strong>

                                        <span>
                                            {formatPickupDate(selectedDate)} at {formatPickupTime(selectedTime)}
                                        </span>

                                    </div>

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