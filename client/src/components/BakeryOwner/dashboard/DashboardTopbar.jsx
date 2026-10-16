//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router navigation
import {
    useNavigate
} from "react-router-dom";

//Import topbar icons
import {
    Bell,
    Search,
    ChevronDown,
    Menu,
    Settings,
    CircleHelp,
    LogOut
} from "lucide-react";

//Import API URL
import API_URL from "../../../config/api.js";

//Import authentication helpers
import {
    getAuthToken,
    getAuthUser,
    clearAuth
} from "../../../utils/authStorage";


//Gets Bakery Owner Notifications
async function fetchNotifications() {

    //Get logged-in Bakery Owner token
    const token =
        getAuthToken();


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


    const data =
        await response.json();


    //Stop if Notifications could not be loaded
    if (!response.ok) {

        throw new Error(
            data.message ||
            "Unable to load notifications"
        );
    }


    return data;
}


//Formats how long ago a Notification was created
function formatNotificationTime(createdAt) {

    const createdDate =
        new Date(createdAt);

    const now =
        new Date();


    //Difference in minutes
    const differenceMinutes =
        Math.floor(
            (
                now -
                createdDate
            ) /
            (
                1000 *
                60
            )
        );


    //Less than one minute
    if (differenceMinutes < 1) {

        return "Just now";
    }


    //Less than one hour
    if (differenceMinutes < 60) {

        return `${differenceMinutes}m ago`;
    }


    //Difference in hours
    const differenceHours =
        Math.floor(
            differenceMinutes /
            60
        );


    //Less than one day
    if (differenceHours < 24) {

        return `${differenceHours}h ago`;
    }


    //Difference in days
    const differenceDays =
        Math.floor(
            differenceHours /
            24
        );


    return `${differenceDays}d ago`;
}


