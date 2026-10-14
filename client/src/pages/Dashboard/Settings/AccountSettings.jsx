import API_URL from "../../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import Account Settings icons
import {
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Save,
    UserRound
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";


//Displays and updates the Bakery Owner's account
export default function AccountSettings() {

    //Stores editable account information
    const [
        accountData,
        setAccountData
    ] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: ""
    });

    //Stores password form information
    const [
        passwordData,
        setPasswordData
    ] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    //Tracks whether account information is loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    //Tracks whether account information is saving
    const [
        isSavingAccount,
        setIsSavingAccount
    ] = useState(false);

    //Tracks whether the password is changing
    const [
        isChangingPassword,
        setIsChangingPassword
    ] = useState(false);

    //Tracks current password visibility
    const [
        showCurrentPassword,
        setShowCurrentPassword
    ] = useState(false);

    //Tracks new password visibility
    const [
        showNewPassword,
        setShowNewPassword
    ] = useState(false);

    //Tracks confirmation password visibility
    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);

    //Stores account loading or saving errors
    const [
        accountError,
        setAccountError
    ] = useState("");

    //Stores account success message
    const [
        accountSuccess,
        setAccountSuccess
    ] = useState("");

    //Stores password errors
    const [
        passwordError,
        setPasswordError
    ] = useState("");

    //Stores password success message
    const [
        passwordSuccess,
        setPasswordSuccess
    ] = useState("");


    //Loads the authenticated Bakery Owner's account
    useEffect(() => {

        //Prevents state updates after the component closes
        let isCancelled = false;


        //Gets the current user account
        async function loadAccount() {

            try {

                //Get the authentication token
                const token =
                    getAuthToken();


                //Get the authenticated user's account
                const response = await fetch(
                    `${API_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                //Convert the backend response into JavaScript
                const data =
                    await response.json();


                //Stop if the account could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load account information"
                    );
                }


                //Get the user returned by the backend
                const user =
                    data.user || data;


                //Store the user's account information
                if (!isCancelled) {

                    setAccountData({
                        first_name:
                            user.first_name || "",

                        last_name:
                            user.last_name || "",

                        email:
                            user.email || "",

                        phone_number:
                            user.phone_number || ""
                    });


                    //Clear previous account errors
                    setAccountError("");
                }


            } catch (error) {

                //Display the account loading error
                if (!isCancelled) {
                    setAccountError(error.message);
                }

            } finally {

                //Stop the account loading state
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }


        //Load the account
        loadAccount();


        //Stop state updates when the component closes
        return () => {
            isCancelled = true;
        };

    }, []);


    //Updates an account information field
    function handleAccountChange(event) {

        //Get the changed field information
        const {
            name,
            value
        } = event.target;


        //Update the matching account field
        setAccountData((currentData) => ({
            ...currentData,
            [name]: value
        }));


        //Clear previous messages
        setAccountError("");
        setAccountSuccess("");
    }


    //Updates a password field
    function handlePasswordChange(event) {

        //Get the changed field information
        const {
            name,
            value
        } = event.target;


        //Update the matching password field
        setPasswordData((currentData) => ({
            ...currentData,
            [name]: value
        }));


        //Clear previous messages
        setPasswordError("");
        setPasswordSuccess("");
    }


    //Saves Bakery Owner account information
    async function saveAccountSettings(event) {

        //Stop the browser from refreshing
        event.preventDefault();


        //Clear previous messages
        setAccountError("");
        setAccountSuccess("");


        //Validate required account fields
        if (
            !accountData.first_name.trim() ||
            !accountData.last_name.trim() ||
            !accountData.email.trim()
        ) {

            setAccountError(
                "First name, last name and email are required."
            );

            return;
        }


        //Start the account save state
        setIsSavingAccount(true);


        try {

            //Get the authentication token
            const token =
                getAuthToken();


            //Create the updated account information
            const updatedAccountData = {

                first_name:
                    accountData.first_name.trim(),

                last_name:
                    accountData.last_name.trim(),

                email:
                    accountData.email.trim(),

                phone_number:
                    accountData.phone_number.trim()
            };


            //Update the authenticated user's account
            const response = await fetch(
                `${API_URL}/api/auth/me`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        updatedAccountData
                    )
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if the account could not be updated
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update account information"
                );
            }


            //Get the updated user
            const updatedUser =
                data.user || data;


            //Refresh the account form
            setAccountData({
                first_name:
                    updatedUser.first_name || "",

                last_name:
                    updatedUser.last_name || "",

                email:
                    updatedUser.email || "",

                phone_number:
                    updatedUser.phone_number || ""
            });


            //Display the backend success message
            setAccountSuccess(
                data.message ||
                "Account information saved successfully."
            );


        } catch (error) {

            //Display the account update error
            setAccountError(error.message);

        } finally {

            //Stop the account save state
            setIsSavingAccount(false);
        }
    }


    //Changes the Bakery Owner's password
    async function changePassword(event) {

        //Stop the browser from refreshing
        event.preventDefault();


        //Clear previous messages
        setPasswordError("");
        setPasswordSuccess("");


        //Validate all password fields
        if (
            !passwordData.current_password ||
            !passwordData.new_password ||
            !passwordData.confirm_password
        ) {

            setPasswordError(
                "Please complete all password fields."
            );

            return;
        }


        //Validate new password length
        if (
            passwordData.new_password.length < 8
        ) {

            setPasswordError(
                "New password must be at least 8 characters long."
            );

            return;
        }


        //Make sure both new passwords match
        if (
            passwordData.new_password !==
            passwordData.confirm_password
        ) {

            setPasswordError(
                "New passwords do not match."
            );

            return;
        }


        //Start the password change state
        setIsChangingPassword(true);


        try {

            //Get the authentication token
            const token =
                getAuthToken();


            //Create the password update
            const updatedPasswordData = {

                current_password:
                    passwordData.current_password,

                new_password:
                    passwordData.new_password
            };


            //Change the authenticated user's password
            const response = await fetch(
                `${API_URL}/api/auth/me/password`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        updatedPasswordData
                    )
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if the password could not be changed
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to change password"
                );
            }


            //Clear all password fields
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });


            //Hide all passwords again
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);


            //Display successful password change
            setPasswordSuccess(
                data.message ||
                "Password changed successfully."
            );


        } catch (error) {

            //Display the password change error
            setPasswordError(error.message);

        } finally {

            //Stop the password change state
            setIsChangingPassword(false);
        }
    }


    //Displays the Account Settings loading state
    if (isLoading) {

        return (
            <div className="bakery-settings-card">

                <div className="bakery-settings-account-loading">

                    <LoaderCircle
                        size={24}
                        strokeWidth={1.8}
                        className="bakery-settings-spinner"
                    />

                    <div>

                        <strong>
                            Loading account
                        </strong>

                        <span>
                            Getting your account information...
                        </span>

                    </div>

                </div>

            </div>
        );
    }


    return (
        <div className="bakery-settings-card">

            {/* Account information form */}
            <form onSubmit={saveAccountSettings}>

                {/* Account heading */}
                <div className="bakery-settings-section-heading">

                    <h2>
                        Account information
                    </h2>

                    <p>
                        Manage the personal information
                        connected to your Bakeau account.
                    </p>

                </div>


                {/* Account error */}
                {accountError && (

                    <div className="bakery-settings-error">
                        {accountError}
                    </div>

                )}


                {/* Account success */}
                {accountSuccess && (

                    <div className="bakery-settings-success">
                        {accountSuccess}
                    </div>

                )}


                {/* Account information */}
                <div className="row g-3">

                    {/* First name */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="first_name"
                            className="form-label"
                        >
                            First name
                        </label>

                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            className="form-control"
                            value={accountData.first_name}
                            onChange={handleAccountChange}
                            required
                        />

                    </div>


                    {/* Last name */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="last_name"
                            className="form-label"
                        >
                            Last name
                        </label>

                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            className="form-control"
                            value={accountData.last_name}
                            onChange={handleAccountChange}
                            required
                        />

                    </div>


                    {/* Email */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="email"
                            className="form-label"
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={accountData.email}
                            onChange={handleAccountChange}
                            required
                        />

                    </div>


                    {/* Phone number */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="phone_number"
                            className="form-label"
                        >
                            Phone number
                        </label>

                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            className="form-control"
                            placeholder="Optional"
                            value={accountData.phone_number}
                            onChange={handleAccountChange}
                        />

                    </div>

                </div>


                {/* Account save button */}
                <div className="bakery-settings-account-actions">

                    <button
                        type="submit"
                        className="bakery-settings-save-button"
                        disabled={isSavingAccount}
                    >

                        {isSavingAccount ? (

                            <LoaderCircle
                                size={16}
                                strokeWidth={1.8}
                                className="bakery-settings-spinner"
                            />

                        ) : (

                            <Save
                                size={16}
                                strokeWidth={1.8}
                            />

                        )}


                        {isSavingAccount
                            ? "Saving..."
                            : "Save changes"
                        }

                    </button>

                </div>

            </form>


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Change password form */}
            <form onSubmit={changePassword}>

                {/* Password heading */}
                <div className="bakery-settings-account-section-heading">

                    <div className="bakery-settings-account-section-icon">

                        <LockKeyhole
                            size={18}
                            strokeWidth={1.8}
                        />

                    </div>


                    <div>

                        <h2>
                            Change password
                        </h2>

                        <p>
                            Update the password used to
                            access your Bakeau account.
                        </p>

                    </div>

                </div>


                {/* Password error */}
                {passwordError && (

                    <div className="bakery-settings-error">
                        {passwordError}
                    </div>

                )}


                {/* Password success */}
                {passwordSuccess && (

                    <div className="bakery-settings-success">
                        {passwordSuccess}
                    </div>

                )}


                {/* Current password */}
                <div className="mb-3">

                    <label
                        htmlFor="current_password"
                        className="form-label"
                    >
                        Current password
                    </label>


                    <div className="bakery-settings-password-field">

                        <input
                            type={
                                showCurrentPassword
                                    ? "text"
                                    : "password"
                            }
                            id="current_password"
                            name="current_password"
                            className="form-control"
                            value={
                                passwordData.current_password
                            }
                            onChange={handlePasswordChange}
                            autoComplete="current-password"
                            required
                        />


                        {/* Current password visibility */}
                        <button
                            type="button"
                            aria-label={
                                showCurrentPassword
                                    ? "Hide current password"
                                    : "Show current password"
                            }
                            onClick={() =>
                                setShowCurrentPassword(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                        >

                            {showCurrentPassword ? (

                                <EyeOff
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            ) : (

                                <Eye
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            )}

                        </button>

                    </div>

                </div>


                {/* New password */}
                <div className="mb-3">

                    <label
                        htmlFor="new_password"
                        className="form-label"
                    >
                        New password
                    </label>


                    <div className="bakery-settings-password-field">

                        <input
                            type={
                                showNewPassword
                                    ? "text"
                                    : "password"
                            }
                            id="new_password"
                            name="new_password"
                            className="form-control"
                            placeholder="At least 8 characters"
                            value={
                                passwordData.new_password
                            }
                            onChange={handlePasswordChange}
                            autoComplete="new-password"
                            required
                        />


                        {/* New password visibility */}
                        <button
                            type="button"
                            aria-label={
                                showNewPassword
                                    ? "Hide new password"
                                    : "Show new password"
                            }
                            onClick={() =>
                                setShowNewPassword(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                        >

                            {showNewPassword ? (

                                <EyeOff
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            ) : (

                                <Eye
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            )}

                        </button>

                    </div>


                    <p className="bakery-settings-field-help bakery-settings-field-help-bottom">
                        Use at least 8 characters with
                        uppercase, lowercase and a number.
                    </p>

                </div>


                {/* Confirm new password */}
                <div>

                    <label
                        htmlFor="confirm_password"
                        className="form-label"
                    >
                        Confirm new password
                    </label>


                    <div className="bakery-settings-password-field">

                        <input
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            id="confirm_password"
                            name="confirm_password"
                            className="form-control"
                            value={
                                passwordData.confirm_password
                            }
                            onChange={handlePasswordChange}
                            autoComplete="new-password"
                            required
                        />


                        {/* Confirmation password visibility */}
                        <button
                            type="button"
                            aria-label={
                                showConfirmPassword
                                    ? "Hide confirmation password"
                                    : "Show confirmation password"
                            }
                            onClick={() =>
                                setShowConfirmPassword(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                        >

                            {showConfirmPassword ? (

                                <EyeOff
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            ) : (

                                <Eye
                                    size={17}
                                    strokeWidth={1.8}
                                />

                            )}

                        </button>

                    </div>

                </div>


                {/* Password change button */}
                <div className="bakery-settings-account-actions">

                    <button
                        type="submit"
                        className="bakery-settings-save-button"
                        disabled={isChangingPassword}
                    >

                        {isChangingPassword ? (

                            <LoaderCircle
                                size={16}
                                strokeWidth={1.8}
                                className="bakery-settings-spinner"
                            />

                        ) : (

                            <LockKeyhole
                                size={16}
                                strokeWidth={1.8}
                            />

                        )}


                        {isChangingPassword
                            ? "Changing..."
                            : "Change password"
                        }

                    </button>

                </div>

            </form>


            {/* Account information note */}
            <div className="bakery-settings-account-note">

                <UserRound
                    size={17}
                    strokeWidth={1.8}
                />

                <p>
                    These details belong to your personal
                    Bakeau account. Bakery information is
                    managed from the General tab.
                </p>

            </div>

        </div>
    );
}