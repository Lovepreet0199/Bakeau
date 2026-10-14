//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router Link
import {
    Link
} from "react-router-dom";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage.js";

//Import Admin Bakery page styles
import "./AdminBakeries.css";


//Displays Bakery accounts for the Platform Administrator
export default function AdminBakeries() {

    //Stores Bakery accounts returned by the backend
    const [bakeries, setBakeries] =
        useState([]);

    //Tracks whether Bakery accounts are loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores an error message if Bakery accounts cannot be loaded
    const [error, setError] =
        useState("");


    //Loads Bakery accounts when the page first opens
    useEffect(() => {

        async function loadBakeries() {

            try {

                //Get saved authentication token
                const token =
                    getAuthToken();


                //Stop if there is no signed-in user
                if (!token) {

                    setError(
                        "Platform Administrator sign in is required."
                    );

                    return;
                }


                //Request Bakery accounts from the Admin API
                const response =
                    await fetch(
                        "http://localhost:3000/api/admin/bakeries",
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


                //Stop if the backend returns an error
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


    return (

        <main className="admin-bakeries-page min-vh-100">

            {/* Admin Top Bar */}
            <header className="admin-topbar">

                <div className="container-fluid px-4 px-lg-5">

                    <div className="d-flex align-items-center justify-content-between py-3">

                        <div>
                            <p className="admin-brand mb-0">
                                Bakeau
                            </p>

                            <p className="admin-brand-label mb-0">
                                Platform Administration
                            </p>
                        </div>

                    </div>

                </div>

            </header>


            {/* Main Page Content */}
            <section className="container-fluid px-4 px-lg-5 py-5">

                {/* Page Heading */}
                <div className="mb-4">

                    <p className="admin-page-label mb-2">
                        PLATFORM MANAGEMENT
                    </p>

                    <h1 className="admin-page-title mb-2">
                        Bakery Accounts
                    </h1>

                    <p className="admin-page-description mb-0">
                        Review Bakery accounts and their current account status.
                    </p>

                </div>


                {/* Loading Message */}
                {isLoading && (

                    <div className="admin-state-card">
                        Loading Bakery accounts...
                    </div>

                )}


                {/* Error Message */}
                {!isLoading && error && (

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

                        <div className="admin-state-card">
                            No Bakery accounts were found.
                        </div>

                    )}


                {/* Bakery Accounts Table */}
                {!isLoading &&
                    !error &&
                    bakeries.length > 0 && (

                        <div className="admin-table-card">

                            <div className="table-responsive">

                                <table className="table align-middle mb-0">

                                    <thead>

                                        <tr>
                                            <th>
                                                Bakery
                                            </th>

                                            <th>
                                                Owner
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Location
                                            </th>

                                            <th>
                                                Status
                                            </th>
                                            <th>
                                                Actions
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

                                                            <div className="admin-bakery-logo">

                                                                {bakery.logo_image_url ? (

                                                                    <img
                                                                        src={
                                                                            bakery.logo_image_url
                                                                        }
                                                                        alt=""
                                                                    />

                                                                ) : (

                                                                    <span>
                                                                        {bakery.name
                                                                            ?.charAt(0)
                                                                            .toUpperCase()}
                                                                    </span>

                                                                )}

                                                            </div>


                                                            <div>

                                                                <p className="admin-bakery-name mb-1">
                                                                    {
                                                                        bakery.name
                                                                    }
                                                                </p>

                                                                <p className="admin-bakery-slug mb-0">
                                                                    /{
                                                                        bakery.slug
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* Owner */}
                                                    <td>

                                                        {bakery.owner
                                                            ? `${bakery.owner.first_name} ${bakery.owner.last_name}`
                                                            : "Not available"}

                                                    </td>


                                                    {/* Owner Email */}
                                                    <td>

                                                        {bakery.owner?.email ||
                                                            bakery.contact_email}

                                                    </td>


                                                    {/* Location */}
                                                    <td>

                                                        {bakery.address?.city &&
                                                            bakery.address?.province
                                                            ? `${bakery.address.city}, ${bakery.address.province}`
                                                            : "Not provided"}

                                                    </td>


                                                    {/* Account Status */}
                                                    <td>

                                                        <span
                                                            className={
                                                                `admin-status admin-status-${bakery.account_status?.toLowerCase()}`
                                                            }
                                                        >
                                                            {
                                                                bakery.account_status
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* Actions */}
                                                    <td>

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

                        </div>

                    )}

            </section>

        </main>
    );
}