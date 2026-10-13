//Import React state
import { useState } from "react";

//Import React Router tools
import { Link, useParams } from "react-router-dom";

//Import Storefront icons
import {
    Menu,
    ShoppingCart,
    X
} from "lucide-react";

//Import Customer Cart hook
import { useCart } from "../../context/useCart";

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


    //Do not display Navbar until Bakery data exists
    if (!bakery) {
        return null;
    }


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


    //Closes mobile navigation
    function closeMobileMenu() {

        setIsMobileMenuOpen(
            false
        );
    }


    return (

        <>
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
                            onClick={
                                closeMobileMenu
                            }
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
                                to={`/store/${slug}#reviews`}
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
                                className="storefront-text-action d-flex align-items-center gap-1 text-decoration-none"
                            >

                                <ShoppingCart
                                    size={17}
                                />

                                Cart ({cartCount})

                            </Link>


                            {/* Shared Customer Sign In */}
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

                        </div>


                        {/* Mobile actions */}
                        <div className="d-flex d-lg-none align-items-center gap-2 flex-shrink-0">

                            {/* Customer Cart */}
                            <Link
                                to={`/store/${slug}/cart`}
                                aria-label="Open cart"
                                className="storefront-mobile-action d-flex align-items-center gap-1 text-decoration-none"
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
                                        to={`/store/${slug}#reviews`}
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


                                <hr className="my-3" />


                                {/* Customer account actions */}
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

                            </div>

                        </div>
                    )}

                </div>

            </header>
        </>
    );
}