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
    LogOut,
    Package,
    UserRound,
    ShoppingBag
} from "lucide-react";

//Import API URL
import API_URL from "../../../config/api.js";

//Import authentication helpers
import {
    getAuthToken,
    getAuthUser,
    clearAuth
} from "../../../utils/authStorage";


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


    //Tracks whether the Notification menu is open
    const [
        isNotificationOpen,
        setIsNotificationOpen
    ] = useState(false);


    //Stores Bakery Owner Notifications
    const [
        notifications,
        setNotifications
    ] = useState([]);


    //Stores number of unread Notifications
    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    //Stores Dashboard Search text
    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    //Stores Dashboard Search results
    const [
        searchResults,
        setSearchResults
    ] = useState({
        orders: [],
        products: [],
        customers: []
    });


    //Tracks whether Search results are open
    const [
        isSearchOpen,
        setIsSearchOpen
    ] = useState(false);


    //Tracks whether Search is loading
    const [
        isSearching,
        setIsSearching
    ] = useState(false);


    //Get the logged-in Bakery Owner
    const user =
        getAuthUser();


    //Get Bakery Owner first and last name
    const firstName =
        user?.first_name || "Owner";

    const lastName =
        user?.last_name || "";


    //Create initials for the avatar
    const userInitials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase();


    //Create shorter name for the topbar
    const displayName =
        lastName
            ? `${firstName} ${lastName.charAt(0)}.`
            : firstName;


    //Loads Bakery Owner Notifications
    async function fetchNotifications() {

        try {

            //Get authentication token
            const token =
                getAuthToken();


            //Stop if there is no logged-in user
            if (!token) {
                return;
            }


            //Request Notifications from the backend
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
                return;
            }


            //Convert response to JSON
            const data =
                await response.json();


            //Store Notifications
            setNotifications(
                data.notifications || []
            );


            //Store unread Notification count
            setUnreadCount(
                data.unread_count || 0
            );


        } catch (error) {

            console.error(
                "Notification loading error:",
                error
            );
        }
    }


    //Loads Notifications when the dashboard starts
    useEffect(() => {

        /*
            Load Notifications after the current
            render has finished.

            Using a timer also prevents React from
            warning about direct state updates
            inside the Effect.
        */
        const initialNotificationLoad =
            setTimeout(
                () => {

                    fetchNotifications();
                },
                0
            );


        //Check for new Notifications every 30 seconds
        const notificationInterval =
            setInterval(
                () => {

                    fetchNotifications();
                },
                30000
            );


        //Stop timers when component closes
        return () => {

            clearTimeout(
                initialNotificationLoad
            );

            clearInterval(
                notificationInterval
            );
        };

    }, []);


    //Search Dashboard data when Search text changes
    useEffect(() => {

        //Remove extra spaces
        const trimmedSearch =
            searchTerm.trim();


        //Do not Search until at least 2 characters are entered
        if (trimmedSearch.length < 2) {

            return;
        }


        /*
            Wait briefly before Searching.

            This prevents a backend request from
            running after every single key press.
        */
        const searchTimer =
            setTimeout(
                async () => {

                    try {

                        //Show loading state
                        setIsSearching(true);


                        //Open Search results
                        setIsSearchOpen(true);


                        //Get authentication token
                        const token =
                            getAuthToken();


                        //Stop if there is no token
                        if (!token) {

                            setIsSearching(false);

                            return;
                        }


                        //Request Dashboard Search results
                        const response =
                            await fetch(
                                `${API_URL}/api/search?q=${encodeURIComponent(trimmedSearch)}`,
                                {
                                    headers: {
                                        Authorization:
                                            `Bearer ${token}`
                                    }
                                }
                            );


                        //Stop if Search request failed
                        if (!response.ok) {

                            throw new Error(
                                "Unable to search dashboard"
                            );
                        }


                        //Convert response to JSON
                        const data =
                            await response.json();


                        //Store Search results
                        setSearchResults({
                            orders:
                                data.orders || [],

                            products:
                                data.products || [],

                            customers:
                                data.customers || []
                        });


                    } catch (error) {

                        console.error(
                            "Dashboard Search error:",
                            error
                        );


                        //Clear Search results if request fails
                        setSearchResults({
                            orders: [],
                            products: [],
                            customers: []
                        });


                    } finally {

                        //Stop loading state
                        setIsSearching(false);
                    }
                },
                250
            );


        //Cancel previous Search when typing continues
        return () => {

            clearTimeout(
                searchTimer
            );
        };

    }, [searchTerm]);


    //Opens or closes the account menu
    function toggleAccountMenu() {

        //Close Notifications
        setIsNotificationOpen(false);


        //Close Search results
        setIsSearchOpen(false);


        //Toggle account menu
        setIsAccountMenuOpen(
            !isAccountMenuOpen
        );
    }


    //Opens or closes Notification menu
    function toggleNotificationMenu() {

        //Close account menu
        setIsAccountMenuOpen(false);


        //Close Search results
        setIsSearchOpen(false);


        //Toggle Notification menu
        setIsNotificationOpen(
            !isNotificationOpen
        );


        //Refresh Notifications when menu opens
        if (!isNotificationOpen) {

            fetchNotifications();
        }
    }


    //Navigate from the account menu
    function handleAccountNavigation(path) {

        //Close the menu
        setIsAccountMenuOpen(false);


        //Go to selected page
        navigate(path);
    }


    //Logs the Bakery Owner out
    function handleLogout() {

        //Remove saved Login information
        clearAuth();


        //Close the menu
        setIsAccountMenuOpen(false);


        //Return to Login
        navigate(
            "/login",
            {
                replace: true
            }
        );
    }


    //Handles Dashboard Search input
    function handleSearchChange(event) {

        //Get new Search text
        const newSearchTerm =
            event.target.value;


        //Store Search text
        setSearchTerm(
            newSearchTerm
        );


        //Close account menu while Searching
        setIsAccountMenuOpen(false);


        //Close Notification menu while Searching
        setIsNotificationOpen(false);


        //Clear Search when less than 2 characters are entered
        if (
            newSearchTerm.trim().length < 2
        ) {

            //Clear previous Search results
            setSearchResults({
                orders: [],
                products: [],
                customers: []
            });


            //Close Search results
            setIsSearchOpen(false);


            //Stop Search loading
            setIsSearching(false);
        }
    }


    //Navigates to a Search result
    function handleSearchNavigation(path) {

        //Close Search menu
        setIsSearchOpen(false);


        //Clear Search input
        setSearchTerm("");


        //Clear previous Search results
        setSearchResults({
            orders: [],
            products: [],
            customers: []
        });


        //Go to selected Dashboard page
        navigate(path);
    }


    //Marks one Notification as read
    async function handleNotificationClick(
        notification
    ) {

        try {

            //Get authentication token
            const token =
                getAuthToken();


            //Stop if there is no token
            if (!token) {
                return;
            }


            //Mark Notification as read if needed
            if (!notification.is_read) {

                //Send read update to backend
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


                //Only update local state when backend succeeds
                if (response.ok) {

                    //Update Notification locally
                    setNotifications(
                        (currentNotifications) =>
                            currentNotifications.map(
                                (currentNotification) =>
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
                        (currentCount) =>
                            Math.max(
                                0,
                                currentCount - 1
                            )
                    );
                }
            }


            //Close Notification menu
            setIsNotificationOpen(false);


            //Open Order when Notification belongs to an Order
            if (notification.order_id) {

                navigate(
                    `/bakery/orders/${notification.order_id}`
                );
            }


        } catch (error) {

            console.error(
                "Notification update error:",
                error
            );
        }
    }


    //Marks all Notifications as read
    async function handleMarkAllRead() {

        try {

            //Get authentication token
            const token =
                getAuthToken();


            //Stop if there is no token
            if (!token) {
                return;
            }


            //Request backend update
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


            //Mark every Notification as read locally
            setNotifications(
                (currentNotifications) =>
                    currentNotifications.map(
                        (notification) => ({
                            ...notification,
                            is_read:
                                true
                        })
                    )
            );


            //Remove unread badge
            setUnreadCount(0);


        } catch (error) {

            console.error(
                "Mark Notifications read error:",
                error
            );
        }
    }


    //Check whether Search returned anything
    const hasSearchResults =
        searchResults.orders.length > 0 ||
        searchResults.products.length > 0 ||
        searchResults.customers.length > 0;


    return (

        <header className="bakery-dashboard-topbar d-flex align-items-center justify-content-between gap-2 gap-md-3">


            {/* Left side of the topbar */}
            <div className="d-flex align-items-center flex-grow-1 gap-2 gap-md-3">


                {/* Opens the sidebar on smaller screens */}
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


                {/* Dashboard Search area */}
                <div className="bakery-dashboard-search d-none d-sm-block flex-grow-1">


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

                            //Reopen Search when valid Search text exists
                            if (
                                searchTerm.trim().length >= 2
                            ) {

                                setIsSearchOpen(true);
                            }
                        }}
                    />


                    {/* Dashboard Search results */}
                    {isSearchOpen && (

                        <div className="bakery-dashboard-search-results position-absolute top-100 start-0 end-0 mt-2">


                            {/* Search loading */}
                            {isSearching && (

                                <div className="bakery-dashboard-search-loading px-3 py-4 text-center">

                                    Searching...

                                </div>
                            )}


                            {/* Display Search results */}
                            {!isSearching &&
                                hasSearchResults && (

                                    <>


                                        {/* Order Search results */}
                                        {searchResults.orders.length > 0 && (

                                            <div>

                                                <div className="bakery-dashboard-search-section-title px-3 pt-3 pb-2">
                                                    Orders
                                                </div>


                                                {searchResults.orders.map(
                                                    (order) => (

                                                        <button
                                                            key={
                                                                order._id
                                                            }
                                                            type="button"
                                                            className="bakery-dashboard-search-result d-flex align-items-center gap-3 w-100 px-3 py-2"
                                                            onClick={() =>
                                                                handleSearchNavigation(
                                                                    `/bakery/orders/${order._id}`
                                                                )
                                                            }
                                                        >

                                                            <ShoppingBag
                                                                size={18}
                                                                strokeWidth={1.8}
                                                            />


                                                            <div className="flex-grow-1 text-start">

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


                                                            <span>
                                                                $
                                                                {
                                                                    Number(
                                                                        order.total_price
                                                                    ).toFixed(2)
                                                                }
                                                            </span>

                                                        </button>
                                                    )
                                                )}

                                            </div>
                                        )}


                                        {/* Product Search results */}
                                        {searchResults.products.length > 0 && (

                                            <div>

                                                <div className="bakery-dashboard-search-section-title px-3 pt-3 pb-2">
                                                    Products
                                                </div>


                                                {searchResults.products.map(
                                                    (product) => (

                                                        <button
                                                            key={
                                                                product._id
                                                            }
                                                            type="button"
                                                            className="bakery-dashboard-search-result d-flex align-items-center gap-3 w-100 px-3 py-2"
                                                            onClick={() =>
                                                                handleSearchNavigation(
                                                                    `/bakery/products/${product._id}/edit`
                                                                )
                                                            }
                                                        >

                                                            {/* Product image */}
                                                            {product.image_url ? (

                                                                <img
                                                                    src={
                                                                        product.image_url
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    className="bakery-dashboard-search-product-image"
                                                                />

                                                            ) : (

                                                                <span className="bakery-dashboard-search-product-image d-flex align-items-center justify-content-center">

                                                                    <Package
                                                                        size={17}
                                                                        strokeWidth={1.8}
                                                                    />

                                                                </span>
                                                            )}


                                                            <div className="flex-grow-1 text-start">

                                                                <strong>
                                                                    {
                                                                        product.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        product.category ||
                                                                        "Product"
                                                                    }
                                                                </span>

                                                            </div>


                                                            <span>
                                                                $
                                                                {
                                                                    Number(
                                                                        product.base_price
                                                                    ).toFixed(2)
                                                                }
                                                            </span>

                                                        </button>
                                                    )
                                                )}

                                            </div>
                                        )}


                                        {/* Customer Search results */}
                                        {searchResults.customers.length > 0 && (

                                            <div>

                                                <div className="bakery-dashboard-search-section-title px-3 pt-3 pb-2">
                                                    Customers
                                                </div>


                                                {searchResults.customers.map(
                                                    (customer) => (

                                                        <button
                                                            key={
                                                                customer._id
                                                            }
                                                            type="button"
                                                            className="bakery-dashboard-search-result d-flex align-items-center gap-3 w-100 px-3 py-2"
                                                            onClick={() =>
                                                                handleSearchNavigation(
                                                                    "/bakery/customers"
                                                                )
                                                            }
                                                        >

                                                            <UserRound
                                                                size={18}
                                                                strokeWidth={1.8}
                                                            />


                                                            <div className="flex-grow-1 text-start">

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

                                                            </div>

                                                        </button>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </>
                                )}


                            {/* No Search results */}
                            {!isSearching &&
                                !hasSearchResults && (

                                    <div className="bakery-dashboard-search-empty px-3 py-4 text-center">

                                        <Search
                                            size={24}
                                            strokeWidth={1.6}
                                            className="bakery-dashboard-search-empty-icon"
                                        />

                                        <strong>
                                            No results found
                                        </strong>

                                        <span>
                                            Try another order, product, or customer.
                                        </span>

                                    </div>
                                )}

                        </div>
                    )}

                </div>

            </div>


            {/* Right side topbar actions */}
            <div className="d-flex align-items-center gap-2 gap-md-3">


                {/* Notifications area */}
                <div className="position-relative">


                    {/* Notifications button */}
                    <button
                        type="button"
                        className="bakery-dashboard-icon-button position-relative"
                        aria-label="Notifications"
                        aria-expanded={
                            isNotificationOpen
                        }
                        onClick={
                            toggleNotificationMenu
                        }
                    >

                        <Bell
                            size={20}
                            strokeWidth={1.8}
                        />


                        {/* Unread Notification badge */}
                        {unreadCount > 0 && (

                            <span className="bakery-dashboard-notification-badge">

                                {
                                    unreadCount > 9
                                        ? "9+"
                                        : unreadCount
                                }

                            </span>
                        )}

                    </button>


                    {/* Notification dropdown */}
                    {isNotificationOpen && (

                        <div className="bakery-dashboard-notification-menu position-absolute top-100 end-0 mt-2">


                            {/* Notification heading */}
                            <div className="bakery-dashboard-notification-heading d-flex align-items-center justify-content-between gap-3 px-3 py-3">

                                <div>

                                    <strong>
                                        Notifications
                                    </strong>

                                    <span>
                                        {unreadCount} unread
                                    </span>

                                </div>


                                {/* Mark all as read */}
                                {unreadCount > 0 && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleMarkAllRead
                                        }
                                    >

                                        Mark all read

                                    </button>
                                )}

                            </div>


                            {/* Notification list */}
                            <div className="bakery-dashboard-notification-list">


                                {notifications.length > 0 ? (

                                    notifications.map(
                                        (notification) => (

                                            <button
                                                key={
                                                    notification._id
                                                }
                                                type="button"
                                                className={
                                                    `bakery-dashboard-notification-item w-100 px-3 py-3 ${notification.is_read
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

                                                <div className="d-flex align-items-start gap-2">


                                                    {/* Unread indicator */}
                                                    <span
                                                        className={
                                                            `bakery-dashboard-notification-dot ${notification.is_read
                                                                ? "read"
                                                                : ""
                                                            }`
                                                        }
                                                    />


                                                    <div className="text-start">

                                                        <p>
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <span>

                                                            {
                                                                new Date(
                                                                    notification.created_at
                                                                ).toLocaleString()
                                                            }

                                                        </span>

                                                    </div>

                                                </div>

                                            </button>
                                        )
                                    )

                                ) : (

                                    <div className="bakery-dashboard-notification-empty px-3 py-4 text-center">

                                        <Bell
                                            size={25}
                                            strokeWidth={1.6}
                                        />

                                        <strong>
                                            No notifications yet
                                        </strong>

                                        <span>
                                            New orders will appear here.
                                        </span>

                                    </div>
                                )}

                            </div>

                        </div>
                    )}

                </div>


                {/* Bakery Owner account area */}
                <div className="position-relative">


                    {/* Opens account menu */}
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


                        {/* Bakery Owner initials */}
                        <span className="bakery-dashboard-user-avatar">

                            {userInitials}

                        </span>


                        {/* Bakery Owner information */}
                        <div className="d-none d-md-block text-start">

                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                Owner
                            </span>

                        </div>


                        {/* Account dropdown arrow */}
                        <ChevronDown
                            size={16}
                            strokeWidth={1.8}
                            className="d-none d-md-block"
                        />

                    </button>


                    {/* Account dropdown menu */}
                    {isAccountMenuOpen && (

                        <div className="bakery-dashboard-account-menu position-absolute top-100 end-0 mt-2">


                            {/* Account heading */}
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


                            {/* Help and Support */}
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


                            {/* Menu divider */}
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