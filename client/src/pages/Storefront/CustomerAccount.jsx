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

//Import icons
import {
    ArrowLeft,
    Eye,
    EyeOff,
    KeyRound,
    Save,
    UserRound
} from "lucide-react";

//Import Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Account styles
import "./CustomerAccount.css";


//Displays Customer Account Settings
export default function CustomerAccount() {

    //Get Bakery slug from URL
    const { slug } = useParams();

    //Used to navigate between pages
    const navigate = useNavigate();


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);


    //Stores logged-in Customer
    const [
        customer,
        setCustomer
    ] = useState(null);


    //Tracks page loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    //Stores profile form values
    const [
        profileForm,
        setProfileForm
    ] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: ""
    });


    //Stores password form values
    const [
        passwordForm,
        setPasswordForm
    ] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });


    //Tracks profile save request
    const [
        isSavingProfile,
        setIsSavingProfile
    ] = useState(false);


    //Tracks password request
    const [
        isChangingPassword,
        setIsChangingPassword
    ] = useState(false);


    //Stores profile feedback
    const [
        profileMessage,
        setProfileMessage
    ] = useState({
        type: "",
        text: ""
    });


    //Stores password feedback
    const [
        passwordMessage,
        setPasswordMessage
    ] = useState({
        type: "",
        text: ""
    });


    //Tracks password visibility
    const [
        showCurrentPassword,
        setShowCurrentPassword
    ] = useState(false);


    const [
        showNewPassword,
        setShowNewPassword
    ] = useState(false);


    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);


    //Gets authentication token
    function getAuthToken() {

        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }


    //Gets stored User
    function getStoredCustomer() {

        const storedUser =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");


        if (!storedUser) {
            return null;
        }


        try {

            const parsedUser =
                JSON.parse(
                    storedUser
                );


            //Only Customers can use this page
            if (
                parsedUser.role !==
                "customer"
            ) {
                return null;
            }


            return parsedUser;

        } catch (error) {

            console.error(
                "Unable to read Customer account:",
                error
            );

            return null;
        }
    }


    //Updates stored Customer information
    function updateStoredCustomer(updatedCustomer) {

        //Update whichever storage is currently being used
        if (
            localStorage.getItem("user")
        ) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedCustomer
                )
            );

        } else {

            sessionStorage.setItem(
                "user",
                JSON.stringify(
                    updatedCustomer
                )
            );
        }


        //Update page state
        setCustomer(
            updatedCustomer
        );
    }


    //Loads Bakery and Customer information
    useEffect(() => {

        async function loadAccountPage() {

            const storedCustomer =
                getStoredCustomer();

            const token =
                getAuthToken();


            //Send guests to Customer login
            if (
                !storedCustomer ||
                !token
            ) {

                const redirectTo =
                    `/${slug}/account`;


                navigate(
                    `/${slug}/login?redirect=${encodeURIComponent(
                        redirectTo
                    )}`,
                    {
                        replace: true
                    }
                );

                return;
            }


            try {

                //Load Bakery and Customer account together
                const [
                    bakeryResponse,
                    accountResponse
                ] =
                    await Promise.all([

                        fetch(
                            `${API_URL}/api/bakeries/public/${slug}`
                        ),

                        fetch(
                            `${API_URL}/api/auth/me`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        )

                    ]);


                const bakeryData =
                    await bakeryResponse.json();

                const accountData =
                    await accountResponse.json();


                //Check Bakery response
                if (!bakeryResponse.ok) {

                    throw new Error(
                        bakeryData.message ||
                        "Unable to load bakery."
                    );
                }


                //Check account response
                if (!accountResponse.ok) {

                    //Authentication is no longer valid
                    if (
                        accountResponse.status ===
                        401
                    ) {

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


                        const redirectTo =
                            `/${slug}/account`;


                        navigate(
                            `/${slug}/login?redirect=${encodeURIComponent(
                                redirectTo
                            )}`,
                            {
                                replace: true
                            }
                        );

                        return;
                    }


                    throw new Error(
                        accountData.message ||
                        "Unable to load account."
                    );
                }


                //Only Customer accounts can use this page
                if (
                    accountData.user.role !==
                    "customer"
                ) {

                    navigate(
                        `/${slug}`,
                        {
                            replace: true
                        }
                    );

                    return;
                }


                //Store Bakery
                setBakery(
                    bakeryData.bakery
                );


                //Store current Customer from Database
                setCustomer(
                    accountData.user
                );


                //Keep stored User synchronized
                updateStoredCustomer(
                    accountData.user
                );


                //Fill Account form
                setProfileForm({
                    first_name:
                        accountData.user.first_name || "",

                    last_name:
                        accountData.user.last_name || "",

                    phone_number:
                        accountData.user.phone_number || "",

                    email:
                        accountData.user.email || ""
                });


            } catch (error) {

                console.error(
                    "Unable to load Account page:",
                    error
                );

            } finally {

                setIsLoading(
                    false
                );
            }
        }


        loadAccountPage();

    }, [
        navigate,
        slug
    ]);


    //Updates profile input values
    function handleProfileChange(event) {

        const {
            name,
            value
        } = event.target;


        setProfileForm(
            (currentForm) => ({
                ...currentForm,
                [name]: value
            })
        );
    }


    //Updates password input values
    function handlePasswordChange(event) {

        const {
            name,
            value
        } = event.target;


        setPasswordForm(
            (currentForm) => ({
                ...currentForm,
                [name]: value
            })
        );
    }


    //Gets first validation message from Backend
    function getValidationMessage(data) {

        if (
            data.errors &&
            data.errors.length > 0
        ) {

            return (
                data.errors[0].msg ||
                "Please check your information."
            );
        }


        return (
            data.message ||
            "Something went wrong."
        );
    }


    //Saves Customer profile
    async function handleProfileSubmit(event) {

        event.preventDefault();


        setProfileMessage({
            type: "",
            text: ""
        });


        //Basic validation
        if (
            !profileForm.first_name.trim() ||
            !profileForm.last_name.trim()
        ) {

            setProfileMessage({
                type: "error",
                text:
                    "First name and last name are required."
            });

            return;
        }


        try {

            setIsSavingProfile(
                true
            );


            const token =
                getAuthToken();


            //Update authenticated Customer
            const response =
                await fetch(
                    `${API_URL}/api/auth/me`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            first_name:
                                profileForm.first_name.trim(),

                            last_name:
                                profileForm.last_name.trim(),

                            //Email is currently read only
                            //but Backend requires it
                            email:
                                profileForm.email.trim(),

                            phone_number:
                                profileForm.phone_number.trim()
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getValidationMessage(
                        data
                    )
                );
            }


            //Update stored Customer
            updateStoredCustomer(
                data.user
            );


            //Keep form synchronized
            setProfileForm({
                first_name:
                    data.user.first_name || "",

                last_name:
                    data.user.last_name || "",

                phone_number:
                    data.user.phone_number || "",

                email:
                    data.user.email || ""
            });


            setProfileMessage({
                type: "success",
                text:
                    data.message ||
                    "Account information updated."
            });


        } catch (error) {

            setProfileMessage({
                type: "error",
                text:
                    error.message ||
                    "Unable to update account."
            });

        } finally {

            setIsSavingProfile(
                false
            );
        }
    }


    //Changes Customer password
    async function handlePasswordSubmit(event) {

        event.preventDefault();


        setPasswordMessage({
            type: "",
            text: ""
        });


        //Check all Password fields
        if (
            !passwordForm.current_password ||
            !passwordForm.new_password ||
            !passwordForm.confirm_password
        ) {

            setPasswordMessage({
                type: "error",
                text:
                    "Please complete all password fields."
            });

            return;
        }


        //Check matching Passwords
        if (
            passwordForm.new_password !==
            passwordForm.confirm_password
        ) {

            setPasswordMessage({
                type: "error",
                text:
                    "New passwords do not match."
            });

            return;
        }


        try {

            setIsChangingPassword(
                true
            );


            const token =
                getAuthToken();


            //Change authenticated Customer password
            const response =
                await fetch(
                    `${API_URL}/api/auth/me/password`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            current_password:
                                passwordForm.current_password,

                            new_password:
                                passwordForm.new_password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    getValidationMessage(
                        data
                    )
                );
            }


            //Clear Password form
            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });


            //Hide Password fields again
            setShowCurrentPassword(
                false
            );

            setShowNewPassword(
                false
            );

            setShowConfirmPassword(
                false
            );


            setPasswordMessage({
                type: "success",
                text:
                    data.message ||
                    "Password changed successfully."
            });


        } catch (error) {

            setPasswordMessage({
                type: "error",
                text:
                    error.message ||
                    "Unable to change password."
            });

        } finally {

            setIsChangingPassword(
                false
            );
        }
    }


    //Gets Customer initials
    function getCustomerInitials() {

        if (!customer) {
            return "C";
        }


        const firstInitial =
            customer.first_name
                ?.trim()
                .charAt(0) || "";


        const lastInitial =
            customer.last_name
                ?.trim()
                .charAt(0) || "";


        const initials =
            `${firstInitial}${lastInitial}`
                .toUpperCase();


        return initials || "C";
    }


    //Gets Customer full name
    function getCustomerName() {

        if (!customer) {
            return "Customer";
        }


        const fullName = [
            customer.first_name,
            customer.last_name
        ]
            .filter(Boolean)
            .join(" ");


        return (
            fullName ||
            "Customer"
        );
    }


    //Display loading state
    if (isLoading) {

        return (

            <div className="customer-account-loading d-flex align-items-center justify-content-center">

                Loading account...

            </div>
        );
    }


    //Do not display page without required data
    if (
        !bakery ||
        !customer
    ) {

        return (

            <div className="customer-account-loading d-flex align-items-center justify-content-center">

                Unable to load account.

            </div>
        );
    }


    return (

        <div
            className="customer-account-page"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar
                bakery={
                    bakery
                }
            />


            {/* Account Settings content */}
            <main className="customer-account-main">

                <div className="container-xxl px-3 py-4 py-md-5">

                    {/* Back to Store */}
                    <Link
                        to={`/${slug}`}
                        className="customer-account-back d-inline-flex align-items-center gap-2 text-decoration-none mb-4"
                    >

                        <ArrowLeft
                            size={16}
                        />

                        Back to Store

                    </Link>


                    <div className="row justify-content-center">

                        <div className="col-12 col-xl-10">

                            {/* Account heading */}
                            <div className="customer-account-heading mb-4">

                                <span className="customer-account-eyebrow">

                                    Your Account

                                </span>


                                <h1 className="mb-2">

                                    Account Settings

                                </h1>


                                <p className="mb-0">

                                    Manage your personal information and password.

                                </p>

                            </div>


                            <div className="row g-4">

                                {/* Customer profile */}
                                <div className="col-12 col-lg-4">

                                    <aside className="customer-account-summary">

                                        {/* Customer initials */}
                                        <div className="customer-account-avatar d-flex align-items-center justify-content-center">

                                            {
                                                getCustomerInitials()
                                            }

                                        </div>


                                        <h2 className="customer-account-customer-name">

                                            {
                                                getCustomerName()
                                            }

                                        </h2>


                                        <p className="customer-account-customer-email">

                                            {
                                                customer.email
                                            }

                                        </p>


                                        <span className="customer-account-badge">

                                            <UserRound
                                                size={13}
                                            />

                                            Customer Account

                                        </span>


                                        <div className="customer-account-summary-divider" />


                                        <p className="customer-account-summary-note mb-0">

                                            Your account information is used when placing orders with{" "}

                                            <strong>
                                                {bakery.name}
                                            </strong>.

                                        </p>

                                    </aside>

                                </div>


                                {/* Account forms */}
                                <div className="col-12 col-lg-8">

                                    <div className="d-grid gap-4">

                                        {/* Personal Information */}
                                        <section className="customer-account-card">

                                            <div className="customer-account-card-header">

                                                <div>

                                                    <h2>
                                                        Personal Information
                                                    </h2>

                                                    <p>
                                                        Update your name and contact information.
                                                    </p>

                                                </div>

                                            </div>


                                            <form
                                                onSubmit={
                                                    handleProfileSubmit
                                                }
                                            >

                                                <div className="row g-3">

                                                    {/* First Name */}
                                                    <div className="col-12 col-md-6">

                                                        <label
                                                            htmlFor="first_name"
                                                            className="form-label customer-account-label"
                                                        >
                                                            First Name
                                                        </label>

                                                        <input
                                                            id="first_name"
                                                            name="first_name"
                                                            type="text"
                                                            value={
                                                                profileForm.first_name
                                                            }
                                                            onChange={
                                                                handleProfileChange
                                                            }
                                                            className="form-control customer-account-input"
                                                            autoComplete="given-name"
                                                            required
                                                        />

                                                    </div>


                                                    {/* Last Name */}
                                                    <div className="col-12 col-md-6">

                                                        <label
                                                            htmlFor="last_name"
                                                            className="form-label customer-account-label"
                                                        >
                                                            Last Name
                                                        </label>

                                                        <input
                                                            id="last_name"
                                                            name="last_name"
                                                            type="text"
                                                            value={
                                                                profileForm.last_name
                                                            }
                                                            onChange={
                                                                handleProfileChange
                                                            }
                                                            className="form-control customer-account-input"
                                                            autoComplete="family-name"
                                                            required
                                                        />

                                                    </div>


                                                    {/* Phone Number */}
                                                    <div className="col-12">

                                                        <label
                                                            htmlFor="phone_number"
                                                            className="form-label customer-account-label"
                                                        >
                                                            Phone Number
                                                        </label>

                                                        <input
                                                            id="phone_number"
                                                            name="phone_number"
                                                            type="tel"
                                                            value={
                                                                profileForm.phone_number
                                                            }
                                                            onChange={
                                                                handleProfileChange
                                                            }
                                                            className="form-control customer-account-input"
                                                            placeholder="Enter your phone number"
                                                            autoComplete="tel"
                                                        />

                                                    </div>


                                                    {/* Email Address */}
                                                    <div className="col-12">

                                                        <label
                                                            htmlFor="email"
                                                            className="form-label customer-account-label"
                                                        >
                                                            Email Address
                                                        </label>

                                                        <input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={
                                                                profileForm.email
                                                            }
                                                            className="form-control customer-account-input customer-account-readonly"
                                                            readOnly
                                                        />

                                                        <small className="customer-account-help">

                                                            Email changes are not available here yet.

                                                        </small>

                                                    </div>

                                                </div>


                                                {/* Profile response */}
                                                {profileMessage.text && (

                                                    <div
                                                        className={
                                                            profileMessage.type ===
                                                                "success"
                                                                ? "customer-account-message customer-account-message-success mt-3"
                                                                : "customer-account-message customer-account-message-error mt-3"
                                                        }
                                                    >

                                                        {
                                                            profileMessage.text
                                                        }

                                                    </div>
                                                )}


                                                {/* Save Profile */}
                                                <div className="d-flex justify-content-end mt-4">

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            isSavingProfile
                                                        }
                                                        className="customer-account-primary-button d-inline-flex align-items-center justify-content-center gap-2"
                                                    >

                                                        <Save
                                                            size={16}
                                                        />

                                                        {
                                                            isSavingProfile
                                                                ? "Saving..."
                                                                : "Save Changes"
                                                        }

                                                    </button>

                                                </div>

                                            </form>

                                        </section>


                                        {/* Password */}
                                        <section className="customer-account-card">

                                            <div className="customer-account-card-header">

                                                <div>

                                                    <h2>
                                                        Password
                                                    </h2>

                                                    <p>
                                                        Use your current password to create a new one.
                                                    </p>

                                                </div>


                                                <div className="customer-account-section-icon d-none d-sm-flex align-items-center justify-content-center">

                                                    <KeyRound
                                                        size={18}
                                                    />

                                                </div>

                                            </div>


                                            <form
                                                onSubmit={
                                                    handlePasswordSubmit
                                                }
                                            >

                                                <div className="row g-3">

                                                    {/* Current Password */}
                                                    <div className="col-12">

                                                        <label
                                                            htmlFor="current_password"
                                                            className="form-label customer-account-label"
                                                        >
                                                            Current Password
                                                        </label>

                                                        <div className="customer-account-password-field">

                                                            <input
                                                                id="current_password"
                                                                name="current_password"
                                                                type={
                                                                    showCurrentPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                value={
                                                                    passwordForm.current_password
                                                                }
                                                                onChange={
                                                                    handlePasswordChange
                                                                }
                                                                className="form-control customer-account-input"
                                                                autoComplete="current-password"
                                                            />


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowCurrentPassword(
                                                                        (currentValue) =>
                                                                            !currentValue
                                                                    )
                                                                }
                                                                className="customer-account-password-toggle"
                                                                aria-label="Show or hide current password"
                                                            >

                                                                {showCurrentPassword ? (

                                                                    <EyeOff
                                                                        size={17}
                                                                    />

                                                                ) : (

                                                                    <Eye
                                                                        size={17}
                                                                    />
                                                                )}

                                                            </button>

                                                        </div>

                                                    </div>


                                                    {/* New Password */}
                                                    <div className="col-12 col-md-6">

                                                        <label
                                                            htmlFor="new_password"
                                                            className="form-label customer-account-label"
                                                        >
                                                            New Password
                                                        </label>

                                                        <div className="customer-account-password-field">

                                                            <input
                                                                id="new_password"
                                                                name="new_password"
                                                                type={
                                                                    showNewPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                value={
                                                                    passwordForm.new_password
                                                                }
                                                                onChange={
                                                                    handlePasswordChange
                                                                }
                                                                className="form-control customer-account-input"
                                                                autoComplete="new-password"
                                                            />


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowNewPassword(
                                                                        (currentValue) =>
                                                                            !currentValue
                                                                    )
                                                                }
                                                                className="customer-account-password-toggle"
                                                                aria-label="Show or hide new password"
                                                            >

                                                                {showNewPassword ? (

                                                                    <EyeOff
                                                                        size={17}
                                                                    />

                                                                ) : (

                                                                    <Eye
                                                                        size={17}
                                                                    />
                                                                )}

                                                            </button>

                                                        </div>

                                                    </div>


                                                    {/* Confirm New Password */}
                                                    <div className="col-12 col-md-6">

                                                        <label
                                                            htmlFor="confirm_password"
                                                            className="form-label customer-account-label"
                                                        >
                                                            Confirm New Password
                                                        </label>

                                                        <div className="customer-account-password-field">

                                                            <input
                                                                id="confirm_password"
                                                                name="confirm_password"
                                                                type={
                                                                    showConfirmPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                value={
                                                                    passwordForm.confirm_password
                                                                }
                                                                onChange={
                                                                    handlePasswordChange
                                                                }
                                                                className="form-control customer-account-input"
                                                                autoComplete="new-password"
                                                            />


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowConfirmPassword(
                                                                        (currentValue) =>
                                                                            !currentValue
                                                                    )
                                                                }
                                                                className="customer-account-password-toggle"
                                                                aria-label="Show or hide confirmed password"
                                                            >

                                                                {showConfirmPassword ? (

                                                                    <EyeOff
                                                                        size={17}
                                                                    />

                                                                ) : (

                                                                    <Eye
                                                                        size={17}
                                                                    />
                                                                )}

                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>


                                                <small className="customer-account-help d-block mt-2">

                                                    Password must be at least 8 characters and include uppercase, lowercase and a number.

                                                </small>


                                                {/* Password response */}
                                                {passwordMessage.text && (

                                                    <div
                                                        className={
                                                            passwordMessage.type ===
                                                                "success"
                                                                ? "customer-account-message customer-account-message-success mt-3"
                                                                : "customer-account-message customer-account-message-error mt-3"
                                                        }
                                                    >

                                                        {
                                                            passwordMessage.text
                                                        }

                                                    </div>
                                                )}


                                                {/* Change Password */}
                                                <div className="d-flex justify-content-end mt-4">

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            isChangingPassword
                                                        }
                                                        className="customer-account-secondary-button d-inline-flex align-items-center justify-content-center gap-2"
                                                    >

                                                        <KeyRound
                                                            size={16}
                                                        />

                                                        {
                                                            isChangingPassword
                                                                ? "Changing..."
                                                                : "Change Password"
                                                        }

                                                    </button>

                                                </div>

                                            </form>

                                        </section>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter
                bakery={
                    bakery
                }
            />

        </div>
    );
}