//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    NavLink,
    useNavigate
} from "react-router-dom";

//Import API URL
import API_URL from "../../../config/api.js";

//Import sidebar icons
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    CalendarDays,
    Users,
    CreditCard,
    Settings,
    CircleHelp,
    ExternalLink,
    Boxes,
    Star,
    Megaphone,
    BarChart3,
    X,
    LogOut
} from "lucide-react";


//Import authentication helper
import {
    clearAuth,
    getAuthToken
} from "../../../utils/authStorage";


//Displays the shared sidebar used on Bakery Owner dashboard pages
export default function DashboardSidebar({
    isSidebarOpen,
    closeSidebar
}) {

    //Used to redirect the Bakery Owner after logout
    const navigate = useNavigate();

    //Stores the Bakery Owner's bakery
    const [bakery, setBakery] = useState(null);


    //Loads the logged-in Bakery Owner's bakery
    useEffect(() => {

        async function loadBakery() {

            try {

                //Get the saved Bakery Owner token
                const token = getAuthToken();

                //Get the Bakery Owner's bakery
                const response = await fetch(
                    `${API_URL}/api/bakeries/mine`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to load bakery"
                    );
                }

                //Save the bakery
                setBakery(
                    data.bakery || data
                );

            } catch (error) {

                console.error(
                    "Unable to load sidebar bakery:",
                    error
                );
            }
        }


        loadBakery();

    }, []);


    //Get the Bakery name
    const bakeryName =
        bakery?.name || "Your Bakery";


    //Create Bakery initials
    const bakeryInitials =
        bakery?.name
            ? bakery.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word.charAt(0))
                .join("")
                .toUpperCase()
            : "BK";


    //Opens the Bakery Owner's public storefront
    function handleViewStorefront() {

        //Stop if the bakery has not loaded yet
        if (!bakery?.slug) {
            return;
        }

        //Open the public storefront in a new tab
        window.open(
            `/${encodeURIComponent(bakery.slug)}`,
            "_blank",
            "noopener,noreferrer"
        );
    }

    //Logs the Bakery Owner out
    function handleLogout() {

        //Remove saved login information
        clearAuth();

        //Close the sidebar on smaller screens
        closeSidebar();

        //Send the user back to login
        navigate(
            "/login",
            {
                replace: true
            }
        );
    }


    return (
        <aside
            id="bakeryDashboardSidebar"
            className={`bakery-dashboard-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}
        >

            {/* Keeps all sidebar content arranged vertically */}
            <div className="bakery-dashboard-sidebar-content d-flex flex-column">


                {/* Bakeau branding and mobile close button */}
                <div className="bakery-dashboard-brand d-flex align-items-center justify-content-between">

                    <h2>
                        Bakeau
                    </h2>


                    {/* Closes the sidebar on smaller screens */}
                    <button
                        type="button"
                        className="bakery-dashboard-sidebar-close d-lg-none"
                        aria-label="Close navigation"
                        onClick={closeSidebar}
                    >
                        <X
                            size={20}
                            strokeWidth={1.8}
                        />
                    </button>

                </div>


                {/* Displays the Bakery Owner's current bakery */}
                <button
                    type="button"
                    className="bakery-dashboard-bakery-select"
                    onClick={handleViewStorefront}
                >

                    <div className="d-flex align-items-center gap-3">

                        {/* Bakery initials */}
                        <div className="bakery-dashboard-bakery-avatar">
                            {bakeryInitials}
                        </div>


                        {/* Bakery information */}
                        <div>

                            <strong>
                                {bakeryName}
                            </strong>

                            <span className="d-flex align-items-center gap-1">
                                View storefront

                                <ExternalLink
                                    size={12}
                                    strokeWidth={1.8}
                                />
                            </span>

                        </div>

                    </div>

                </button>


                {/* Main dashboard navigation */}
                <nav className="bakery-dashboard-nav flex-grow-1">


                    {/* Overview page */}
                    <NavLink
                        to="/bakery/dashboard"
                        end
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <LayoutDashboard
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Overview
                        </span>
                    </NavLink>


                    {/* Orders page */}
                    <NavLink
                        to="/bakery/orders"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <ShoppingBag
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Orders
                        </span>
                    </NavLink>


                    {/* Products page */}
                    <NavLink
                        to="/bakery/products"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <Package
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Products
                        </span>
                    </NavLink>


                    {/* Inventory page */}
                    <NavLink
                        to="/bakery/inventory"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <Boxes
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Inventory
                        </span>
                    </NavLink>


                    {/* Pickup Schedule page */}
                    <NavLink
                        to="/bakery/pickup-slots"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <CalendarDays
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Pickup Schedule
                        </span>
                    </NavLink>


                    {/* Customers page */}
                    <NavLink
                        to="/bakery/customers"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <Users
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Customers
                        </span>
                    </NavLink>


                    {/* Payments page */}
                    <NavLink
                        to="/bakery/payments"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <CreditCard
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Payments
                        </span>
                    </NavLink>


                    {/* Reviews page */}
                    <NavLink
                        to="/bakery/reviews"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <Star
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Reviews
                        </span>
                    </NavLink>


                    {/* Marketing page */}
                    <NavLink
                        to="/bakery/marketing"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""
                            }`
                        }
                        onClick={closeSidebar}
                    >
                        <Megaphone
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Marketing
                        </span>
                    </NavLink>


                    {/* Analytics page */}
                    <NavLink
                        to="/bakery/analytics"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""
                            }`
                        }
                        onClick={closeSidebar}
                    >
                        <BarChart3
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Analytics
                        </span>
                    </NavLink>

                </nav>


                {/* Bottom sidebar navigation */}
                <div className="bakery-dashboard-sidebar-bottom">


                    {/* Settings page */}
                    <NavLink
                        to="/bakery/settings"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <Settings
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Settings
                        </span>
                    </NavLink>


                    {/* Help and Support page */}
                    <NavLink
                        to="/bakery/help"
                        className={({ isActive }) =>
                            `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`
                        }
                        onClick={closeSidebar}
                    >
                        <CircleHelp
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Help & Support
                        </span>
                    </NavLink>


                    {/* Logs the Bakery Owner out */}
                    <button
                        type="button"
                        className="bakery-dashboard-nav-item w-100"
                        onClick={handleLogout}
                    >
                        <LogOut
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </div>

        </aside>
    );
}