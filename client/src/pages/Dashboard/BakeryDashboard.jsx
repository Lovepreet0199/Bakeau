//Import the bakery dashboard page styles
import "./BakeryDashboard.css";

//Displays the main dashboard for the Bakery Owner
export default function BakeryDashboard() {

    return (
        <main className="bakery-dashboard-page">

            <div className="container-fluid p-0">

                <div className="row g-0">

                    {/* Bakery dashboard sidebar */}
                    <aside className="col-12 col-lg-auto bakery-dashboard-sidebar">

                        <div className="bakery-dashboard-sidebar-content d-flex flex-column">

                            {/* Bakeau branding */}
                            <div className="bakery-dashboard-brand">
                                <h2>Bakeau</h2>
                                <p>Sweet Business, Simpler</p>
                            </div>

                            {/* Current bakery */}
                            <button
                                type="button"
                                className="bakery-dashboard-bakery-select"
                            >
                                <div>
                                    <strong>Sandhu Bakery</strong>
                                    <span>View storefront</span>
                                </div>

                                <span>⌄</span>
                            </button>

                            {/* Main navigation */}
                            <nav className="bakery-dashboard-nav flex-grow-1">

                                <button type="button" className="bakery-dashboard-nav-item active">
                                    Overview
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Orders
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Products
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Inventory
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Pickup Schedule
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Customers
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Payments
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Reviews
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Marketing
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Analytics
                                </button>

                            </nav>

                            {/* Bottom navigation */}
                            <div className="bakery-dashboard-sidebar-bottom">

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Settings
                                </button>

                                <button type="button" className="bakery-dashboard-nav-item">
                                    Help & Support
                                </button>

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
                    <section className="col bakery-dashboard-main">

                        {/* Dashboard top bar */}
                        <header className="bakery-dashboard-topbar d-flex align-items-center justify-content-between gap-3">

                            <div className="bakery-dashboard-search">
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search orders, customers, products..."
                                />
                            </div>

                            <div className="d-flex align-items-center gap-3">

                                <button
                                    type="button"
                                    className="btn bakery-dashboard-icon-button"
                                >
                                    🔔
                                </button>

                                <div className="bakery-dashboard-topbar-user">
                                    <span className="bakery-dashboard-user-avatar">
                                        LS
                                    </span>

                                    <strong>Lovepreet S.</strong>
                                </div>

                            </div>

                        </header>

                        {/* Dashboard content */}
                        <div className="bakery-dashboard-content">

                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                                <div>
                                    <h1>Good morning, Lovepreet!</h1>

                                    <p className="mb-0">
                                        Here's what's happening at Sandhu Bakery today.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn bakery-dashboard-primary-button"
                                >
                                    + Add product
                                </button>

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}