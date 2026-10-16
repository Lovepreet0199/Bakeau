//Import React state
import {
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

//Import authentication helpers
import {
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


    //Opens or closes the account menu
    function toggleAccountMenu() {

        setIsAccountMenuOpen(
            !isAccountMenuOpen
        );
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
                    <Bell
                        size={20}
                        strokeWidth={1.8}
                    />
                </button>


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