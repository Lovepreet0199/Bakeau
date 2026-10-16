//Import React hooks
import {
    useEffect,
    useRef,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

//Import Storefront icons
import {
    Bell,
    ChevronDown,
    Heart,
    LogOut,
    Menu,
    Settings,
    ShoppingBag,
    ShoppingCart,
    X
} from "lucide-react";

//Import Customer Cart hook
import { useCart } from "../../context/useCart";

//Import API URL
import API_URL from "../../config/api.js";

//Import Storefront theme helper
import {
    getStorefrontTheme
} from "../../utils/storefrontTheme";

//Import Navbar styles
import "./StorefrontNavbar.css";


//Requests Notifications from the backend
async function requestCustomerNotifications(
    token
) {

    //Request Notifications
    const response =
        await fetch(
            `${API_URL}/api/notifications`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    //Stop if request failed
    if (!response.ok) {

        return null;
    }


    //Return Notification data
    return await response.json();
}


//Displays the shared Storefront navigation
export default function StorefrontNavbar({
    bakery,
    orderNotice = null
}) {

    //Get Bakery slug from URL
    const { slug } =
        useParams();


    //Used to navigate between Customer pages
    const navigate =
        useNavigate();


    //Get Customer Cart items
    const {
        cartItems
    } = useCart();


    //Count Cart Products for current Bakery only
    const storefrontCartCount =
        cartItems
            .filter(
                (item) =>
                    item.bakery_slug ===
                    slug
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity || 0
                    ),
                0
            );


    //Tracks mobile navigation
    const [
        isMobileMenuOpen,
        setIsMobileMenuOpen
    ] = useState(false);


    //Tracks Customer Account dropdown
    const [
        isAccountOpen,
        setIsAccountOpen
    ] = useState(false);


    //Tracks Customer Notification dropdown
    const [
        isNotificationOpen,
        setIsNotificationOpen
    ] = useState(false);


    //Stores Customer Notifications
    const [
        notifications,
        setNotifications
    ] = useState([]);


    //Stores unread Notification count
    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    //Used to detect outside Account clicks
    const accountDropdownRef =
        useRef(null);


    //Used to detect outside desktop Notification clicks
    const desktopNotificationRef =
        useRef(null);


    //Used to detect outside mobile Notification clicks
    const mobileNotificationRef =
        useRef(null);


    //Gets saved Customer authentication token
    function getStoredToken() {

        return (
            localStorage.getItem(
                "token"
            ) ||
            sessionStorage.getItem(
                "token"
            )
        );
    }


    //Gets currently logged-in Customer
    function getStoredCustomer() {

        //User may be stored in either storage location
        const storedUser =
            localStorage.getItem(
                "user"
            ) ||
            sessionStorage.getItem(
                "user"
            );


        //No logged-in User
        if (!storedUser) {

            return null;
        }


        try {

            //Convert stored User into JavaScript
            const user =
                JSON.parse(
                    storedUser
                );


            //Only Customers belong in Storefront UI
            if (
                user.role !==
                "customer"
            ) {

                return null;
            }


            return user;


        } catch (error) {

            console.error(
                "Unable to read Customer account:",
                error
            );


            return null;
        }
    }


    //Stores logged-in Customer
    const [
        customer,
        setCustomer
    ] = useState(
        getStoredCustomer
    );


    //Refreshes Customer Notifications
    async function refreshNotifications() {

        try {

            //Get Customer token
            const token =
                getStoredToken();


            //Stop for Guest Visitors
            if (
                !token ||
                !customer
            ) {

                return;
            }


            //Get Notifications
            const data =
                await requestCustomerNotifications(
                    token
                );


            //Stop if request failed
            if (!data) {

                return;
            }


            //Store Notifications
            setNotifications(
                data.notifications ||
                []
            );


            //Store unread count
            setUnreadCount(
                data.unread_count ||
                0
            );


        } catch (error) {

            console.error(
                "Customer Notification loading error:",
                error
            );
        }
    }


    //Loads Customer Notifications while signed in
    useEffect(() => {

        //Do nothing for Guests
        if (!customer) {

            return;
        }


        //Prevents updating state after component closes
        let isCancelled =
            false;


        //Loads Notifications
        async function loadNotifications() {

            try {

                //Get token from storage
                const token =
                    localStorage.getItem(
                        "token"
                    ) ||
                    sessionStorage.getItem(
                        "token"
                    );


                //Stop if Customer is not authenticated
                if (!token) {

                    return;
                }


                //Request Notifications
                const data =
                    await requestCustomerNotifications(
                        token
                    );


                //Stop if component closed or request failed
                if (
                    isCancelled ||
                    !data
                ) {

                    return;
                }


                //Store Notifications
                setNotifications(
                    data.notifications ||
                    []
                );


                //Store unread count
                setUnreadCount(
                    data.unread_count ||
                    0
                );


            } catch (error) {

                console.error(
                    "Customer Notification loading error:",
                    error
                );
            }
        }


        /*
            Load after the current render.

            This keeps the Effect clean and
            avoids synchronous state updates.
        */
        const initialNotificationLoad =
            setTimeout(
                () => {

                    loadNotifications();
                },
                0
            );


        //Check for new Notifications every 30 seconds
        const notificationInterval =
            setInterval(
                () => {

                    loadNotifications();
                },
                30000
            );


        //Clean up timers
        return () => {

            isCancelled =
                true;


            clearTimeout(
                initialNotificationLoad
            );


            clearInterval(
                notificationInterval
            );
        };

    }, [customer]);


    //Closes dropdowns when clicking outside
    useEffect(() => {

        function handleOutsideClick(
            event
        ) {

            //Check Account dropdown
            const clickedOutsideAccount =
                !accountDropdownRef.current ||
                !accountDropdownRef.current.contains(
                    event.target
                );


            //Check desktop Notification area
            const clickedOutsideDesktopNotification =
                !desktopNotificationRef.current ||
                !desktopNotificationRef.current.contains(
                    event.target
                );


            //Check mobile Notification area
            const clickedOutsideMobileNotification =
                !mobileNotificationRef.current ||
                !mobileNotificationRef.current.contains(
                    event.target
                );


            //Close menus when click is outside
            if (
                clickedOutsideAccount &&
                clickedOutsideDesktopNotification &&
                clickedOutsideMobileNotification
            ) {

                setIsAccountOpen(
                    false
                );


                setIsNotificationOpen(
                    false
                );
            }
        }


        //Listen for outside clicks
        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        //Remove listener
        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, []);


    //Do not display Navbar until Bakery exists
    if (!bakery) {

        return null;
    }


    //Get Bakery branding colors
    const storefrontTheme =
        getStorefrontTheme(
            bakery
        );


    //Use page notice or Bakery default notice
    const minimumOrderNotice =
        orderNotice ??
        bakery.minimum_order_notice;


    //Create public pickup address
    const pickupAddress = [
        bakery.address?.street,
        bakery.address?.city
    ]
        .filter(Boolean)
        .join(", ");


    //Creates Bakery initials
    function getBakeryInitials() {

        //Fallback when Bakery has no name
        if (
            !bakery?.name?.trim()
        ) {

            return "B";
        }


        //Split Bakery name
        const nameParts =
            bakery.name
                .trim()
                .split(" ");


        //One-word Bakery name
        if (
            nameParts.length ===
            1
        ) {

            return nameParts[0]
                .charAt(0)
                .toUpperCase();
        }


        //Use first two initials
        return (
            nameParts[0]
                .charAt(0) +
            nameParts[1]
                .charAt(0)
        ).toUpperCase();
    }


    //Gets Customer full name
    function getCustomerName() {

        if (!customer) {

            return "Customer";
        }


        const fullName = [
            customer.first_name,
            customer.last_name
        ]
            .filter(Boolean)
            .join(" ");


        return (
            fullName ||
            "Customer"
        );
    }


    //Gets Customer initials
    function getCustomerInitials() {

        if (!customer) {

            return "C";
        }


        //Get first initial
        const firstInitial =
            customer.first_name
                ?.trim()
                .charAt(0) ||
            "";


        //Get last initial
        const lastInitial =
            customer.last_name
                ?.trim()
                .charAt(0) ||
            "";


        //Combine initials
        const initials =
            `${firstInitial}${lastInitial}`
                .toUpperCase();


        return (
            initials ||
            "C"
        );
    }


    //Closes mobile navigation
    function closeMobileMenu() {

        setIsMobileMenuOpen(
            false
        );


        setIsNotificationOpen(
            false
        );
    }


    //Closes Account dropdown
    function closeAccountMenu() {

        setIsAccountOpen(
            false
        );
    }


    //Closes Notification dropdown
    function closeNotificationMenu() {

        setIsNotificationOpen(
            false
        );
    }


    //Opens or closes Customer Notifications
    function toggleNotificationMenu() {

        //Close Account dropdown
        setIsAccountOpen(
            false
        );


        //Close mobile navigation
        setIsMobileMenuOpen(
            false
        );


        //Toggle Notification dropdown
        setIsNotificationOpen(
            (
                currentValue
            ) =>
                !currentValue
        );


        //Refresh Notification information
        if (!isNotificationOpen) {

            refreshNotifications();
        }
    }


    //Marks one Notification as read
    async function handleNotificationClick(
        notification
    ) {

        try {

            //Get Customer token
            const token =
                getStoredToken();


            //Stop if Customer is not authenticated
            if (!token) {

                return;
            }


            //Only update unread Notifications
            if (
                !notification.is_read
            ) {

                //Mark Notification as read
                const response =
                    await fetch(
                        `${API_URL}/api/notifications/${notification._id}/read`,
                        {
                            method:
                                "PATCH",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                //Update local Notification
                if (response.ok) {

                    setNotifications(
                        (
                            currentNotifications
                        ) =>
                            currentNotifications.map(
                                (
                                    currentNotification
                                ) =>
                                    currentNotification._id ===
                                        notification._id
                                        ? {
                                            ...currentNotification,

                                            is_read:
                                                true
                                        }
                                        : currentNotification
                            )
                    );


                    //Reduce unread count
                    setUnreadCount(
                        (
                            currentCount
                        ) =>
                            Math.max(
                                0,
                                currentCount - 1
                            )
                    );
                }
            }


            //Close dropdown
            setIsNotificationOpen(
                false
            );


            //Open related Customer Order
            if (
                notification.order_id
            ) {

                navigate(
                    `/${slug}/orders/${notification.order_id}`
                );
            }


        } catch (error) {

            console.error(
                "Customer Notification update error:",
                error
            );
        }
    }


    //Marks all Customer Notifications as read
    async function handleMarkAllNotificationsRead() {

        try {

            //Get Customer token
            const token =
                getStoredToken();


            //Stop without authentication
            if (!token) {

                return;
            }


            //Update Notifications in backend
            const response =
                await fetch(
                    `${API_URL}/api/notifications/read-all`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            //Stop if request failed
            if (!response.ok) {

                return;
            }


            //Mark all local Notifications as read
            setNotifications(
                (
                    currentNotifications
                ) =>
                    currentNotifications.map(
                        (
                            notification
                        ) => ({
                            ...notification,

                            is_read:
                                true
                        })
                    )
            );


            //Clear unread count
            setUnreadCount(
                0
            );


        } catch (error) {

            console.error(
                "Mark Customer Notifications read error:",
                error
            );
        }
    }


    //Signs Customer out
    function handleSignOut() {

        //Remove local authentication
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        //Remove session authentication
        sessionStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "user"
        );


        //Remove temporary authentication information
        localStorage.removeItem(
            "authReturnTo"
        );

        localStorage.removeItem(
            "authBakerySlug"
        );

        sessionStorage.removeItem(
            "pendingVerificationEmail"
        );


        //Remove Customer from Navbar
        setCustomer(
            null
        );


        //Clear Notifications
        setNotifications(
            []
        );

        setUnreadCount(
            0
        );


        //Close menus
        setIsAccountOpen(
            false
        );

        setIsNotificationOpen(
            false
        );

        setIsMobileMenuOpen(
            false
        );
    }


    return (

        //Apply Bakery theme to Navbar
        <div
            className="storefront-navbar-wrapper"
            style={
                storefrontTheme
            }
        >


            {/* Announcement bar */}
            <div className="storefront-announcement">

                <div className="container-xxl text-center py-2 px-3">

                    <small>

                        {minimumOrderNotice && (

                            <>
                                Orders require{" "}
                                {minimumOrderNotice}{" "}
                                hours' notice
                            </>
                        )}


                        {minimumOrderNotice &&
                            pickupAddress && (

                                <> • </>

                            )}


                        {pickupAddress && (

                            <>
                                Pickup from{" "}
                                {pickupAddress}
                            </>
                        )}

                    </small>

                </div>

            </div>


            {/* Storefront navigation */}
            <header className="storefront-header">

                <div className="container-xxl px-3">


                    {/* Main navigation row */}
                    <div className="d-flex align-items-center justify-content-between gap-2 py-3">


                        {/* Bakery logo and name */}
                        <Link
                            to={`/${slug}`}
                            onClick={() => {

                                closeMobileMenu();

                                closeAccountMenu();

                                closeNotificationMenu();
                            }}
                            className="storefront-brand d-flex align-items-center gap-2 text-decoration-none flex-shrink-1"
                        >

                            {bakery.logo_image_url ? (

                                <img
                                    src={
                                        bakery.logo_image_url
                                    }
                                    alt={`${bakery.name} logo`}
                                    className="storefront-logo flex-shrink-0"
                                />

                            ) : (

                                <div className="storefront-logo-fallback d-flex align-items-center justify-content-center flex-shrink-0">

                                    {
                                        getBakeryInitials()
                                    }

                                </div>
                            )}


                            <span className="storefront-brand-name fw-semibold text-truncate">

                                {
                                    bakery.name
                                }

                            </span>

                        </Link>


                        {/* Desktop navigation */}
                        <nav className="d-none d-lg-flex align-items-center gap-4">

                            <Link
                                to={`/${slug}#menu`}
                                className="storefront-nav-link"
                            >
                                Menu
                            </Link>


                            <Link
                                to={`/${slug}#how-it-works`}
                                className="storefront-nav-link"
                            >
                                How It Works
                            </Link>


                            <Link
                                to={`/${slug}/reviews`}
                                className="storefront-nav-link"
                            >
                                Reviews
                            </Link>


                            <Link
                                to={`/${slug}#about`}
                                className="storefront-nav-link"
                            >
                                About
                            </Link>

                        </nav>


                        {/* Desktop actions */}
                        <div className="d-none d-lg-flex align-items-center gap-3 flex-shrink-0">


                            {/* Customer Cart */}
                            <Link
                                to={`/${slug}/cart`}
                                className="storefront-cart-action d-flex align-items-center gap-2 text-decoration-none"
                            >

                                <ShoppingCart
                                    size={17}
                                />

                                <span>
                                    Cart ({storefrontCartCount})
                                </span>

                            </Link>


                            {/* Customer Notifications */}
                            {customer && (

                                <div
                                    ref={
                                        desktopNotificationRef
                                    }
                                    className="position-relative"
                                >

                                    {/* Notification Bell */}
                                    <button
                                        type="button"
                                        className="storefront-notification-button position-relative d-flex align-items-center justify-content-center"
                                        aria-label="Notifications"
                                        aria-expanded={
                                            isNotificationOpen
                                        }
                                        onClick={
                                            toggleNotificationMenu
                                        }
                                    >

                                        <Bell
                                            size={19}
                                            strokeWidth={1.8}
                                        />


                                        {/* Unread badge */}
                                        {unreadCount > 0 && (

                                            <span className="storefront-notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill">

                                                {
                                                    unreadCount > 9
                                                        ? "9+"
                                                        : unreadCount
                                                }

                                            </span>
                                        )}

                                    </button>


                                    {/* Desktop Notification dropdown */}
                                    {isNotificationOpen && (

                                        <div className="storefront-notification-dropdown position-absolute top-100 end-0 mt-2">


                                            {/* Heading */}
                                            <div className="storefront-notification-heading d-flex align-items-center justify-content-between gap-3">

                                                <div>

                                                    <strong className="d-block">
                                                        Notifications
                                                    </strong>

                                                    <span className="d-block mt-1">
                                                        {unreadCount} unread
                                                    </span>

                                                </div>


                                                {unreadCount > 0 && (

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleMarkAllNotificationsRead
                                                        }
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}

                                            </div>


                                            {/* Notification list */}
                                            <div className="storefront-notification-list">

                                                {notifications.length > 0 ? (

                                                    notifications.map(
                                                        (
                                                            notification
                                                        ) => (

                                                            <button
                                                                key={
                                                                    notification._id
                                                                }
                                                                type="button"
                                                                className={
                                                                    `storefront-notification-item d-flex align-items-start gap-2 w-100 ${notification.is_read
                                                                        ? ""
                                                                        : "unread"
                                                                    }`
                                                                }
                                                                onClick={() =>
                                                                    handleNotificationClick(
                                                                        notification
                                                                    )
                                                                }
                                                            >

                                                                <span
                                                                    className={
                                                                        `storefront-notification-dot d-inline-block rounded-circle flex-shrink-0 ${notification.is_read
                                                                            ? "read"
                                                                            : ""
                                                                        }`
                                                                    }
                                                                />


                                                                <div className="text-start flex-grow-1">

                                                                    <p className="mb-0">
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </p>

                                                                    <span className="d-block mt-1">
                                                                        {
                                                                            new Date(
                                                                                notification.created_at
                                                                            ).toLocaleString()
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </button>
                                                        )
                                                    )

                                                ) : (

                                                    <div className="storefront-notification-empty text-center px-3 py-4">

                                                        <Bell
                                                            size={25}
                                                            strokeWidth={1.6}
                                                        />

                                                        <strong className="d-block mt-2">
                                                            No notifications yet
                                                        </strong>

                                                        <span className="d-block mt-1">
                                                            Order updates will appear here.
                                                        </span>

                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    )}

                                </div>
                            )}


                            {/* Logged-in Customer */}
                            {customer ? (

                                <div
                                    ref={
                                        accountDropdownRef
                                    }
                                    className="position-relative"
                                >

                                    {/* Account button */}
                                    <button
                                        type="button"
                                        aria-expanded={
                                            isAccountOpen
                                        }
                                        aria-haspopup="menu"
                                        onClick={() => {

                                            //Close Notifications
                                            setIsNotificationOpen(
                                                false
                                            );


                                            //Toggle Account menu
                                            setIsAccountOpen(
                                                (
                                                    currentValue
                                                ) =>
                                                    !currentValue
                                            );
                                        }}
                                        className="storefront-account-button d-flex align-items-center gap-2"
                                    >

                                        {/* Customer initials */}
                                        <span className="storefront-account-button-avatar d-flex align-items-center justify-content-center">

                                            {
                                                getCustomerInitials()
                                            }

                                        </span>


                                        <span>
                                            Account
                                        </span>


                                        <ChevronDown
                                            size={14}
                                            className={
                                                isAccountOpen
                                                    ? "storefront-account-chevron storefront-account-chevron-open"
                                                    : "storefront-account-chevron"
                                            }
                                        />

                                    </button>


                                    {/* Account dropdown */}
                                    {isAccountOpen && (

                                        <div
                                            className="storefront-account-dropdown position-absolute top-100 end-0 mt-2"
                                            role="menu"
                                        >

                                            {/* Customer information */}
                                            <div className="storefront-account-profile d-flex align-items-center gap-3 p-3">

                                                <div className="storefront-account-avatar d-flex align-items-center justify-content-center flex-shrink-0">

                                                    {
                                                        getCustomerInitials()
                                                    }

                                                </div>


                                                <div className="overflow-hidden">

                                                    <strong className="storefront-account-name d-block text-truncate">
                                                        {
                                                            getCustomerName()
                                                        }
                                                    </strong>

                                                    <span className="storefront-account-email d-block text-truncate">
                                                        {
                                                            customer.email
                                                        }
                                                    </span>

                                                    <small className="storefront-account-type d-block mt-1">
                                                        Customer account
                                                    </small>

                                                </div>

                                            </div>


                                            <hr className="storefront-account-divider my-0" />


                                            {/* Customer Orders */}
                                            <Link
                                                to={`/${slug}/orders`}
                                                onClick={
                                                    closeAccountMenu
                                                }
                                                className="storefront-account-menu-item d-flex align-items-center gap-2 text-decoration-none px-3 py-2"
                                                role="menuitem"
                                            >

                                                <ShoppingBag
                                                    size={16}
                                                />

                                                <span>
                                                    My Orders
                                                </span>

                                            </Link>

                                            {/* Customer Favourites */}
                                            <Link
                                                to={`/${slug}/favourites`}
                                                onClick={
                                                    closeAccountMenu
                                                }
                                                className="storefront-account-menu-item d-flex align-items-center gap-2 text-decoration-none px-3 py-2"
                                                role="menuitem"
                                            >

                                                <Heart
                                                    size={16}
                                                />

                                                <span>
                                                    My Favourites
                                                </span>

                                            </Link>

                                            {/* Account Settings */}
                                            <Link
                                                to={`/${slug}/account`}
                                                onClick={
                                                    closeAccountMenu
                                                }
                                                className="storefront-account-menu-item d-flex align-items-center gap-2 text-decoration-none px-3 py-2"
                                                role="menuitem"
                                            >

                                                <Settings
                                                    size={16}
                                                />

                                                <span>
                                                    Account Settings
                                                </span>

                                            </Link>


                                            <hr className="storefront-account-divider my-0" />


                                            {/* Sign Out */}
                                            <button
                                                type="button"
                                                onClick={
                                                    handleSignOut
                                                }
                                                className="storefront-account-menu-item storefront-account-logout d-flex align-items-center gap-2 w-100 px-3 py-2"
                                                role="menuitem"
                                            >

                                                <LogOut
                                                    size={16}
                                                />

                                                <span>
                                                    Sign Out
                                                </span>

                                            </button>

                                        </div>
                                    )}

                                </div>

                            ) : (

                                //Guest Customer actions
                                <>

                                    <Link
                                        to={`/${slug}/login`}
                                        className="storefront-text-action text-decoration-none"
                                    >
                                        Sign In
                                    </Link>


                                    <Link
                                        to={`/${slug}/register`}
                                        className="storefront-create-account text-decoration-none px-3 py-2"
                                    >
                                        Create Account
                                    </Link>

                                </>
                            )}

                        </div>


                        {/* Mobile actions */}
                        <div
                            ref={
                                mobileNotificationRef
                            }
                            className="d-flex d-lg-none align-items-center gap-2 flex-shrink-0 position-relative"
                        >


                            {/* Mobile Cart */}
                            <Link
                                to={`/${slug}/cart`}
                                aria-label="Open cart"
                                className="storefront-mobile-cart d-flex align-items-center gap-1 text-decoration-none"
                            >

                                <ShoppingCart
                                    size={19}
                                />

                                <span className="small">
                                    {storefrontCartCount}
                                </span>

                            </Link>


                            {/* Mobile Notification Bell */}
                            {customer && (

                                <button
                                    type="button"
                                    aria-label="Notifications"
                                    aria-expanded={
                                        isNotificationOpen
                                    }
                                    className="storefront-notification-button position-relative d-flex align-items-center justify-content-center"
                                    onClick={
                                        toggleNotificationMenu
                                    }
                                >

                                    <Bell
                                        size={19}
                                        strokeWidth={1.8}
                                    />


                                    {unreadCount > 0 && (

                                        <span className="storefront-notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill">

                                            {
                                                unreadCount > 9
                                                    ? "9+"
                                                    : unreadCount
                                            }

                                        </span>
                                    )}

                                </button>
                            )}


                            {/* Burger Menu */}
                            <button
                                type="button"
                                aria-label={
                                    isMobileMenuOpen
                                        ? "Close navigation menu"
                                        : "Open navigation menu"
                                }
                                aria-expanded={
                                    isMobileMenuOpen
                                }
                                aria-controls="storefront-mobile-menu"
                                onClick={() => {

                                    //Close Notifications
                                    setIsNotificationOpen(
                                        false
                                    );


                                    //Toggle navigation
                                    setIsMobileMenuOpen(
                                        (
                                            currentValue
                                        ) =>
                                            !currentValue
                                    );
                                }}
                                className="storefront-mobile-menu-button d-flex align-items-center justify-content-center"
                            >

                                {isMobileMenuOpen ? (

                                    <X
                                        size={21}
                                    />

                                ) : (

                                    <Menu
                                        size={21}
                                    />
                                )}

                            </button>


                            {/* Mobile Notification dropdown */}
                            {customer &&
                                isNotificationOpen && (

                                    <div className="storefront-notification-dropdown position-absolute top-100 end-0 mt-2">


                                        {/* Heading */}
                                        <div className="storefront-notification-heading d-flex align-items-center justify-content-between gap-3">

                                            <div>

                                                <strong className="d-block">
                                                    Notifications
                                                </strong>

                                                <span className="d-block mt-1">
                                                    {unreadCount} unread
                                                </span>

                                            </div>


                                            {unreadCount > 0 && (

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleMarkAllNotificationsRead
                                                    }
                                                >
                                                    Mark all read
                                                </button>
                                            )}

                                        </div>


                                        {/* Notification list */}
                                        <div className="storefront-notification-list">

                                            {notifications.length > 0 ? (

                                                notifications.map(
                                                    (
                                                        notification
                                                    ) => (

                                                        <button
                                                            key={
                                                                notification._id
                                                            }
                                                            type="button"
                                                            className={
                                                                `storefront-notification-item d-flex align-items-start gap-2 w-100 ${notification.is_read
                                                                    ? ""
                                                                    : "unread"
                                                                }`
                                                            }
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                        >

                                                            <span
                                                                className={
                                                                    `storefront-notification-dot d-inline-block rounded-circle flex-shrink-0 ${notification.is_read
                                                                        ? "read"
                                                                        : ""
                                                                    }`
                                                                }
                                                            />


                                                            <div className="text-start flex-grow-1">

                                                                <p className="mb-0">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>

                                                                <span className="d-block mt-1">
                                                                    {
                                                                        new Date(
                                                                            notification.created_at
                                                                        ).toLocaleString()
                                                                    }
                                                                </span>

                                                            </div>

                                                        </button>
                                                    )
                                                )

                                            ) : (

                                                <div className="storefront-notification-empty text-center px-3 py-4">

                                                    <Bell
                                                        size={25}
                                                        strokeWidth={1.6}
                                                    />

                                                    <strong className="d-block mt-2">
                                                        No notifications yet
                                                    </strong>

                                                    <span className="d-block mt-1">
                                                        Order updates will appear here.
                                                    </span>

                                                </div>
                                            )}

                                        </div>

                                    </div>
                                )}

                        </div>

                    </div>


                    {/* Mobile navigation */}
                    {isMobileMenuOpen && (

                        <div
                            id="storefront-mobile-menu"
                            className="d-lg-none pb-3"
                        >

                            <div className="storefront-mobile-menu p-3">


                                {/* Storefront links */}
                                <nav className="d-grid gap-1">

                                    <Link
                                        to={`/${slug}#menu`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        Menu
                                    </Link>


                                    <Link
                                        to={`/${slug}#how-it-works`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        How It Works
                                    </Link>


                                    <Link
                                        to={`/${slug}/reviews`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        Reviews
                                    </Link>


                                    <Link
                                        to={`/${slug}#about`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        About
                                    </Link>

                                </nav>


                                <hr className="storefront-mobile-divider my-3" />


                                {/* Logged-in Customer */}
                                {customer ? (

                                    <div className="storefront-mobile-account">


                                        {/* Customer information */}
                                        <div className="storefront-mobile-account-profile d-flex align-items-center gap-3 p-3">

                                            <div className="storefront-account-avatar d-flex align-items-center justify-content-center flex-shrink-0">

                                                {
                                                    getCustomerInitials()
                                                }

                                            </div>


                                            <div className="overflow-hidden flex-grow-1">

                                                <strong className="storefront-account-name d-block text-truncate">
                                                    {
                                                        getCustomerName()
                                                    }
                                                </strong>

                                                <span className="storefront-account-email d-block text-truncate">
                                                    {
                                                        customer.email
                                                    }
                                                </span>

                                                <small className="storefront-account-type d-block mt-1">
                                                    Customer account
                                                </small>

                                            </div>

                                        </div>


                                        {/* Customer links */}
                                        <div className="d-grid gap-1 mt-2">

                                            <Link
                                                to={`/${slug}/orders`}
                                                onClick={
                                                    closeMobileMenu
                                                }
                                                className="storefront-mobile-account-link d-flex align-items-center gap-2 text-decoration-none px-3 py-2"
                                            >

                                                <ShoppingBag
                                                    size={16}
                                                />

                                                <span>
                                                    My Orders
                                                </span>

                                            </Link>

                                            {/* Customer Favourites */}
                                            <Link
                                                to={`/${slug}/favourites`}
                                                onClick={
                                                    closeMobileMenu
                                                }
                                                className="storefront-mobile-account-link d-flex align-items-center gap-2 text-decoration-none px-3 py-2"
                                            >

                                                <Heart
                                                    size={16}
                                                />

                                                <span>
                                                    My Favourites
                                                </span>

                                            </Link>

                                            <Link
                                                to={`/${slug}/account`}
                                                onClick={
                                                    closeMobileMenu
                                                }
                                                className="storefront-mobile-account-link d-flex align-items-center gap-2 text-decoration-none px-3 py-2"
                                            >

                                                <Settings
                                                    size={16}
                                                />

                                                <span>
                                                    Account Settings
                                                </span>

                                            </Link>


                                            <button
                                                type="button"
                                                onClick={
                                                    handleSignOut
                                                }
                                                className="storefront-mobile-account-link storefront-mobile-logout d-flex align-items-center gap-2 px-3 py-2"
                                            >

                                                <LogOut
                                                    size={16}
                                                />

                                                <span>
                                                    Sign Out
                                                </span>

                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    //Guest actions
                                    <div className="d-grid gap-2">

                                        <Link
                                            to={`/${slug}/login`}
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className="storefront-mobile-signin text-center text-decoration-none py-2 px-3"
                                        >
                                            Sign In
                                        </Link>


                                        <Link
                                            to={`/${slug}/register`}
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className="storefront-mobile-create-account text-center text-decoration-none py-2 px-3"
                                        >
                                            Create Account
                                        </Link>

                                    </div>
                                )}

                            </div>

                        </div>
                    )}

                </div>

            </header>

        </div>
    );
}