//Displays the shared topbar used throughout the Bakery Owner dashboard
export default function DashboardTopbar({
    openSidebar,
    isSidebarOpen
}) {

    //Used to navigate between dashboard pages
    const navigate =
        useNavigate();


    //Tracks whether the account menu is open
    const [
        isAccountMenuOpen,
        setIsAccountMenuOpen
    ] = useState(false);


    //Tracks whether Notifications are open
    const [
        isNotificationsOpen,
        setIsNotificationsOpen
    ] = useState(false);


    //Stores Bakery Owner Notifications
    const [
        notifications,
        setNotifications
    ] = useState([]);


    //Stores unread Notification count
    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    //Stores dashboard Search text
    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    //Stores dashboard Search results
    const [
        searchResults,
        setSearchResults
    ] = useState({
        orders: [],
        products: [],
        customers: []
    });


    //Tracks Search loading
    const [
        isSearching,
        setIsSearching
    ] = useState(false);


    //Tracks whether Search results are open
    const [
        isSearchOpen,
        setIsSearchOpen
    ] = useState(false);


    //Get the logged-in Bakery Owner
    const user =
        getAuthUser();


    //Get Bakery Owner first and last name
    const firstName =
        user?.first_name ||
        "Owner";

    const lastName =
        user?.last_name ||
        "";


    //Create initials for the avatar
    const userInitials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase();


    //Create shorter name for the topbar
    const displayName =
        lastName
            ? `${firstName} ${lastName.charAt(0)}.`
            : firstName;


    //Check whether Search returned anything
    const hasSearchResults =
        searchResults.orders.length > 0 ||
        searchResults.products.length > 0 ||
        searchResults.customers.length > 0;


    //Loads Notifications when dashboard opens
    useEffect(() => {

        let isCancelled =
            false;


        //Loads Notifications from backend
        async function loadNotifications() {

            try {

                const data =
                    await fetchNotifications();


                //Only update state if component is still open
                if (!isCancelled) {

                    setNotifications(
                        data.notifications ||
                        []
                    );

                    setUnreadCount(
                        data.unread_count ||
                        0
                    );
                }


            } catch (error) {

                console.error(
                    "Notification loading error:",
                    error.message
                );
            }
        }


        //Load Notifications immediately
        loadNotifications();


        /*
            Check for new Notifications every 30 seconds.

            This keeps the bell updated without
            requiring WebSockets.
        */
        const notificationInterval =
            setInterval(
                loadNotifications,
                30000
            );


        //Stop timer when dashboard closes
        return () => {

            isCancelled =
                true;

            clearInterval(
                notificationInterval
            );
        };

    }, []);


    //Searches Orders, Products, and Customers
    async function handleSearchChange(event) {

        //Get Search text
        const value =
            event.target.value;


        //Update Search input
        setSearchTerm(
            value
        );


        //Clean Search text
        const cleanValue =
            value.trim();


        //Wait until at least two characters are entered
        if (cleanValue.length < 2) {

            setSearchResults({
                orders: [],
                products: [],
                customers: []
            });

            setIsSearchOpen(
                false
            );

            return;
        }


        try {

            //Show Search loading
            setIsSearching(
                true
            );

            //Open dropdown
            setIsSearchOpen(
                true
            );


            //Get logged-in Bakery Owner token
            const token =
                getAuthToken();


            //Search Bakery dashboard
            const response =
                await fetch(
                    `${API_URL}/api/search?q=${encodeURIComponent(cleanValue)}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            //Stop if Search failed
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to search dashboard"
                );
            }


            //Store Search results
            setSearchResults({

                orders:
                    data.orders ||
                    [],

                products:
                    data.products ||
                    [],

                customers:
                    data.customers ||
                    []
            });


        } catch (error) {

            console.error(
                "Dashboard search error:",
                error.message
            );


            //Clear results if Search fails
            setSearchResults({
                orders: [],
                products: [],
                customers: []
            });


        } finally {

            setIsSearching(
                false
            );
        }
    }


    //Closes Search and opens selected result
    function openSearchResult(path) {

        //Close Search dropdown
        setIsSearchOpen(
            false
        );

        //Clear Search field
        setSearchTerm("");

        //Clear old Search results
        setSearchResults({
            orders: [],
            products: [],
            customers: []
        });

        //Open selected dashboard page
        navigate(path);
    }


    //Opens or closes the account menu
    function toggleAccountMenu() {

        setIsAccountMenuOpen(
            !isAccountMenuOpen
        );

        //Close other topbar menus
        setIsNotificationsOpen(
            false
        );

        setIsSearchOpen(
            false
        );
    }


    //Opens or closes Notification dropdown
    function toggleNotifications() {

        setIsNotificationsOpen(
            !isNotificationsOpen
        );

        //Close other topbar menus
        setIsAccountMenuOpen(
            false
        );

        setIsSearchOpen(
            false
        );
    }


    //Navigate from the account menu
    function handleAccountNavigation(path) {

        //Close account menu
        setIsAccountMenuOpen(
            false
        );

        //Open selected page
        navigate(path);
    }


    //Logs the Bakery Owner out
    function handleLogout() {

        //Remove saved Login information
        clearAuth();

        //Close account menu
        setIsAccountMenuOpen(
            false
        );

        //Return to Login
        navigate(
            "/login",
            {
                replace: true
            }
        );
    }


    //Marks one Notification as read
    async function markNotificationRead(
        notification
    ) {

        try {

            const token =
                getAuthToken();


            //Only call backend when Notification is unread
            if (!notification.is_read) {

                const response =
                    await fetch(
                        `${API_URL}/api/notifications/${notification._id}/read`,
                        {
                            method: "PATCH",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                //Stop if Notification could not be updated
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to update notification"
                    );
                }


                //Update Notification locally
                setNotifications(
                    (currentNotifications) =>
                        currentNotifications.map(
                            (currentNotification) =>
                                currentNotification._id ===
                                    notification._id
                                    ? {
                                        ...currentNotification,
                                        is_read: true
                                    }
                                    : currentNotification
                        )
                );


                //Reduce unread count
                setUnreadCount(
                    (currentCount) =>
                        Math.max(
                            currentCount - 1,
                            0
                        )
                );
            }


            //Close Notification dropdown
            setIsNotificationsOpen(
                false
            );


            //Open Order when Notification belongs to an Order
            if (notification.order_id) {

                navigate(
                    `/bakery/orders/${notification.order_id}`
                );
            }


        } catch (error) {

            console.error(
                "Notification update error:",
                error.message
            );
        }
    }


    //Marks every Notification as read
    async function markAllNotificationsRead() {

        try {

            const token =
                getAuthToken();


            const response =
                await fetch(
                    `${API_URL}/api/notifications/read-all`,
                    {
                        method: "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            //Stop if Notifications could not be updated
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update notifications"
                );
            }


            //Mark every Notification as read locally
            setNotifications(
                (currentNotifications) =>
                    currentNotifications.map(
                        (notification) => ({
                            ...notification,
                            is_read: true
                        })
                    )
            );


            //No unread Notifications remain
            setUnreadCount(0);


        } catch (error) {

            console.error(
                "Mark all notifications error:",
                error.message
            );
        }
    }


    return (

        <header className="bakery-dashboard-topbar d-flex align-items-center justify-content-between gap-2 gap-md-3">


            {/* Left side of topbar */}
            <div className="d-flex align-items-center flex-grow-1 gap-2 gap-md-3">


                {/* Mobile sidebar button */}
                <button
                    type="button"
                    className="bakery-dashboard-menu-button d-lg-none"
                    aria-label="Open navigation"
                    aria-controls="bakeryDashboardSidebar"
                    aria-expanded={
                        isSidebarOpen
                    }
                    onClick={
                        openSidebar
                    }
                >
                    <Menu
                        size={21}
                        strokeWidth={1.8}
                    />
                </button>


                {/* Dashboard Search */}
                <div className="bakery-dashboard-search d-none d-sm-block flex-grow-1 position-relative">

                    {/* Search icon */}
                    <Search
                        size={18}
                        strokeWidth={1.8}
                        className="bakery-dashboard-search-icon"
                    />


                    {/* Search input */}
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search orders, customers, products..."
                        value={
                            searchTerm
                        }
                        onChange={
                            handleSearchChange
                        }
                        onFocus={() => {

                            //Open existing Search results again
                            if (
                                searchTerm.trim().length >= 2
                            ) {

                                setIsSearchOpen(
                                    true
                                );

                                //Close other menus
                                setIsNotificationsOpen(
                                    false
                                );

                                setIsAccountMenuOpen(
                                    false
                                );
                            }
                        }}
                    />


                    {/* Search results dropdown */}
                    {isSearchOpen && (

                        <div className="bakery-dashboard-search-results position-absolute top-100 start-0 end-0 mt-2">


                            {/* Search loading */}
                            {isSearching && (

                                <div className="d-flex align-items-center justify-content-center gap-2 p-4 bakery-dashboard-search-loading">

                                    <div
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Searching...
                                        </span>
                                    </div>

                                    <span>
                                        Searching...
                                    </span>

                                </div>

                            )}


                            {/* Search results */}
                            {!isSearching &&
                                hasSearchResults && (

                                    <div className="py-2">


                                        {/* Order results */}
                                        {searchResults.orders.length > 0 && (

                                            <>

                                                <p className="bakery-dashboard-search-section-title px-3 pt-2 mb-1">
                                                    Orders
                                                </p>


                                                {searchResults.orders.map(
                                                    (order) => (

                                                        <button
                                                            type="button"
                                                            key={
                                                                order._id
                                                            }
                                                            className="bakery-dashboard-search-result w-100 text-start px-3 py-2"
                                                            onClick={() =>
                                                                openSearchResult(
                                                                    `/bakery/orders/${order._id}`
                                                                )
                                                            }
                                                        >

                                                            <div className="d-flex align-items-center justify-content-between gap-3">

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            order.order_number
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            order.contact_first_name
                                                                        }{" "}
                                                                        {
                                                                            order.contact_last_name
                                                                        }
                                                                    </span>

                                                                </div>


                                                                <small>
                                                                    $
                                                                    {
                                                                        Number(
                                                                            order.total_price ||
                                                                            0
                                                                        ).toFixed(2)
                                                                    }
                                                                </small>

                                                            </div>

                                                        </button>

                                                    )
                                                )}

                                            </>

                                        )}


                                        {/* Product results */}
                                        {searchResults.products.length > 0 && (

                                            <>

                                                <p className="bakery-dashboard-search-section-title px-3 pt-3 mb-1">
                                                    Products
                                                </p>


                                                {searchResults.products.map(
                                                    (product) => (

                                                        <button
                                                            type="button"
                                                            key={
                                                                product._id
                                                            }
                                                            className="bakery-dashboard-search-result w-100 text-start px-3 py-2"
                                                            onClick={() =>
                                                                openSearchResult(
                                                                    `/bakery/products/${product._id}/edit`
                                                                )
                                                            }
                                                        >

                                                            <div className="d-flex align-items-center gap-2">

                                                                {/* Product image */}
                                                                {product.image_url && (

                                                                    <img
                                                                        src={
                                                                            product.image_url
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                        className="bakery-dashboard-search-product-image"
                                                                    />

                                                                )}


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            product.category
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </button>

                                                    )
                                                )}

                                            </>

                                        )}


                                        {/* Customer results */}
                                        {searchResults.customers.length > 0 && (

                                            <>

                                                <p className="bakery-dashboard-search-section-title px-3 pt-3 mb-1">
                                                    Customers
                                                </p>


                                                {searchResults.customers.map(
                                                    (customer) => (

                                                        <button
                                                            type="button"
                                                            key={
                                                                customer._id
                                                            }
                                                            className="bakery-dashboard-search-result w-100 text-start px-3 py-2"
                                                            onClick={() =>
                                                                openSearchResult(
                                                                    "/bakery/customers"
                                                                )
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    customer.first_name
                                                                }{" "}
                                                                {
                                                                    customer.last_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    customer.email
                                                                }
                                                            </span>

                                                        </button>

                                                    )
                                                )}

                                            </>

                                        )}

                                    </div>

                                )}


                            {/* No Search results */}
                            {!isSearching &&
                                !hasSearchResults && (

                                    <div className="text-center px-3 py-4">

                                        <Search
                                            size={22}
                                            strokeWidth={1.5}
                                            className="bakery-dashboard-search-empty-icon mb-2"
                                        />

                                        <p className="bakery-dashboard-search-empty mb-0">
                                            No results found
                                        </p>

                                    </div>

                                )}

                        </div>

                    )}

                </div>

            </div>


            {/* Right side actions */}
            <div className="d-flex align-items-center gap-2 gap-md-3">


                {/* Notification area */}
                <div className="position-relative">


                    {/* Notification bell */}
                    <button
                        type="button"
                        className="bakery-dashboard-icon-button position-relative"
                        aria-label="Notifications"
                        aria-expanded={
                            isNotificationsOpen
                        }
                        onClick={
                            toggleNotifications
                        }
                    >
                        <Bell
                            size={20}
                            strokeWidth={1.8}
                        />


                        {/* Unread Notification count */}
                        {unreadCount > 0 && (

                            <span className="bakery-dashboard-notification-badge position-absolute top-0 start-100 translate-middle">

                                {
                                    unreadCount > 9
                                        ? "9+"
                                        : unreadCount
                                }

                            </span>

                        )}

                    </button>


                    {/* Notification dropdown */}
                    {isNotificationsOpen && (

                        <div className="bakery-dashboard-notifications position-absolute top-100 end-0 mt-2">


                            {/* Notification heading */}
                            <div className="d-flex align-items-center justify-content-between gap-3 px-3 py-3 bakery-dashboard-notification-heading">

                                <div>

                                    <h2 className="mb-1">
                                        Notifications
                                    </h2>

                                    <p className="mb-0">
                                        {unreadCount} unread
                                    </p>

                                </div>


                                {/* Mark all read */}
                                {unreadCount > 0 && (

                                    <button
                                        type="button"
                                        className="bakery-dashboard-mark-read-button"
                                        onClick={
                                            markAllNotificationsRead
                                        }
                                    >
                                        Mark all as read
                                    </button>

                                )}

                            </div>


                            {/* Notification list */}
                            <div className="bakery-dashboard-notification-list">

                                {notifications.length > 0 ? (

                                    notifications.map(
                                        (notification) => (

                                            <button
                                                type="button"
                                                key={
                                                    notification._id
                                                }
                                                className={
                                                    notification.is_read
                                                        ? "bakery-dashboard-notification-item w-100 px-3 py-3 text-start"
                                                        : "bakery-dashboard-notification-item unread w-100 px-3 py-3 text-start"
                                                }
                                                onClick={() =>
                                                    markNotificationRead(
                                                        notification
                                                    )
                                                }
                                            >

                                                <div className="d-flex gap-2">

                                                    {/* Unread indicator */}
                                                    <span
                                                        className={
                                                            notification.is_read
                                                                ? "bakery-dashboard-notification-dot read"
                                                                : "bakery-dashboard-notification-dot"
                                                        }
                                                    />


                                                    <div className="flex-grow-1">

                                                        <p className="bakery-dashboard-notification-message mb-1">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <span className="bakery-dashboard-notification-time">
                                                            {
                                                                formatNotificationTime(
                                                                    notification.created_at
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </button>

                                        )
                                    )

                                ) : (

                                    <div className="text-center px-3 py-5">

                                        <Bell
                                            size={24}
                                            strokeWidth={1.5}
                                            className="bakery-dashboard-empty-notification-icon mb-2"
                                        />

                                        <p className="bakery-dashboard-empty-notifications mb-0">
                                            No notifications yet
                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}

                </div>


                {/* Bakery Owner account */}
                <div className="position-relative">


                    {/* Account button */}
                    <button
                        type="button"
                        className="bakery-dashboard-topbar-user-button d-flex align-items-center gap-2"
                        aria-expanded={
                            isAccountMenuOpen
                        }
                        onClick={
                            toggleAccountMenu
                        }
                    >

                        {/* Owner initials */}
                        <span className="bakery-dashboard-user-avatar">
                            {userInitials}
                        </span>


                        {/* Owner information */}
                        <div className="d-none d-md-block text-start">

                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                Owner
                            </span>

                        </div>


                        <ChevronDown
                            size={16}
                            strokeWidth={1.8}
                            className="d-none d-md-block"
                        />

                    </button>


                    {/* Account dropdown */}
                    {isAccountMenuOpen && (

                        <div className="bakery-dashboard-account-menu position-absolute top-100 end-0 mt-2">


                            {/* Account information */}
                            <div className="bakery-dashboard-account-heading px-3 py-2">

                                <strong>
                                    {firstName} {lastName}
                                </strong>

                                <span>
                                    {user?.email}
                                </span>

                            </div>


                            {/* Settings */}
                            <button
                                type="button"
                                className="bakery-dashboard-account-item d-flex align-items-center gap-2 w-100 px-3 py-2"
                                onClick={() =>
                                    handleAccountNavigation(
                                        "/bakery/settings"
                                    )
                                }
                            >
                                <Settings
                                    size={17}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    Settings
                                </span>
                            </button>


                            {/* Help */}
                            <button
                                type="button"
                                className="bakery-dashboard-account-item d-flex align-items-center gap-2 w-100 px-3 py-2"
                                onClick={() =>
                                    handleAccountNavigation(
                                        "/bakery/help"
                                    )
                                }
                            >
                                <CircleHelp
                                    size={17}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    Help & Support
                                </span>
                            </button>


                            {/* Divider */}
                            <div className="bakery-dashboard-account-divider" />


                            {/* Logout */}
                            <button
                                type="button"
                                className="bakery-dashboard-account-item bakery-dashboard-account-logout d-flex align-items-center gap-2 w-100 px-3 py-2"
                                onClick={
                                    handleLogout
                                }
                            >
                                <LogOut
                                    size={17}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    Logout
                                </span>
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}