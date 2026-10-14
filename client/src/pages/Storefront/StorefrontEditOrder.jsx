import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

//Import icons
import {
    ChevronLeft,
    ChevronRight
} from "lucide-react";

//Import Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Edit Order styles
import "./StorefrontEditOrder.css";


//Displays editable information for a pending Customer Order
export default function StorefrontEditOrder() {

    //Get Bakery slug and Order ID
    const {
        slug,
        orderId
    } = useParams();

    //Used to navigate Customer
    const navigate =
        useNavigate();


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);

    //Stores Customer Order
    const [
        order,
        setOrder
    ] = useState(null);


    //Stores Pickup availability
    const [
        availability,
        setAvailability
    ] = useState(null);

    //Tracks Pickup availability loading
    const [
        isAvailabilityLoading,
        setIsAvailabilityLoading
    ] = useState(false);

    //Stores Pickup availability error
    const [
        availabilityError,
        setAvailabilityError
    ] = useState("");


    //Tracks displayed Calendar month
    const [
        currentMonth,
        setCurrentMonth
    ] = useState(
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        )
    );


    //Stores selected Pickup date
    const [
        selectedDate,
        setSelectedDate
    ] = useState("");

    //Stores selected Pickup time
    const [
        selectedTime,
        setSelectedTime
    ] = useState("");

    //Stores selected Pickup Slot ID
    const [
        selectedPickupSlotId,
        setSelectedPickupSlotId
    ] = useState("");


    //Stores original Pickup date
    const [
        originalPickupDate,
        setOriginalPickupDate
    ] = useState("");


    //Stores editable Contact information
    const [
        firstName,
        setFirstName
    ] = useState("");

    const [
        lastName,
        setLastName
    ] = useState("");

    const [
        email,
        setEmail
    ] = useState("");

    const [
        phoneNumber,
        setPhoneNumber
    ] = useState("");


    //Stores optional Bakery note
    const [
        bakeryNote,
        setBakeryNote
    ] = useState("");


    //Tracks page loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    //Tracks Order update request
    const [
        isSaving,
        setIsSaving
    ] = useState(false);

    //Stores page errors
    const [
        error,
        setError
    ] = useState("");


    //Gets Customer authentication token
    function getToken() {

        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }


    //Converts Order date into YYYY-MM-DD
    function getDateKey(date) {

        if (!date) {
            return "";
        }

        return new Date(
            date
        )
            .toISOString()
            .split("T")[0];
    }


    //Formats Date object into YYYY-MM-DD
    function formatDateKey(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;
    }


    //Formats Calendar heading
    function formatMonthHeading(date) {

        return date.toLocaleDateString(
            "en-CA",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );
    }


    //Formats Pickup date for display
    function formatPickupDate(dateKey) {

        if (!dateKey) {
            return "";
        }

        return new Date(
            `${dateKey}T12:00:00`
        ).toLocaleDateString(
            "en-CA",
            {
                weekday:
                    "short",

                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );
    }


    //Formats 24-hour Pickup time for display
    function formatPickupTime(time) {

        if (!time) {
            return "";
        }

        const [
            hour,
            minute
        ] = time.split(":");

        const date =
            new Date();

        date.setHours(
            Number(hour),
            Number(minute),
            0,
            0
        );

        return date.toLocaleTimeString(
            "en-CA",
            {
                hour:
                    "numeric",

                minute:
                    "2-digit",

                hour12:
                    true
            }
        );
    }


    //Converts 12-hour time into minutes
    function convert12HourTimeToMinutes(
        time
    ) {

        const match =
            time
                .trim()
                .match(
                    /^(\d{1,2}):(\d{2})\s(AM|PM)$/i
                );


        if (!match) {
            return null;
        }


        let hours =
            Number(
                match[1]
            );

        const minutes =
            Number(
                match[2]
            );

        const period =
            match[3]
                .toUpperCase();


        if (
            period === "PM" &&
            hours !== 12
        ) {

            hours += 12;
        }


        if (
            period === "AM" &&
            hours === 12
        ) {

            hours = 0;
        }


        return (
            hours * 60 +
            minutes
        );
    }


    //Converts minutes into 24-hour HH:MM
    function convertMinutesToTime(
        totalMinutes
    ) {

        const hours =
            Math.floor(
                totalMinutes / 60
            );

        const minutes =
            totalMinutes % 60;


        return (
            `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
        );
    }


    //Creates 30-minute Customer times from one Pickup window
    function createPickupTimes(
        pickupWindow
    ) {

        if (!pickupWindow) {
            return [];
        }


        const parts =
            pickupWindow.split(
                " - "
            );


        if (
            parts.length !==
            2
        ) {

            return [];
        }


        const startMinutes =
            convert12HourTimeToMinutes(
                parts[0]
            );

        const endMinutes =
            convert12HourTimeToMinutes(
                parts[1]
            );


        if (
            startMinutes === null ||
            endMinutes === null
        ) {

            return [];
        }


        const times = [];


        //Pickup times use 30-minute intervals
        for (
            let current =
                startMinutes;

            current <
            endMinutes;

            current += 30
        ) {

            times.push(
                convertMinutesToTime(
                    current
                )
            );
        }


        return times;
    }


    //Build Calendar cells for displayed month
    function buildCalendarDays() {

        const year =
            currentMonth.getFullYear();

        const month =
            currentMonth.getMonth();


        const firstDay =
            new Date(
                year,
                month,
                1
            );

        const lastDay =
            new Date(
                year,
                month + 1,
                0
            );


        const firstWeekday =
            firstDay.getDay();

        const days = [];


        //Add empty Calendar cells
        for (
            let index = 0;
            index < firstWeekday;
            index += 1
        ) {

            days.push({

                type:
                    "empty",

                key:
                    `empty-${index}`
            });
        }


        //Add actual Calendar days
        for (
            let day = 1;
            day <=
            lastDay.getDate();
            day += 1
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );

            const dateKey =
                formatDateKey(
                    date
                );


            days.push({

                type:
                    "date",

                key:
                    dateKey,

                date:
                    dateKey,

                day:
                    day
            });
        }


        return days;
    }


    //Calendar days
    const calendarDays =
        buildCalendarDays();


    //Gets availability for one date
    function getDayAvailability(
        dateKey
    ) {

        return (
            availability?.days?.find(
                (day) =>
                    day.date ===
                    dateKey
            ) ||
            null
        );
    }


    //Gets selected day's available Pickup options
    function getSelectedDayTimes() {

        const day =
            getDayAvailability(
                selectedDate
            );


        const options = [];


        //Create times from available Pickup windows
        day?.windows?.forEach(
            (window) => {

                const times =
                    createPickupTimes(
                        window.pickup_window
                    );


                times.forEach(
                    (time) => {

                        options.push({

                            pickup_slot_id:
                                window.pickup_slot_id,

                            time:
                                time
                        });
                    }
                );
            }
        );


        //Keep current Order Pickup available
        //even if the day reached its Order limit
        if (
            selectedDate ===
            originalPickupDate &&
            order
        ) {

            const currentSlotId =
                order.pickup_slot_id?._id ||
                order.pickup_slot_id;

            const alreadyIncluded =
                options.some(
                    (option) =>
                        option.time ===
                        order.pickup_time
                );


            if (!alreadyIncluded) {

                options.push({

                    pickup_slot_id:
                        currentSlotId,

                    time:
                        order.pickup_time
                });
            }
        }


        //Remove duplicate Pickup times
        const uniqueOptions =
            Array.from(
                new Map(
                    options.map(
                        (option) => [
                            option.time,
                            option
                        ]
                    )
                ).values()
            );


        //Sort times
        return uniqueOptions.sort(
            (first, second) =>
                first.time.localeCompare(
                    second.time
                )
        );
    }


    //Available Pickup times for selected date
    const availablePickupTimes =
        getSelectedDayTimes();


    //Load Bakery and Customer Order
    useEffect(() => {

        async function loadEditOrder() {

            const token =
                getToken();


            //Customer must be logged in
            if (!token) {

                navigate(
                    `/store/${slug}/login`,
                    {
                        replace:
                            true
                    }
                );

                return;
            }


            try {

                setError("");


                //Load Bakery
                const bakeryResponse =
                    await fetch(
                        `${API_URL}/api/bakeries/public/${slug}`
                    );

                const bakeryData =
                    await bakeryResponse.json();


                if (!bakeryResponse.ok) {

                    throw new Error(
                        bakeryData.message ||
                        "Unable to load Bakery"
                    );
                }


                setBakery(
                    bakeryData.bakery
                );


                //Load Customer Order
                const orderResponse =
                    await fetch(
                        `${API_URL}/api/orders/mine/${orderId}`,
                        {
                            headers: {

                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const orderData =
                    await orderResponse.json();


                if (!orderResponse.ok) {

                    throw new Error(
                        orderData.message ||
                        "Unable to load Order"
                    );
                }


                const loadedOrder =
                    orderData.order;


                //Only pending Orders can be edited
                if (
                    loadedOrder.status !==
                    "pending"
                ) {

                    throw new Error(
                        "Only pending orders can be edited"
                    );
                }


                setOrder(
                    loadedOrder
                );


                //Get current Pickup date
                const currentPickupDate =
                    getDateKey(
                        loadedOrder.pickup_date
                    );


                //Fill existing Pickup information
                setSelectedDate(
                    currentPickupDate
                );

                setOriginalPickupDate(
                    currentPickupDate
                );

                setSelectedTime(
                    loadedOrder.pickup_time ||
                    ""
                );

                setSelectedPickupSlotId(
                    loadedOrder.pickup_slot_id?._id ||
                    loadedOrder.pickup_slot_id ||
                    ""
                );


                //Open Calendar on current Pickup month
                if (
                    currentPickupDate
                ) {

                    setCurrentMonth(
                        new Date(
                            `${currentPickupDate}T12:00:00`
                        )
                    );
                }


                //Fill existing Contact information
                setFirstName(
                    loadedOrder.contact_first_name ||
                    ""
                );

                setLastName(
                    loadedOrder.contact_last_name ||
                    ""
                );

                setEmail(
                    loadedOrder.contact_email ||
                    ""
                );

                setPhoneNumber(
                    loadedOrder.contact_phone ||
                    ""
                );

                setBakeryNote(
                    loadedOrder.bakery_note ||
                    ""
                );


            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setIsLoading(
                    false
                );
            }
        }


        loadEditOrder();

    }, [
        slug,
        orderId,
        navigate
    ]);


    //Load Pickup availability for displayed month
    useEffect(() => {

        if (!bakery) {
            return;
        }


        async function loadAvailability() {

            try {

                setIsAvailabilityLoading(
                    true
                );

                setAvailabilityError("");


                const year =
                    currentMonth.getFullYear();

                const month =
                    String(
                        currentMonth.getMonth() +
                        1
                    ).padStart(
                        2,
                        "0"
                    );


                const response =
                    await fetch(
                        `${API_URL}/api/pickup-slots/public/${slug}/availability?month=${year}-${month}`
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load Pickup availability"
                    );
                }


                setAvailability(
                    data.availability
                );


            } catch (error) {

                setAvailabilityError(
                    error.message
                );

                setAvailability(
                    null
                );

            } finally {

                setIsAvailabilityLoading(
                    false
                );
            }
        }


        loadAvailability();

    }, [
        bakery,
        currentMonth,
        slug
    ]);


    //Move Calendar backward one month
    function handlePreviousMonth() {

        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
            )
        );

        setSelectedDate("");
        setSelectedTime("");
        setSelectedPickupSlotId("");
    }


    //Move Calendar forward one month
    function handleNextMonth() {

        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
            )
        );

        setSelectedDate("");
        setSelectedTime("");
        setSelectedPickupSlotId("");
    }


    //Select Pickup date
    function handleDateSelect(
        dateKey
    ) {

        const day =
            getDayAvailability(
                dateKey
            );


        //Current Pickup date remains selectable
        const isCurrentDate =
            dateKey ===
            originalPickupDate;


        //Only available dates may be selected
        if (
            !day?.available &&
            !isCurrentDate
        ) {

            return;
        }


        setSelectedDate(
            dateKey
        );

        setSelectedTime("");

        setSelectedPickupSlotId("");
    }


    //Select Pickup time
    function handleTimeSelect(
        option
    ) {

        setSelectedTime(
            option.time
        );

        setSelectedPickupSlotId(
            option.pickup_slot_id
        );
    }


    //Saves edited Order information
    async function handleSaveOrder(
        event
    ) {

        event.preventDefault();


        if (!order) {
            return;
        }


        //Validate Pickup
        if (
            !selectedDate ||
            !selectedTime ||
            !selectedPickupSlotId
        ) {

            setError(
                "Please select a pickup date and time."
            );

            return;
        }


        //Validate Contact information
        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !phoneNumber.trim()
        ) {

            setError(
                "Please complete all contact fields."
            );

            return;
        }


        //Validate Bakery note
        if (
            bakeryNote.length >
            300
        ) {

            setError(
                "Bakery note cannot be longer than 300 characters."
            );

            return;
        }


        setIsSaving(
            true
        );

        setError("");


        try {

            const token =
                getToken();


            //Update pending Order
            const response =
                await fetch(
                    `${API_URL}/api/orders/mine/${orderId}`,
                    {
                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({

                                //Updated Pickup information
                                pickup_slot_id:
                                    selectedPickupSlotId,

                                pickup_time:
                                    selectedTime,


                                //Updated Contact information
                                contact: {

                                    first_name:
                                        firstName.trim(),

                                    last_name:
                                        lastName.trim(),

                                    email:
                                        email.trim(),

                                    phone_number:
                                        phoneNumber.trim()
                                },


                                //Updated Bakery note
                                bakery_note:
                                    bakeryNote.trim()
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update Order"
                );
            }


            //Return to Order Tracking
            navigate(
                `/store/${slug}/orders/${orderId}`,
                {
                    replace:
                        true,

                    state: {
                        orderUpdated:
                            true
                    }
                }
            );


        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setIsSaving(
                false
            );
        }
    }


    //Loading
    if (isLoading) {

        return (

            <div className="storefront-edit-order-loading d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading Order...
                    </span>

                </div>

            </div>
        );
    }


    //Loading error
    if (
        error &&
        (!bakery || !order)
    ) {

        return (

            <div className="storefront-edit-order-loading d-flex flex-column align-items-center justify-content-center text-center gap-3 p-4">

                <h1 className="h4 mb-0">
                    Unable to edit Order
                </h1>

                <p className="text-secondary mb-0">
                    {error}
                </p>

                <Link
                    to={`/store/${slug}/orders/${orderId}`}
                    className="btn btn-dark"
                >
                    Back to Order
                </Link>

            </div>
        );
    }


    return (

        //Apply Bakery theme
        <div
            className="storefront-edit-order-page min-vh-100 d-flex flex-column"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar
                bakery={bakery}
            />


            {/* Edit Order Content */}
            <main className="flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">


                    {/* Back */}
                    <Link
                        to={`/store/${slug}/orders/${orderId}`}
                        className="storefront-edit-order-back text-decoration-none"
                    >
                        ‹ Back to Order
                    </Link>


                    {/* Page Heading */}
                    <div className="storefront-edit-order-heading mt-3 mb-4">

                        <span>
                            EDIT ORDER
                        </span>

                        <h1 className="mb-2">
                            Update your Order
                        </h1>

                        <p className="mb-0">
                            Changes can be made while your Order is still pending.
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleSaveOrder
                        }
                    >

                        <div className="row g-4">


                            {/* Main Form */}
                            <div className="col-12 col-lg-8">


                                {/* Pickup Details */}
                                <section className="storefront-edit-order-card mb-3">

                                    <h2 className="storefront-edit-order-section-title">
                                        Pickup details
                                    </h2>


                                    {/* Calendar Header */}
                                    <div className="d-flex align-items-center justify-content-between gap-3 mb-3">

                                        <button
                                            type="button"
                                            className="storefront-edit-order-calendar-arrow d-flex align-items-center justify-content-center"
                                            onClick={
                                                handlePreviousMonth
                                            }
                                            aria-label="Previous month"
                                        >
                                            <ChevronLeft
                                                size={17}
                                            />
                                        </button>


                                        <strong className="storefront-edit-order-calendar-heading">
                                            {
                                                formatMonthHeading(
                                                    currentMonth
                                                )
                                            }
                                        </strong>


                                        <button
                                            type="button"
                                            className="storefront-edit-order-calendar-arrow d-flex align-items-center justify-content-center"
                                            onClick={
                                                handleNextMonth
                                            }
                                            aria-label="Next month"
                                        >
                                            <ChevronRight
                                                size={17}
                                            />
                                        </button>

                                    </div>


                                    {/* Weekday Labels */}
                                    <div className="storefront-edit-order-calendar-grid mb-2">

                                        {[
                                            "Sun",
                                            "Mon",
                                            "Tue",
                                            "Wed",
                                            "Thu",
                                            "Fri",
                                            "Sat"
                                        ].map(
                                            (day) => (

                                                <span
                                                    key={
                                                        day
                                                    }
                                                    className="storefront-edit-order-weekday"
                                                >
                                                    {day}
                                                </span>

                                            )
                                        )}

                                    </div>


                                    {/* Calendar */}
                                    {isAvailabilityLoading ? (

                                        <div className="text-center py-4">

                                            <div
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            />

                                        </div>

                                    ) : (

                                        <div className="storefront-edit-order-calendar-grid">

                                            {calendarDays.map(
                                                (calendarDay) => {

                                                    if (
                                                        calendarDay.type ===
                                                        "empty"
                                                    ) {

                                                        return (
                                                            <span
                                                                key={
                                                                    calendarDay.key
                                                                }
                                                            />
                                                        );
                                                    }


                                                    const dayAvailability =
                                                        getDayAvailability(
                                                            calendarDay.date
                                                        );


                                                    const isOriginalDate =
                                                        calendarDay.date ===
                                                        originalPickupDate;


                                                    const available =
                                                        dayAvailability?.available ||
                                                        isOriginalDate;


                                                    const selected =
                                                        selectedDate ===
                                                        calendarDay.date;


                                                    return (

                                                        <button
                                                            key={
                                                                calendarDay.key
                                                            }
                                                            type="button"
                                                            disabled={
                                                                !available
                                                            }
                                                            onClick={() =>
                                                                handleDateSelect(
                                                                    calendarDay.date
                                                                )
                                                            }
                                                            className={
                                                                selected
                                                                    ? "storefront-edit-order-calendar-day storefront-edit-order-calendar-day-selected"
                                                                    : available
                                                                        ? "storefront-edit-order-calendar-day storefront-edit-order-calendar-day-available"
                                                                        : "storefront-edit-order-calendar-day storefront-edit-order-calendar-day-disabled"
                                                            }
                                                        >
                                                            {
                                                                calendarDay.day
                                                            }
                                                        </button>

                                                    );
                                                }
                                            )}

                                        </div>

                                    )}


                                    {/* Availability Error */}
                                    {availabilityError && (

                                        <div className="alert alert-warning mt-3 mb-0">

                                            {
                                                availabilityError
                                            }

                                        </div>

                                    )}


                                    {/* Pickup Times */}
                                    {selectedDate && (

                                        <div className="storefront-edit-order-times mt-4">

                                            <strong className="d-block mb-3">

                                                Available times ·{" "}

                                                {
                                                    formatPickupDate(
                                                        selectedDate
                                                    )
                                                }

                                            </strong>


                                            {availablePickupTimes.length >
                                                0 ? (

                                                <div className="d-flex flex-wrap gap-2">

                                                    {availablePickupTimes.map(
                                                        (option) => (

                                                            <button
                                                                key={
                                                                    `${option.pickup_slot_id}-${option.time}`
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    handleTimeSelect(
                                                                        option
                                                                    )
                                                                }
                                                                className={
                                                                    selectedTime ===
                                                                        option.time
                                                                        ? "storefront-edit-order-time storefront-edit-order-time-selected"
                                                                        : "storefront-edit-order-time"
                                                                }
                                                            >

                                                                {
                                                                    formatPickupTime(
                                                                        option.time
                                                                    )
                                                                }

                                                            </button>

                                                        )
                                                    )}

                                                </div>

                                            ) : (

                                                <p className="text-secondary small mb-0">

                                                    No Pickup times are available for this date.

                                                </p>

                                            )}

                                        </div>

                                    )}

                                </section>


                                {/* Contact Information */}
                                <section className="storefront-edit-order-card mb-3">

                                    <h2 className="storefront-edit-order-section-title">
                                        Contact information
                                    </h2>


                                    <div className="row g-3">

                                        {/* First Name */}
                                        <div className="col-12 col-md-6">

                                            <label
                                                htmlFor="editOrderFirstName"
                                                className="form-label"
                                            >
                                                First name
                                            </label>

                                            <input
                                                id="editOrderFirstName"
                                                type="text"
                                                className="form-control"
                                                value={
                                                    firstName
                                                }
                                                onChange={(event) =>
                                                    setFirstName(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* Last Name */}
                                        <div className="col-12 col-md-6">

                                            <label
                                                htmlFor="editOrderLastName"
                                                className="form-label"
                                            >
                                                Last name
                                            </label>

                                            <input
                                                id="editOrderLastName"
                                                type="text"
                                                className="form-control"
                                                value={
                                                    lastName
                                                }
                                                onChange={(event) =>
                                                    setLastName(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* Email */}
                                        <div className="col-12 col-md-6">

                                            <label
                                                htmlFor="editOrderEmail"
                                                className="form-label"
                                            >
                                                Email
                                            </label>

                                            <input
                                                id="editOrderEmail"
                                                type="email"
                                                className="form-control"
                                                value={
                                                    email
                                                }
                                                onChange={(event) =>
                                                    setEmail(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* Phone */}
                                        <div className="col-12 col-md-6">

                                            <label
                                                htmlFor="editOrderPhone"
                                                className="form-label"
                                            >
                                                Phone number
                                            </label>

                                            <input
                                                id="editOrderPhone"
                                                type="tel"
                                                className="form-control"
                                                value={
                                                    phoneNumber
                                                }
                                                onChange={(event) =>
                                                    setPhoneNumber(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>

                                    </div>

                                </section>


                                {/* Bakery Note */}
                                <section className="storefront-edit-order-card mb-3">

                                    <h2 className="storefront-edit-order-section-title">
                                        Note for the Bakery
                                    </h2>

                                    <textarea
                                        className="form-control"
                                        rows={5}
                                        maxLength={300}
                                        value={
                                            bakeryNote
                                        }
                                        onChange={(event) =>
                                            setBakeryNote(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Add any notes or requests for the Bakery..."
                                    />

                                    <div className="d-flex justify-content-end mt-2">

                                        <small className="text-secondary">

                                            {
                                                bakeryNote.length
                                            }
                                            /300

                                        </small>

                                    </div>

                                </section>


                                {/* Error */}
                                {error && (

                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>

                                )}


                                {/* Actions */}
                                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">

                                    <Link
                                        to={`/store/${slug}/orders/${orderId}`}
                                        className="storefront-edit-order-secondary-button text-decoration-none text-center"
                                    >
                                        Cancel
                                    </Link>


                                    <button
                                        type="submit"
                                        className="storefront-edit-order-primary-button"
                                        disabled={
                                            isSaving ||
                                            !selectedDate ||
                                            !selectedTime ||
                                            !selectedPickupSlotId
                                        }
                                    >

                                        {
                                            isSaving
                                                ? "Saving..."
                                                : "Save Changes"
                                        }

                                    </button>

                                </div>

                            </div>


                            {/* Order Summary */}
                            <div className="col-12 col-lg-4">

                                <aside className="storefront-edit-order-card">

                                    <h2 className="storefront-edit-order-section-title">
                                        Updated Order
                                    </h2>


                                    <div className="storefront-edit-order-summary-row">

                                        <span>
                                            Order
                                        </span>

                                        <strong>
                                            {
                                                order.order_number
                                            }
                                        </strong>

                                    </div>


                                    <div className="storefront-edit-order-summary-row">

                                        <span>
                                            Status
                                        </span>

                                        <strong className="text-capitalize">
                                            {
                                                order.status
                                            }
                                        </strong>

                                    </div>


                                    <div className="storefront-edit-order-summary-row">

                                        <span>
                                            Pickup date
                                        </span>

                                        <strong>
                                            {
                                                formatPickupDate(
                                                    selectedDate
                                                ) ||
                                                "Not selected"
                                            }
                                        </strong>

                                    </div>


                                    <div className="storefront-edit-order-summary-row">

                                        <span>
                                            Pickup time
                                        </span>

                                        <strong>
                                            {
                                                formatPickupTime(
                                                    selectedTime
                                                ) ||
                                                "Not selected"
                                            }
                                        </strong>

                                    </div>


                                    <p className="storefront-edit-order-helper mb-0 mt-3">

                                        Product items and pricing are not changed when editing these Order details.

                                    </p>

                                </aside>

                            </div>

                        </div>

                    </form>

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter
                bakery={bakery}
            />

        </div>
    );
}