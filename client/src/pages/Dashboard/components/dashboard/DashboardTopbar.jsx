//Import topbar icons
import {
    Bell,
    Search,
    ChevronDown,
    Menu
} from "lucide-react";

//Displays the shared topbar used throughout the Bakery Owner dashboard
export default function DashboardTopbar({
    openSidebar,
    isSidebarOpen
}) {

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
                    aria-expanded={isSidebarOpen}
                    onClick={openSidebar}
                >
                    <Menu size={21} strokeWidth={1.8} />
                </button>

                {/* Dashboard search field */}
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
                    />

                </div>

            </div>

            {/* Right side topbar actions */}
            <div className="d-flex align-items-center gap-2 gap-md-3">

                {/* Notifications button */}
                <button
                    type="button"
                    className="bakery-dashboard-icon-button"
                    aria-label="Notifications"
                >
                    <Bell size={20} strokeWidth={1.8} />
                </button>

                {/* Displays the logged-in Bakery Owner */}
                <div className="bakery-dashboard-topbar-user">

                    {/* Bakery Owner initials */}
                    <span className="bakery-dashboard-user-avatar">
                        LS
                    </span>

                    {/* Bakery Owner information */}
                    <div className="d-none d-md-block">
                        <strong>Lovepreet S.</strong>
                        <span>Owner</span>
                    </div>

                    {/* Account dropdown arrow */}
                    <ChevronDown
                        size={16}
                        strokeWidth={1.8}
                        className="d-none d-md-block"
                    />

                </div>

            </div>

        </header>
    );
}