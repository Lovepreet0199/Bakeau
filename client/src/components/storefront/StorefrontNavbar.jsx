//Import React hooks
import {
    useEffect,
    useRef,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useParams
} from "react-router-dom";

//Import Storefront icons
import {
    ChevronDown,
    LogOut,
    Menu,
    Settings,
    ShoppingCart,
    X
} from "lucide-react";

//Import Customer Cart hook
import { useCart } from "../../context/useCart";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Navbar styles
import "./StorefrontNavbar.css";


//Displays the shared Storefront navigation
export default function StorefrontNavbar({
    bakery,
    orderNotice = null
}) {

    //Get the Bakery slug from the URL
    const { slug } = useParams();

    //Get Customer Cart count
    const {
        cartCount
    } = useCart();


    //Tracks whether the mobile navigation is open
    const [
        isMobileMenuOpen,
        setIsMobileMenuOpen
    ] = useState(false);


    //Tracks whether the Account dropdown is open
    const [
        isAccountOpen,
        setIsAccountOpen
    ] = useState(false);


    //Used to detect clicks outside Account dropdown
    const accountDropdownRef =
        useRef(null);


    //Gets the currently logged-in Customer
    function getStoredCustomer() {

        //User may be stored in either storage location
        const storedUser =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        //No logged-in User
        if (!storedUser) {
            return null;
        }

        try {

            //Convert stored User back into JavaScript
            const user =
                JSON.parse(
                    storedUser
                );

            //Only Customers belong in Storefront Customer UI
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


    //Stores logged-in Customer information
    const [
        customer,
        setCustomer
    ] = useState(
        getStoredCustomer
    );


    //Closes Account dropdown when clicking outside it
    useEffect(() => {

        function handleOutsideClick(event) {

            if (
                accountDropdownRef.current &&
                !accountDropdownRef.current.contains(
                    event.target
                )
            ) {

                setIsAccountOpen(
                    false
                );
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        //Remove event listener when component unmounts
        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, []);


    //Do not display Navbar until Bakery data exists
    if (!bakery) {
        return null;
    }


    //Get Bakery branding colors
    const storefrontTheme =
        getStorefrontTheme(
            bakery
        );


    //Use page-specific notice or Bakery default notice
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


    //Creates Bakery initials when no logo exists
    function getBakeryInitials() {

        //Use B when there is no Bakery name
        if (!bakery?.name?.trim()) {
            return "B";
        }

        //Split Bakery name into words
        const nameParts =
            bakery.name
                .trim()
                .split(" ");

        //Use one letter for a one-word Bakery name
        if (
            nameParts.length ===
            1
        ) {

            return nameParts[0]
                .charAt(0)
                .toUpperCase();
        }

        //Use first two Bakery initials
        return (
            nameParts[0].charAt(0) +
            nameParts[1].charAt(0)
        ).toUpperCase();
    }


    //Gets Customer's full name
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


    //Gets Customer initials for Account avatar
    function getCustomerInitials() {

        if (!customer) {
            return "C";
        }

        //Get first name initial
        const firstInitial =
            customer.first_name
                ?.trim()
                .charAt(0) || "";

        //Get last name initial
        const lastInitial =
            customer.last_name
                ?.trim()
                .charAt(0) || "";

        //Combine Customer initials
        const initials =
            `${firstInitial}${lastInitial}`
                .toUpperCase();

        //Fallback to C for Customer
        return initials || "C";
    }


    //Closes mobile navigation
    function closeMobileMenu() {

        setIsMobileMenuOpen(
            false
        );
    }


    //Closes Account dropdown
    function closeAccountMenu() {

        setIsAccountOpen(
            false
        );
    }


    //Signs the Customer out
    function handleSignOut() {

        //Remove authentication from local storage
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        //Remove authentication from session storage
        sessionStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "user"
        );


        //Remove temporary Customer authentication information
        localStorage.removeItem(
            "authReturnTo"
        );

        localStorage.removeItem(
            "authBakerySlug"
        );

        sessionStorage.removeItem(
            "pendingVerificationEmail"
        );


        //Update Navbar immediately
        setCustomer(
            null
        );


        //Close menus
        setIsAccountOpen(
            false
        );

        setIsMobileMenuOpen(
            false
        );
    }


    return (

        //Apply Bakery theme to entire Navbar
        <div
            className="storefront-navbar-wrapper"
            style={
                storefrontTheme
            }
        >

            {/* Storefront announcement bar */}
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
                            to={`/store/${slug}`}
                            onClick={() => {

                                closeMobileMenu();
                                closeAccountMenu();

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
                                to={`/store/${slug}#menu`}
                                className="storefront-nav-link"
                            >
                                Menu
                            </Link>


                            <Link
                                to={`/store/${slug}#how-it-works`}
                                className="storefront-nav-link"
                            >
                                How It Works
                            </Link>


                            <Link
                                to={`/store/${slug}/reviews`}
                                className="storefront-nav-link"
                            >
                                Reviews
                            </Link>


                            <Link
                                to={`/store/${slug}#about`}
                                className="storefront-nav-link"
                            >
                                About
                            </Link>

                        </nav>


                        {/* Desktop actions */}
                        <div className="d-none d-lg-flex align-items-center gap-3 flex-shrink-0">

                            {/* Customer Cart */}
                            <Link
                                to={`/store/${slug}/cart`}
                                className="storefront-cart-action d-flex align-items-center gap-2 text-decoration-none"
                            >

                                <ShoppingCart
                                    size={17}
                                />

                                <span>
                                    Cart ({cartCount})
                                </span>

                            </Link>


                            {/* Logged-in Customer */}
                            {customer ? (

                                //Customer Account dropdown
                                <div
                                    ref={
                                        accountDropdownRef
                                    }
                                    className="storefront-account position-relative"
                                >

                                    {/* Account button */}
                                    <button
                                        type="button"
                                        aria-expanded={
                                            isAccountOpen
                                        }
                                        aria-haspopup="menu"
                                        onClick={() =>
                                            setIsAccountOpen(
                                                (currentValue) =>
                                                    !currentValue
                                            )
                                        }
                                        className="storefront-account-button d-flex align-items-center gap-2"
                                    >

                                        {/* Small Customer initials */}
                                        <span className="storefront-account-button-avatar">

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
                                            className="storefront-account-dropdown"
                                            role="menu"
                                        >

                                            {/* Customer information */}
                                            <div className="storefront-account-profile">

                                                {/* Customer initials avatar */}
                                                <div className="storefront-account-avatar d-flex align-items-center justify-content-center">

                                                    {
                                                        getCustomerInitials()
                                                    }

                                                </div>


                                                {/* Customer name and email */}
                                                <div className="min-w-0">

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


                                                    <small className="storefront-account-type">

                                                        Customer account

                                                    </small>

                                                </div>

                                            </div>


                                            <hr className="storefront-account-divider" />


                                            {/* Account Settings */}
                                            <Link
                                                to={`/store/${slug}/account`}
                                                onClick={
                                                    closeAccountMenu
                                                }
                                                className="storefront-account-menu-item d-flex align-items-center gap-2 text-decoration-none"
                                                role="menuitem"
                                            >

                                                <Settings
                                                    size={16}
                                                />

                                                <span>
                                                    Account Settings
                                                </span>

                                            </Link>


                                            <hr className="storefront-account-divider" />


                                            {/* Customer Sign Out */}
                                            <button
                                                type="button"
                                                onClick={
                                                    handleSignOut
                                                }
                                                className="storefront-account-menu-item storefront-account-logout d-flex align-items-center gap-2 w-100"
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
                                    {/* Customer Sign In */}
                                    <Link
                                        to={`/store/${slug}/login`}
                                        className="storefront-text-action text-decoration-none"
                                    >
                                        Sign In
                                    </Link>


                                    {/* Customer registration */}
                                    <Link
                                        to={`/store/${slug}/register`}
                                        className="storefront-create-account text-decoration-none"
                                    >
                                        Create Account
                                    </Link>
                                </>
                            )}

                        </div>


                        {/* Mobile actions */}
                        <div className="d-flex d-lg-none align-items-center gap-2 flex-shrink-0">

                            {/* Customer Cart */}
                            <Link
                                to={`/store/${slug}/cart`}
                                aria-label="Open cart"
                                className="storefront-mobile-cart d-flex align-items-center gap-1 text-decoration-none"
                            >

                                <ShoppingCart
                                    size={19}
                                />

                                <span className="small">
                                    ({cartCount})
                                </span>

                            </Link>


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
                                onClick={() =>
                                    setIsMobileMenuOpen(
                                        (currentValue) =>
                                            !currentValue
                                    )
                                }
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
                                        to={`/store/${slug}#menu`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        Menu
                                    </Link>


                                    <Link
                                        to={`/store/${slug}#how-it-works`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        How It Works
                                    </Link>


                                    <Link
                                        to={`/store/${slug}/reviews`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        Reviews
                                    </Link>


                                    <Link
                                        to={`/store/${slug}#about`}
                                        onClick={
                                            closeMobileMenu
                                        }
                                        className="storefront-mobile-nav-link text-decoration-none px-3 py-2"
                                    >
                                        About
                                    </Link>

                                </nav>


                                <hr className="storefront-mobile-divider my-3" />


                                {/* Logged-in Customer Account */}
                                {customer ? (

                                    <div className="storefront-mobile-account">

                                        {/* Customer information */}
                                        <div className="storefront-mobile-account-profile d-flex align-items-center gap-3 p-3">

                                            {/* Customer initials */}
                                            <div className="storefront-account-avatar d-flex align-items-center justify-content-center flex-shrink-0">

                                                {
                                                    getCustomerInitials()
                                                }

                                            </div>


                                            {/* Customer details */}
                                            <div className="min-w-0 flex-grow-1">

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


                                                <small className="storefront-account-type">

                                                    Customer account

                                                </small>

                                            </div>

                                        </div>


                                        {/* Customer Account links */}
                                        <div className="d-grid gap-1 mt-2">

                                            {/* Account Settings */}
                                            <Link
                                                to={`/store/${slug}/account`}
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


                                            {/* Customer Sign Out */}
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

                                    //Guest Customer actions
                                    <div className="d-grid gap-2">

                                        {/* Customer Sign In */}
                                        <Link
                                            to={`/store/${slug}/login`}
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className="storefront-mobile-signin text-center text-decoration-none py-2 px-3"
                                        >
                                            Sign In
                                        </Link>


                                        {/* Customer registration */}
                                        <Link
                                            to={`/store/${slug}/register`}
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