//Allows the dashboard to track the mobile sidebar
import { useState } from "react";

//Import dashboard icons
import {
    Bell,
    LayoutDashboard,
    ShoppingBag,
    Package,
    CalendarDays,
    Users,
    CreditCard,
    Settings,
    CircleHelp,
    ExternalLink,
    Plus,
    Search,
    ChevronDown,
    Boxes,
    Star,
    Megaphone,
    ChartNoAxesCombined,
    DollarSign,
    ShoppingCart,
    ReceiptText,
    UserPlus,
    Menu,
    X
} from "lucide-react";

//Import the bakery dashboard page styles
import "./BakeryDashboard.css";

//Displays the main dashboard for the Bakery Owner
export default function BakeryDashboard() {

    //Tracks whether the sidebar is open on smaller screens
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <main className="bakery-dashboard-page">

            {/* Dark overlay shown behind the mobile sidebar */}
            {isSidebarOpen && (
                <button
                    type="button"
                    className="bakery-dashboard-sidebar-overlay d-lg-none"
                    aria-label="Close navigation"
                    onClick={() => setIsSidebarOpen(false)}
                ></button>
            )}

            <div className="container-fluid p-0">

                {/* Dashboard layout */}
                <div className="d-lg-flex min-vh-100">

                    {/* Bakery dashboard sidebar */}
                    <aside
                        id="bakeryDashboardSidebar"
                        className={`bakery-dashboard-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}
                    >

                        <div className="bakery-dashboard-sidebar-content d-flex flex-column">

                            {/* Bakeau branding */}
                            <div className="bakery-dashboard-brand d-flex align-items-center justify-content-between">

                                <h2>Bakeau</h2>

                                {/* Close button shown only on smaller screens */}
                                <button
                                    type="button"
                                    className="bakery-dashboard-sidebar-close d-lg-none"
                                    aria-label="Close navigation"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <X size={20} strokeWidth={1.8} />
                                </button>

                            </div>

                            {/* Current bakery */}
                            <button
                                type="button"
                                className="bakery-dashboard-bakery-select"
                            >

                                <div className="d-flex align-items-center gap-3">

                                    <div className="bakery-dashboard-bakery-avatar">
                                        SB
                                    </div>

                                    <div>
                                        <strong>Sandhu Bakery</strong>

                                        <span className="d-flex align-items-center gap-1">
                                            View storefront
                                            <ExternalLink size={12} strokeWidth={1.8} />
                                        </span>
                                    </div>

                                </div>

                                <ChevronDown size={17} strokeWidth={1.8} />

                            </button>

                            {/* Main navigation */}
                            <nav className="bakery-dashboard-nav flex-grow-1">

                                <button type="button" className="bakery-dashboard-nav-item active">
                                    <LayoutDashboard size={18} strokeWidth={1.8} />
                                    <span>Overview</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <ShoppingBag size={18} strokeWidth={1.8} />
                                    <span>Orders</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <Package size={18} strokeWidth={1.8} />
                                    <span>Products</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <Boxes size={18} strokeWidth={1.8} />
                                    <span>Inventory</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <CalendarDays size={18} strokeWidth={1.8} />
                                    <span>Pickup Schedule</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <Users size={18} strokeWidth={1.8} />
                                    <span>Customers</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <CreditCard size={18} strokeWidth={1.8} />
                                    <span>Payments</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <Star size={18} strokeWidth={1.8} />
                                    <span>Reviews</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <Megaphone size={18} strokeWidth={1.8} />
                                    <span>Marketing</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <ChartNoAxesCombined size={18} strokeWidth={1.8} />
                                    <span>Analytics</span>
                                </button>

                            </nav>

                            {/* Bottom navigation */}
                            <div className="bakery-dashboard-sidebar-bottom">

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <Settings size={18} strokeWidth={1.8} />
                                    <span>Settings</span>
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    <CircleHelp size={18} strokeWidth={1.8} />
                                    <span>Help & Support</span>
                                </button>

                                {/* Bakery Owner information */}
                                <div className="bakery-dashboard-user">

                                    <div className="bakery-dashboard-user-avatar">
                                        LS
                                    </div>

                                    <div>
                                        <strong>Lovepreet S.</strong>
                                        <span>Bakery Owner</span>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </aside>

                    {/* Main dashboard area */}
                    <section className="bakery-dashboard-main flex-grow-1">

                        {/* Dashboard top bar */}
                        <header className="bakery-dashboard-topbar d-flex align-items-center justify-content-between gap-2 gap-md-3">

                            {/* Left side of top bar */}
                            <div className="d-flex align-items-center flex-grow-1 gap-2 gap-md-3">

                                {/* Opens sidebar on mobile and tablet */}
                                <button
                                    type="button"
                                    className="bakery-dashboard-menu-button d-lg-none"
                                    aria-label="Open navigation"
                                    aria-controls="bakeryDashboardSidebar"
                                    aria-expanded={isSidebarOpen}
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <Menu size={21} strokeWidth={1.8} />
                                </button>

                                {/* Dashboard search */}
                                <div className="bakery-dashboard-search d-none d-sm-block flex-grow-1">

                                    <Search
                                        size={18}
                                        strokeWidth={1.8}
                                        className="bakery-dashboard-search-icon"
                                    />

                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search orders, customers, products..."
                                    />

                                </div>

                            </div>

                            {/* Topbar actions */}
                            <div className="d-flex align-items-center gap-2 gap-md-3">

                                <button
                                    type="button"
                                    className="bakery-dashboard-icon-button"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} strokeWidth={1.8} />
                                </button>

                                <div className="bakery-dashboard-topbar-user">

                                    <span className="bakery-dashboard-user-avatar">
                                        LS
                                    </span>

                                    <div className="d-none d-md-block">
                                        <strong>Lovepreet S.</strong>
                                        <span>Owner</span>
                                    </div>

                                    <ChevronDown size={16} strokeWidth={1.8} className="d-none d-md-block" />

                                </div>

                            </div>

                        </header>

                        {/* Dashboard content */}
                        <div className="bakery-dashboard-content">

                            {/* Dashboard heading */}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                                <div>
                                    <h1>Overview</h1>

                                    <p className="mb-0">
                                        Here's what's happening at Sandhu Bakery today.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn bakery-dashboard-primary-button d-flex align-items-center justify-content-center gap-2"
                                >
                                    <Plus size={18} strokeWidth={2} />
                                    <span>Add product</span>
                                </button>

                            </div>

                            {/* Dashboard summary cards */}
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">

                                {/* Revenue */}
                                <div className="col">
                                    <div className="card h-100 bakery-dashboard-stat-card">

                                        <div className="card-body">

                                            <div className="d-flex align-items-start justify-content-between gap-3">

                                                <div>
                                                    <p className="bakery-dashboard-stat-label mb-2">
                                                        Revenue
                                                    </p>

                                                    <h2 className="bakery-dashboard-stat-value mb-0">
                                                        $0.00
                                                    </h2>
                                                </div>

                                                <div className="bakery-dashboard-stat-icon">
                                                    <DollarSign size={19} strokeWidth={1.8} />
                                                </div>

                                            </div>

                                            <p className="bakery-dashboard-stat-note mb-0 mt-3">
                                                This week
                                            </p>

                                        </div>

                                    </div>
                                </div>

                                {/* Orders */}
                                <div className="col">
                                    <div className="card h-100 bakery-dashboard-stat-card">

                                        <div className="card-body">

                                            <div className="d-flex align-items-start justify-content-between gap-3">

                                                <div>
                                                    <p className="bakery-dashboard-stat-label mb-2">
                                                        Orders
                                                    </p>

                                                    <h2 className="bakery-dashboard-stat-value mb-0">
                                                        0
                                                    </h2>
                                                </div>

                                                <div className="bakery-dashboard-stat-icon">
                                                    <ShoppingCart size={19} strokeWidth={1.8} />
                                                </div>

                                            </div>

                                            <p className="bakery-dashboard-stat-note mb-0 mt-3">
                                                This week
                                            </p>

                                        </div>

                                    </div>
                                </div>

                                {/* Average order */}
                                <div className="col">
                                    <div className="card h-100 bakery-dashboard-stat-card">

                                        <div className="card-body">

                                            <div className="d-flex align-items-start justify-content-between gap-3">

                                                <div>
                                                    <p className="bakery-dashboard-stat-label mb-2">
                                                        Average order
                                                    </p>

                                                    <h2 className="bakery-dashboard-stat-value mb-0">
                                                        $0.00
                                                    </h2>
                                                </div>

                                                <div className="bakery-dashboard-stat-icon">
                                                    <ReceiptText size={19} strokeWidth={1.8} />
                                                </div>

                                            </div>

                                            <p className="bakery-dashboard-stat-note mb-0 mt-3">
                                                This week
                                            </p>

                                        </div>

                                    </div>
                                </div>

                                {/* New customers */}
                                <div className="col">
                                    <div className="card h-100 bakery-dashboard-stat-card">

                                        <div className="card-body">

                                            <div className="d-flex align-items-start justify-content-between gap-3">

                                                <div>
                                                    <p className="bakery-dashboard-stat-label mb-2">
                                                        New customers
                                                    </p>

                                                    <h2 className="bakery-dashboard-stat-value mb-0">
                                                        0
                                                    </h2>
                                                </div>

                                                <div className="bakery-dashboard-stat-icon">
                                                    <UserPlus size={19} strokeWidth={1.8} />
                                                </div>

                                            </div>

                                            <p className="bakery-dashboard-stat-note mb-0 mt-3">
                                                This week
                                            </p>

                                        </div>

                                    </div>
                                </div>

                            </div>

                            {/* Recent orders */}
                            <div className="card bakery-dashboard-section-card mb-4">

                                {/* Recent orders heading */}
                                <div className="card-header d-flex align-items-center justify-content-between gap-3">

                                    <div>
                                        <h2 className="bakery-dashboard-section-title mb-1">
                                            Recent orders
                                        </h2>

                                        <p className="bakery-dashboard-section-description mb-0">
                                            Latest customer orders for your bakery.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn bakery-dashboard-text-button"
                                    >
                                        View all
                                    </button>

                                </div>

                                {/* Makes the order table scroll horizontally on smaller screens */}
                                <div className="table-responsive">

                                    <table className="table bakery-dashboard-table align-middle mb-0">

                                        <thead>
                                            <tr>
                                                <th scope="col">Order</th>
                                                <th scope="col">Customer</th>
                                                <th scope="col">Items</th>
                                                <th scope="col">Total</th>
                                                <th scope="col">Status</th>
                                                <th scope="col" className="text-end">Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            <tr>
                                                <td>
                                                    <strong>#1001</strong>
                                                </td>

                                                <td>
                                                    Olivia Chen
                                                </td>

                                                <td>
                                                    Custom Cake
                                                </td>

                                                <td>
                                                    $58.00
                                                </td>

                                                <td>
                                                    <span className="badge bakery-order-status bakery-order-status-preparing">
                                                        Preparing
                                                    </span>
                                                </td>

                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn bakery-dashboard-table-action"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <strong>#1002</strong>
                                                </td>

                                                <td>
                                                    Priya Nair
                                                </td>

                                                <td>
                                                    Cupcakes
                                                </td>

                                                <td>
                                                    $36.00
                                                </td>

                                                <td>
                                                    <span className="badge bakery-order-status bakery-order-status-ready">
                                                        Ready
                                                    </span>
                                                </td>

                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn bakery-dashboard-table-action"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <strong>#1003</strong>
                                                </td>

                                                <td>
                                                    Daniel Ortiz
                                                </td>

                                                <td>
                                                    Cookie Box
                                                </td>

                                                <td>
                                                    $24.00
                                                </td>

                                                <td>
                                                    <span className="badge bakery-order-status bakery-order-status-completed">
                                                        Completed
                                                    </span>
                                                </td>

                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn bakery-dashboard-table-action"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}