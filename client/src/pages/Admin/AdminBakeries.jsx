import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate
} from "react-router-dom";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage.js";

//Import Admin Bakery page styles
import "./AdminBakeries.css";


//Displays Bakery accounts for the Platform Administrator
export default function AdminBakeries() {
    useEffect(() => {

        document.title =
            "Platform Admin | Bakeau";

    }, []);

    //Used to navigate between pages
    const navigate =
        useNavigate();

    //Stores Bakery accounts returned by the backend
    const [bakeries, setBakeries] =
        useState([]);

    //Tracks whether Bakery accounts are loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores an error message if Bakery accounts cannot be loaded
    const [error, setError] =
        useState("");

    //Logs the Platform Administrator out
    function handleAdminLogout() {

        //Remove any saved authentication information
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        sessionStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "user"
        );


        //Return Admin to Login page
        navigate(
            "/admin/login"
        );
    }
    //Loads Bakery accounts when the page first opens
    useEffect(() => {

        async function loadBakeries() {

            try {

                //Get saved authentication token
                const token =
                    getAuthToken();


                //Stop if Admin is not signed in
                if (!token) {

                    setError(
                        "Platform Administrator sign in is required."
                    );

                    return;
                }


                //Request Bakery accounts from Admin API
                const response =
                    await fetch(
                        `${API_URL}/api/admin/bakeries`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                //Convert response to JSON
                const data =
                    await response.json();


                //Stop if backend returns an error
                if (!response.ok) {

                    setError(
                        data.message ||
                        "Unable to load Bakery accounts."
                    );

                    return;
                }


                //Store Bakery accounts
                setBakeries(
                    data.bakeries || []
                );


            } catch (error) {

                console.error(
                    "Load Admin Bakeries error:",
                    error
                );


                setError(
                    "Unable to connect to Bakeau."
                );

            } finally {

                //Stop loading state
                setIsLoading(false);
            }
        }


        loadBakeries();

    }, []);


    //Count Bakeries by account status
    const approvedCount =
        bakeries.filter(
            (bakery) =>
                bakery.account_status === "Approved"
        ).length;

    const pendingCount =
        bakeries.filter(
            (bakery) =>
                bakery.account_status === "Pending"
        ).length;

    const suspendedCount =
        bakeries.filter(
            (bakery) =>
                bakery.account_status === "Suspended"
        ).length;


    return (

        <main className="admin-bakeries-page min-vh-100">


            {/* Platform Admin Header */}
            <header className="admin-bakeries-topbar">

                <div className="container-xxl">

                    <div className="d-flex align-items-center justify-content-between py-3">

                        {/* Bakeau Brand */}
                        <div>

                            <p className="admin-bakeries-brand mb-0">
                                Bakeau
                            </p>

                            <p className="admin-bakeries-brand-label mb-0">
                                Platform Administration
                            </p>

                        </div>


                        <div className="d-flex align-items-center gap-2">

                            {/* Platform Admin Label */}
                            <div className="admin-bakeries-admin-badge d-none d-sm-flex align-items-center gap-2">

                                <span className="admin-bakeries-admin-dot">
                                </span>

                                Platform Admin

                            </div>


                            {/* Admin Logout */}
                            <button
                                type="button"
                                className="btn admin-bakeries-logout-button"
                                onClick={
                                    handleAdminLogout
                                }
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </div>

            </header>


            {/* Main Content */}
            <section className="container-xxl py-4 py-lg-5">

                {/* Platform Admin Navigation */}
                <div className="d-flex flex-wrap gap-2 mb-4">

                    <span className="admin-bakeries-nav-link admin-bakeries-nav-link-active">
                        Bakery Accounts
                    </span>

                    <Link
                        to="/admin/reviews"
                        className="admin-bakeries-nav-link"
                    >
                        Reviews
                    </Link>

                </div>

                {/* Page Heading */}
                <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">

                    <div>

                        <p className="admin-bakeries-page-label mb-1">
                            PLATFORM MANAGEMENT
                        </p>

                        <h1 className="admin-bakeries-title mb-2">
                            Bakery Accounts
                        </h1>

                        <p className="admin-bakeries-description mb-0">
                            Review Bakery accounts and manage their platform access.
                        </p>

                    </div>


                    {/* Total Bakery Count */}
                    {!isLoading &&
                        !error && (

                            <div className="admin-bakeries-total">

                                <span className="admin-bakeries-total-number">
                                    {bakeries.length}
                                </span>

                                <span className="admin-bakeries-total-label">
                                    Total Bakeries
                                </span>

                            </div>

                        )}

                </div>


                {/* Bakery Account Summary */}
                {!isLoading &&
                    !error &&
                    bakeries.length > 0 && (

                        <div className="row g-3 mb-4">

                            {/* Approved */}
                            <div className="col-12 col-sm-4">

                                <div className="admin-summary-card">

                                    <div className="admin-summary-status admin-summary-approved">
                                    </div>

                                    <div>

                                        <p className="admin-summary-number mb-0">
                                            {approvedCount}
                                        </p>

                                        <p className="admin-summary-label mb-0">
                                            Approved
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Pending */}
                            <div className="col-12 col-sm-4">

                                <div className="admin-summary-card">

                                    <div className="admin-summary-status admin-summary-pending">
                                    </div>

                                    <div>

                                        <p className="admin-summary-number mb-0">
                                            {pendingCount}
                                        </p>

                                        <p className="admin-summary-label mb-0">
                                            Pending
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Suspended */}
                            <div className="col-12 col-sm-4">

                                <div className="admin-summary-card">

                                    <div className="admin-summary-status admin-summary-suspended">
                                    </div>

                                    <div>

                                        <p className="admin-summary-number mb-0">
                                            {suspendedCount}
                                        </p>

                                        <p className="admin-summary-label mb-0">
                                            Suspended
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                {/* Loading State */}
                {isLoading && (

                    <div className="admin-bakeries-state-card">
                        Loading Bakery accounts...
                    </div>

                )}


                {/* Error State */}
                {!isLoading &&
                    error && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                {/* Empty State */}
                {!isLoading &&
                    !error &&
                    bakeries.length === 0 && (

                        <div className="admin-bakeries-state-card">

                            <p className="admin-empty-title mb-1">
                                No Bakery accounts
                            </p>

                            <p className="admin-empty-text mb-0">
                                Bakery accounts will appear here when they are created.
                            </p>

                        </div>

                    )}


                {/* Bakery Accounts */}
                {!isLoading &&
                    !error &&
                    bakeries.length > 0 && (

                        <section className="admin-bakeries-table-card">

                            {/* Table Heading */}
                            <div className="admin-bakeries-table-heading d-flex align-items-center justify-content-between">

                                <div>

                                    <p className="admin-bakeries-card-eyebrow mb-1">
                                        ACCOUNTS
                                    </p>

                                    <h2 className="admin-bakeries-card-title mb-0">
                                        All Bakeries
                                    </h2>

                                </div>

                            </div>


                            {/* Responsive Table */}
                            <div className="table-responsive">

                                <table className="table align-middle mb-0 admin-bakeries-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Bakery
                                            </th>

                                            <th>
                                                Owner
                                            </th>

                                            <th>
                                                Location
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th className="text-end">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {bakeries.map(
                                            (bakery) => (

                                                <tr
                                                    key={
                                                        bakery._id
                                                    }
                                                >

                                                    {/* Bakery */}
                                                    <td>

                                                        <div className="d-flex align-items-center gap-3">

                                                            {/* Bakery Logo */}
                                                            <div className="admin-bakery-logo">

                                                                {bakery.logo_image_url ? (

                                                                    <img
                                                                        src={
                                                                            bakery.logo_image_url
                                                                        }
                                                                        alt={`${bakery.name} logo`}
                                                                    />

                                                                ) : (

                                                                    <span>
                                                                        {bakery.name
                                                                            ?.charAt(0)
                                                                            .toUpperCase()}
                                                                    </span>

                                                                )}

                                                            </div>


                                                            {/* Bakery Name */}
                                                            <div>

                                                                <p className="admin-bakery-name mb-1">
                                                                    {bakery.name}
                                                                </p>

                                                                <p className="admin-bakery-slug mb-0">
                                                                    /{bakery.slug}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* Bakery Owner */}
                                                    <td>

                                                        <p className="admin-table-primary mb-1">

                                                            {bakery.owner
                                                                ? `${bakery.owner.first_name} ${bakery.owner.last_name}`
                                                                : "Not available"}

                                                        </p>

                                                        <p className="admin-table-secondary mb-0">
                                                            {bakery.owner?.email ||
                                                                bakery.contact_email}
                                                        </p>

                                                    </td>


                                                    {/* Bakery Location */}
                                                    <td>

                                                        <p className="admin-table-primary mb-0">

                                                            {bakery.address?.city &&
                                                                bakery.address?.province
                                                                ? `${bakery.address.city}, ${bakery.address.province}`
                                                                : "Not provided"}

                                                        </p>

                                                    </td>


                                                    {/* Bakery Status */}
                                                    <td>

                                                        <span
                                                            className={
                                                                `admin-bakery-status admin-bakery-status-${bakery.account_status?.toLowerCase()}`
                                                            }
                                                        >

                                                            <span className="admin-bakery-status-dot">
                                                            </span>

                                                            {bakery.account_status}

                                                        </span>

                                                    </td>


                                                    {/* View Bakery */}
                                                    <td className="text-end">

                                                        <Link
                                                            to={`/admin/bakeries/${bakery._id}`}
                                                            className="btn admin-view-button"
                                                        >
                                                            View Details
                                                        </Link>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </section>

                    )}

            </section>

        </main>
    );
}