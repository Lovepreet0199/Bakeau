//Used for dashboard navigation
import { NavLink } from "react-router-dom";

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
    ChevronDown,
    Boxes,
    Star,
    Megaphone,
    ChartNoAxesCombined,
    X
} from "lucide-react";

//Displays the shared sidebar used on Bakery Owner dashboard pages
export default function DashboardSidebar({
    isSidebarOpen,
    closeSidebar
}) {

    return (
        <aside
            id="bakeryDashboardSidebar"
            className={`bakery-dashboard-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}
        >

            {/* Keeps all sidebar content arranged vertically */}
            <div className="bakery-dashboard-sidebar-content d-flex flex-column">

                {/* Bakeau branding and mobile close button */}
                <div className="bakery-dashboard-brand d-flex align-items-center justify-content-between">

                    <h2>Bakeau</h2>

                    {/* Closes the sidebar on smaller screens */}
                    <button
                        type="button"
                        className="bakery-dashboard-sidebar-close d-lg-none"
                        aria-label="Close navigation"
                        onClick={closeSidebar}
                    >
                        <X size={20} strokeWidth={1.8} />
                    </button>

                </div>

                {/* Displays the Bakery Owner's current bakery */}
                <button
                    type="button"
                    className="bakery-dashboard-bakery-select"
                >

                    <div className="d-flex align-items-center gap-3">

                        {/* Bakery initials */}
                        <div className="bakery-dashboard-bakery-avatar">
                            SB
                        </div>

                        {/* Bakery information */}
                        <div>

                            <strong>Sandhu Bakery</strong>

                            <span className="d-flex align-items-center gap-1">
                                View storefront
                                <ExternalLink size={12} strokeWidth={1.8} />
                            </span>

                        </div>

                    </div>

                    {/* Bakery selector arrow */}
                    <ChevronDown size={17} strokeWidth={1.8} />

                </button>

                {/* Main dashboard navigation */}
                <nav className="bakery-dashboard-nav flex-grow-1">

                    {/* Overview page */}
                    <NavLink
                        to="/bakery/dashboard"
                        end
                        className={({ isActive }) => `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`}
                        onClick={closeSidebar}
                    >
                        <LayoutDashboard size={18} strokeWidth={1.8} />
                        <span>Overview</span>
                    </NavLink>

                    {/* Orders page */}
                    <NavLink
                        to="/bakery/orders"
                        className={({ isActive }) => `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`}
                        onClick={closeSidebar}
                    >
                        <ShoppingBag size={18} strokeWidth={1.8} />
                        <span>Orders</span>
                    </NavLink>

                    {/* Products page */}
                    <NavLink
                        to="/bakery/products"
                        className={({ isActive }) => `bakery-dashboard-nav-item text-decoration-none ${isActive ? "active" : ""}`}
                        onClick={closeSidebar}
                    >
                        <Package size={18} strokeWidth={1.8} />
                        <span>Products</span>
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

                    {/* Pickup schedule page */}
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
                    <button
                        type="button"
                        className="bakery-dashboard-nav-item"
                    >
                        <CreditCard size={18} strokeWidth={1.8} />
                        <span>Payments</span>
                    </button>

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
                    <button
                        type="button"
                        className="bakery-dashboard-nav-item"
                    >
                        <Megaphone size={18} strokeWidth={1.8} />
                        <span>Marketing</span>
                    </button>

                    {/* Analytics page */}
                    <button
                        type="button"
                        className="bakery-dashboard-nav-item"
                    >
                        <ChartNoAxesCombined size={18} strokeWidth={1.8} />
                        <span>Analytics</span>
                    </button>

                </nav>

                {/* Bottom sidebar navigation */}
                <div className="bakery-dashboard-sidebar-bottom">

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

                    {/* Help and support page */}
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

                    {/* Displays the logged-in Bakery Owner */}
                    <div className="bakery-dashboard-user">

                        {/* Bakery Owner initials */}
                        <div className="bakery-dashboard-user-avatar">
                            LS
                        </div>

                        {/* Bakery Owner information */}
                        <div>
                            <strong>Lovepreet S.</strong>
                            <span>Bakery Owner</span>
                        </div>

                    </div>

                </div>

            </div>

        </aside>
    );
}