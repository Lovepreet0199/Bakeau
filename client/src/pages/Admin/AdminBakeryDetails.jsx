import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage.js";

//Import Bakery Details styles
import "./AdminBakeryDetails.css";


//Displays one Bakery account for the Platform Administrator
export default function AdminBakeryDetails() {

    //Used to navigate between pages
    const navigate =
        useNavigate();

    //Get Bakery ID from the URL
    const {
        id
    } = useParams();

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
    //Stores Bakery information
    const [bakery, setBakery] =
        useState(null);

    //Tracks whether Bakery information is loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores page error message
    const [error, setError] =
        useState("");

    //Stores the Bakery status selected by the Admin
    const [statusAction, setStatusAction] =
        useState("");

    //Controls the confirmation modal
    const [showStatusModal, setShowStatusModal] =
        useState(false);

    //Tracks whether the status update is running
    const [isUpdatingStatus, setIsUpdatingStatus] =
        useState(false);

    //Stores status update error message
    const [statusError, setStatusError] =
        useState("");

    //Stores status update success message
    const [statusMessage, setStatusMessage] =
        useState("");


    //Loads Bakery information when the page opens
    useEffect(() => {

        async function loadBakery() {

            try {

                //Get saved Admin authentication token
                const token =
                    getAuthToken();


                //Stop if Admin is not signed in
                if (!token) {

                    setError(
                        "Platform Administrator sign in is required."
                    );

                    return;
                }


                //Request Bakery account information
                const response =
                    await fetch(
                        `${API_URL}/api/admin/bakeries/${id}`,
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
                        "Unable to load Bakery account."
                    );

                    return;
                }


                //Store Bakery information
                setBakery(
                    data.bakery
                );


            } catch (error) {

                console.error(
                    "Load Admin Bakery error:",
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


        loadBakery();

    }, [id]);


    //Opens the Bakery status confirmation modal
    function openStatusModal(newStatus) {

        //Store selected status
        setStatusAction(
            newStatus
        );

        //Clear previous messages
        setStatusError("");
        setStatusMessage("");

        //Open confirmation modal
        setShowStatusModal(
            true
        );
    }


    //Closes the Bakery status confirmation modal
    function closeStatusModal() {

        //Do not close while update is running
        if (isUpdatingStatus) {
            return;
        }


        setShowStatusModal(
            false
        );

        setStatusAction("");
    }


    //Updates the Bakery account status
    async function handleStatusUpdate() {

        try {

            //Start status update
            setIsUpdatingStatus(
                true
            );

            setStatusError("");


            //Get Admin authentication token
            const token =
                getAuthToken();


            //Send Bakery status update
            const response =
                await fetch(
                    `${API_URL}/api/admin/bakeries/${id}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            account_status:
                                statusAction
                        })
                    }
                );


            //Convert response to JSON
            const data =
                await response.json();


            //Stop if backend returns an error
            if (!response.ok) {

                setStatusError(
                    data.message ||
                    "Unable to update Bakery account."
                );

                return;
            }


            //Update Bakery information on the page
            setBakery(
                (currentBakery) => ({
                    ...currentBakery,

                    account_status:
                        data.bakery.account_status,

                    updated_at:
                        data.bakery.updated_at
                })
            );


            //Display success message
            setStatusMessage(
                data.message
            );


            //Close confirmation modal
            setShowStatusModal(
                false
            );

            setStatusAction("");


        } catch (error) {

            console.error(
                "Admin Bakery status update error:",
                error
            );


            setStatusError(
                "Unable to connect to Bakeau."
            );

        } finally {

            //Stop loading state
            setIsUpdatingStatus(
                false
            );
        }
    }


    return (

        <main className="admin-bakery-details-page min-vh-100">


            {/* Platform Admin Header */}
            <header className="admin-details-topbar">

                <div className="container-xxl">

                    <div className="d-flex align-items-center justify-content-between py-3">

                        {/* Bakeau Brand */}
                        <div>

                            <p className="admin-details-brand mb-0">
                                Bakeau
                            </p>

                            <p className="admin-details-brand-label mb-0">
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


            {/* Main Page Content */}
            <section className="container-xxl py-4 py-lg-5">

                {/* Platform Admin Navigation */}
                <div className="d-flex flex-wrap gap-2 mb-4">

                    <Link
                        to="/admin/bakeries"
                        className="admin-details-nav-link admin-details-nav-link-active"
                    >
                        Bakery Accounts
                    </Link>

                    <Link
                        to="/admin/reviews"
                        className="admin-details-nav-link"
                    >
                        Reviews
                    </Link>

                </div>



                {/* Back Navigation */}
                <div className="mb-4">

                    <Link
                        to="/admin/bakeries"
                        className="admin-details-back-link d-inline-flex align-items-center gap-2"
                    >
                        <span aria-hidden="true">
                            ←
                        </span>

                        Bakery Accounts
                    </Link>

                </div>


                {/* Status Update Success Message */}
                {statusMessage && (

                    <div
                        className="admin-details-success-message d-flex align-items-start gap-3 mb-4"
                        role="alert"
                    >

                        <div className="admin-details-success-icon">
                            ✓
                        </div>

                        <div>

                            <p className="admin-details-success-title mb-1">
                                Account updated
                            </p>

                            <p className="admin-details-success-text mb-0">
                                {statusMessage}
                            </p>

                        </div>

                    </div>

                )}


                {/* Loading State */}
                {isLoading && (

                    <div className="admin-details-state-card">
                        Loading Bakery account...
                    </div>

                )}


                {/* Error State */}
                {!isLoading && error && (

                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                {/* Bakery Details */}
                {!isLoading &&
                    !error &&
                    bakery && (

                        <>

                            {/* Bakery Summary Card */}
                            <section className="admin-details-summary-card mb-4">

                                <div className="row align-items-center g-4">

                                    {/* Bakery Identity */}
                                    <div className="col-12 col-lg">

                                        <div className="d-flex align-items-center gap-3 gap-md-4">

                                            {/* Bakery Logo */}
                                            <div className="admin-details-logo">

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

                                                <p className="admin-details-label mb-1">
                                                    BAKERY ACCOUNT
                                                </p>

                                                <h1 className="admin-details-title mb-1">
                                                    {bakery.name}
                                                </h1>

                                                <p className="admin-details-slug mb-0">
                                                    bakeau.com/{bakery.slug}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Status And Actions */}
                                    <div className="col-12 col-lg-auto">

                                        <div className="admin-details-actions d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">

                                            {/* Current Status */}
                                            <span
                                                className={
                                                    `admin-details-status admin-details-status-${bakery.account_status?.toLowerCase()}`
                                                }
                                            >

                                                <span className="admin-status-dot">
                                                </span>

                                                {bakery.account_status}

                                            </span>


                                            {/* Suspend Approved Bakery */}
                                            {bakery.account_status === "Approved" && (

                                                <button
                                                    type="button"
                                                    className="btn admin-suspend-button"
                                                    onClick={() =>
                                                        openStatusModal(
                                                            "Suspended"
                                                        )
                                                    }
                                                >
                                                    Suspend Bakery
                                                </button>

                                            )}


                                            {/* Approve Pending or Suspended Bakery */}
                                            {bakery.account_status !== "Approved" && (

                                                <button
                                                    type="button"
                                                    className="btn admin-approve-button"
                                                    onClick={() =>
                                                        openStatusModal(
                                                            "Approved"
                                                        )
                                                    }
                                                >
                                                    Approve Bakery
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* Bakery Detail Grid */}
                            <div className="row g-4">


                                {/* Main Bakery Information */}
                                <div className="col-12 col-xl-8">


                                    {/* Bakery Information */}
                                    <section className="admin-details-card h-100">

                                        {/* Card Heading */}
                                        <div className="admin-details-card-header mb-4">

                                            <p className="admin-details-card-eyebrow mb-1">
                                                PROFILE
                                            </p>

                                            <h2 className="admin-details-card-title mb-0">
                                                Bakery Information
                                            </h2>

                                        </div>


                                        <div className="row g-4">


                                            {/* Bakery Name */}
                                            <div className="col-12 col-md-6">

                                                <div className="admin-details-field">

                                                    <p className="admin-details-field-label">
                                                        Bakery Name
                                                    </p>

                                                    <p className="admin-details-field-value">
                                                        {bakery.name}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Contact Email */}
                                            <div className="col-12 col-md-6">

                                                <div className="admin-details-field">

                                                    <p className="admin-details-field-label">
                                                        Contact Email
                                                    </p>

                                                    <p className="admin-details-field-value admin-details-break">
                                                        {bakery.contact_email || "Not provided"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Contact Phone */}
                                            <div className="col-12 col-md-6">

                                                <div className="admin-details-field">

                                                    <p className="admin-details-field-label">
                                                        Contact Phone
                                                    </p>

                                                    <p className="admin-details-field-value">
                                                        {bakery.contact_phone || "Not provided"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Location */}
                                            <div className="col-12 col-md-6">

                                                <div className="admin-details-field">

                                                    <p className="admin-details-field-label">
                                                        Location
                                                    </p>

                                                    <p className="admin-details-field-value">

                                                        {bakery.address
                                                            ? `${bakery.address.city || ""}${bakery.address.city && bakery.address.province ? ", " : ""}${bakery.address.province || ""}`
                                                            : "Not provided"}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* Address */}
                                            <div className="col-12">

                                                <div className="admin-details-field">

                                                    <p className="admin-details-field-label">
                                                        Address
                                                    </p>

                                                    <p className="admin-details-field-value">

                                                        {bakery.address
                                                            ? `${bakery.address.street || ""}, ${bakery.address.city || ""}, ${bakery.address.province || ""} ${bakery.address.postal_code || ""}, ${bakery.address.country || ""}`
                                                            : "Not provided"}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* Description */}
                                            <div className="col-12">

                                                <div className="admin-details-field admin-details-description-field">

                                                    <p className="admin-details-field-label">
                                                        Description
                                                    </p>

                                                    <p className="admin-details-field-value admin-details-description">
                                                        {bakery.description || "No description provided."}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </section>

                                </div>


                                {/* Bakery Owner */}
                                <div className="col-12 col-xl-4">

                                    <section className="admin-details-card h-100">

                                        {/* Card Heading */}
                                        <div className="admin-details-card-header mb-4">

                                            <p className="admin-details-card-eyebrow mb-1">
                                                OWNER
                                            </p>

                                            <h2 className="admin-details-card-title mb-0">
                                                Bakery Owner
                                            </h2>

                                        </div>


                                        {/* Owner Avatar */}
                                        <div className="d-flex align-items-center gap-3 mb-4">

                                            <div className="admin-owner-avatar">

                                                {bakery.owner?.first_name
                                                    ?.charAt(0)
                                                    .toUpperCase()}

                                                {bakery.owner?.last_name
                                                    ?.charAt(0)
                                                    .toUpperCase()}

                                            </div>


                                            <div>

                                                <p className="admin-owner-name mb-1">

                                                    {bakery.owner
                                                        ? `${bakery.owner.first_name} ${bakery.owner.last_name}`
                                                        : "Not available"}

                                                </p>

                                                <p className="admin-owner-role mb-0">
                                                    Bakery Owner
                                                </p>

                                            </div>

                                        </div>


                                        {/* Owner Details */}
                                        <div className="admin-owner-details">

                                            <div className="admin-details-field">

                                                <p className="admin-details-field-label">
                                                    Email
                                                </p>

                                                <p className="admin-details-field-value admin-details-break">
                                                    {bakery.owner?.email || "Not available"}
                                                </p>

                                            </div>


                                            <div className="admin-details-field">

                                                <p className="admin-details-field-label">
                                                    Phone
                                                </p>

                                                <p className="admin-details-field-value">
                                                    {bakery.owner?.phone_number || "Not provided"}
                                                </p>

                                            </div>

                                        </div>

                                    </section>

                                </div>


                                {/* Bakery Settings */}
                                <div className="col-12 col-xl-8">

                                    <section className="admin-details-card">

                                        {/* Card Heading */}
                                        <div className="admin-details-card-header mb-4">

                                            <p className="admin-details-card-eyebrow mb-1">
                                                CONFIGURATION
                                            </p>

                                            <h2 className="admin-details-card-title mb-0">
                                                Bakery Settings
                                            </h2>

                                        </div>


                                        <div className="row g-3">


                                            {/* Setup */}
                                            <div className="col-6 col-md-4">

                                                <div className="admin-setting-item">

                                                    <p className="admin-details-field-label">
                                                        Setup
                                                    </p>

                                                    <p className="admin-setting-value">
                                                        {bakery.setup_completed
                                                            ? "Completed"
                                                            : "Incomplete"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Accepting Orders */}
                                            <div className="col-6 col-md-4">

                                                <div className="admin-setting-item">

                                                    <p className="admin-details-field-label">
                                                        Accepting Orders
                                                    </p>

                                                    <p className="admin-setting-value">
                                                        {bakery.accepting_orders
                                                            ? "Yes"
                                                            : "No"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Currency */}
                                            <div className="col-6 col-md-4">

                                                <div className="admin-setting-item">

                                                    <p className="admin-details-field-label">
                                                        Currency
                                                    </p>

                                                    <p className="admin-setting-value">
                                                        {bakery.currency || "CAD"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Order Notice */}
                                            <div className="col-6 col-md-4">

                                                <div className="admin-setting-item">

                                                    <p className="admin-details-field-label">
                                                        Order Notice
                                                    </p>

                                                    <p className="admin-setting-value">
                                                        {bakery.minimum_order_notice ?? "Not set"} hours
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Daily Order Limit */}
                                            <div className="col-6 col-md-4">

                                                <div className="admin-setting-item">

                                                    <p className="admin-details-field-label">
                                                        Daily Order Limit
                                                    </p>

                                                    <p className="admin-setting-value">
                                                        {bakery.maximum_orders_per_day ?? "Not set"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Payment Rule */}
                                            <div className="col-6 col-md-4">

                                                <div className="admin-setting-item">

                                                    <p className="admin-details-field-label">
                                                        Payment Rule
                                                    </p>

                                                    <p className="admin-setting-value text-capitalize">
                                                        {bakery.payment_rule || "Not set"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </section>

                                </div>


                                {/* Account Information */}
                                <div className="col-12 col-xl-4">

                                    <section className="admin-details-card">

                                        {/* Card Heading */}
                                        <div className="admin-details-card-header mb-4">

                                            <p className="admin-details-card-eyebrow mb-1">
                                                ACCOUNT
                                            </p>

                                            <h2 className="admin-details-card-title mb-0">
                                                Account Details
                                            </h2>

                                        </div>


                                        <div className="admin-account-details">

                                            {/* Account Status */}
                                            <div className="admin-account-row">

                                                <span>
                                                    Account Status
                                                </span>

                                                <strong>
                                                    {bakery.account_status}
                                                </strong>

                                            </div>


                                            {/* Created */}
                                            <div className="admin-account-row">

                                                <span>
                                                    Created
                                                </span>

                                                <strong>

                                                    {bakery.created_at
                                                        ? new Date(
                                                            bakery.created_at
                                                        ).toLocaleDateString()
                                                        : "Not available"}

                                                </strong>

                                            </div>


                                            {/* Last Updated */}
                                            <div className="admin-account-row">

                                                <span>
                                                    Last Updated
                                                </span>

                                                <strong>

                                                    {bakery.updated_at
                                                        ? new Date(
                                                            bakery.updated_at
                                                        ).toLocaleDateString()
                                                        : "Not available"}

                                                </strong>

                                            </div>

                                        </div>

                                    </section>

                                </div>

                            </div>

                        </>

                    )}

            </section>


            {/* Bakery Status Confirmation Modal */}
            {showStatusModal && (

                <div
                    className="admin-modal-backdrop d-flex align-items-center justify-content-center p-3"
                    role="presentation"
                >

                    <div
                        className="admin-status-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-status-modal-title"
                    >

                        {/* Modal Status Icon */}
                        <div
                            className={
                                statusAction === "Approved"
                                    ? "admin-modal-icon admin-modal-icon-approve"
                                    : "admin-modal-icon admin-modal-icon-suspend"
                            }
                        >
                            {statusAction === "Approved"
                                ? "✓"
                                : "!"}
                        </div>


                        {/* Modal Heading */}
                        <h2
                            id="admin-status-modal-title"
                            className="admin-status-modal-title mt-3 mb-2"
                        >

                            {statusAction === "Approved"
                                ? "Approve Bakery?"
                                : "Suspend Bakery?"}

                        </h2>


                        {/* Modal Description */}
                        <p className="admin-status-modal-description mb-4">

                            {statusAction === "Approved"
                                ? `Approve ${bakery?.name} and make its public storefront available to customers?`
                                : `Suspend ${bakery?.name}? Customers will no longer be able to access its public storefront.`}

                        </p>


                        {/* Status Error */}
                        {statusError && (

                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {statusError}
                            </div>

                        )}


                        {/* Modal Actions */}
                        <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2">

                            <button
                                type="button"
                                className="btn admin-modal-cancel-button"
                                onClick={
                                    closeStatusModal
                                }
                                disabled={
                                    isUpdatingStatus
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    statusAction === "Approved"
                                        ? "btn admin-modal-approve-button"
                                        : "btn admin-modal-suspend-button"
                                }
                                onClick={
                                    handleStatusUpdate
                                }
                                disabled={
                                    isUpdatingStatus
                                }
                            >

                                {isUpdatingStatus
                                    ? "Updating..."
                                    : statusAction === "Approved"
                                        ? "Approve Bakery"
                                        : "Suspend Bakery"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}