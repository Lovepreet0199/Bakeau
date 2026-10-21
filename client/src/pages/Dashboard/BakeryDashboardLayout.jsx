//Allows the dashboard to track the mobile sidebar
import {
    useEffect,
    useState
} from "react";

//Displays nested Bakery Owner dashboard pages
import { Outlet } from "react-router-dom";

//Import shared dashboard components
import DashboardSidebar from "../../components/BakeryOwner/dashboard/DashboardSidebar";
import DashboardTopbar from "../../components/BakeryOwner/dashboard/DashboardTopbar";

//Import shared dashboard layout styles
import "./styles/DashboardLayout.css";

//Displays the shared layout used by all Bakery Owner dashboard pages
export default function BakeryDashboardLayout() {

    //Updates the browser tab title for the Bakery Owner dashboard
    useEffect(() => {

        document.title =
            "Bakery Dashboard | Bakeau";

    }, []);

    //Tracks whether the sidebar is open on smaller screens
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    //Opens the sidebar on smaller screens
    function openSidebar() {
        setIsSidebarOpen(true);
    }

    //Closes the sidebar on smaller screens
    function closeSidebar() {
        setIsSidebarOpen(false);
    }

    return (
        <main className="bakery-dashboard-page">

            {/* Displays a dark overlay behind the open mobile sidebar */}
            {isSidebarOpen && (
                <button
                    type="button"
                    className="bakery-dashboard-sidebar-overlay d-lg-none"
                    aria-label="Close navigation"
                    onClick={closeSidebar}
                ></button>
            )}

            {/* Main dashboard layout container */}
            <div className="container-fluid p-0">

                <div className="d-lg-flex min-vh-100">

                    {/* Shared Bakery Owner sidebar */}
                    <DashboardSidebar
                        isSidebarOpen={isSidebarOpen}
                        closeSidebar={closeSidebar}
                    />

                    {/* Main dashboard content area */}
                    <section className="bakery-dashboard-main flex-grow-1">

                        {/* Shared Bakery Owner topbar */}
                        <DashboardTopbar
                            openSidebar={openSidebar}
                            isSidebarOpen={isSidebarOpen}
                        />

                        {/* Displays the current nested dashboard page */}
                        <Outlet />

                    </section>

                </div>

            </div>

        </main>
    );
}