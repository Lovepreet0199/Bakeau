import API_URL from "../../config/api.js";
//Import React state
import { useState } from "react";

//Import React Router tools
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

//Import Reset Password styles
import "./ResetPassword.css";


//Displays the Reset Password page
export default function ResetPassword() {

    //Tracks whether the new password is visible
    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    //Tracks whether the confirmation password is visible
    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);

    //Reads values from the URL
    const [
        searchParams
    ] = useSearchParams();

    //Used to navigate after reset
    const navigate =
        useNavigate();


    //Get password reset token from URL
    const token =
        searchParams.get("token");


    //Stores new password
    const [
        password,
        setPassword
    ] = useState("");

    //Stores confirmation password
    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");

    //Stores page error
    const [
        error,
        setError
    ] = useState("");

    //Stores success message
    const [
        message,
        setMessage
    ] = useState("");

    //Tracks password reset request
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);


    //Gets the correct Login page
    function getLoginPath() {

        const bakerySlug =
            localStorage.getItem(
                "authBakerySlug"
            );


        //Return Customer to Storefront Login
        if (bakerySlug) {

            return `/store/${bakerySlug}/login`;
        }


        //Default to Bakery Owner Login
        return "/login";
    }


    //Submits the new password
    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        setError("");
        setMessage("");


        //Make sure reset token exists
        if (!token) {

            setError(
                "Password reset link is invalid."
            );

            return;
        }


        //Make sure passwords match
        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        //Use Bakeau password requirements
        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;


        if (
            !passwordPattern.test(
                password
            )
        ) {

            setError(
                "Password must be at least 8 characters and include uppercase, lowercase, and a number."
            );

            return;
        }


        setIsSubmitting(
            true
        );


        try {

            //Send new password and reset token
            const response =
                await fetch(
                    `${API_URL}/api/auth/reset-password`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                token:
                                    token,

                                password:
                                    password
                            })
                    }
                );


            const data =
                await response.json();


            //Stop if reset failed
            if (!response.ok) {

                throw new Error(
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to reset password"
                );
            }


            //Show successful reset
            setMessage(
                "Your password has been reset successfully."
            );


            //Clear password inputs
            setPassword("");
            setConfirmPassword("");


        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setIsSubmitting(
                false
            );
        }
    }


    return (

        <main className="reset-password-page min-vh-100">

            <div className="container-fluid p-0 min-vh-100">

                <div className="row g-0 min-vh-100">


                    {/* Bakery Image */}
                    <section className="d-none d-lg-block col-lg-5 reset-password-image-panel">

                        <div className="reset-password-image-overlay" />


                        <div className="reset-password-image-content d-flex flex-column justify-content-end h-100">

                            <Link
                                to="/"
                                className="reset-password-brand d-inline-flex align-items-center gap-2 mb-4 text-decoration-none"
                            >

                                <span className="reset-password-brand-icon d-flex align-items-center justify-content-center">
                                    🍰
                                </span>

                                <span>
                                    Bakeau
                                </span>

                            </Link>


                            <h2 className="reset-password-image-title mb-3">

                                Create a new
                                <br />
                                password.

                            </h2>


                            <p className="reset-password-image-description mb-0">

                                Choose a secure password to protect your Bakeau account.

                            </p>

                        </div>

                    </section>


                    {/* Reset Password Form */}
                    <section className="col-12 col-lg-7 reset-password-form-panel">

                        <div className="d-flex align-items-center justify-content-center h-100 px-4 px-md-5">

                            <div className="reset-password-form-content w-100">


                                {/* Mobile Brand */}
                                <Link
                                    to="/"
                                    className="reset-password-mobile-brand d-inline-flex d-lg-none align-items-center gap-2 mb-5 text-decoration-none"
                                >

                                    <span className="reset-password-brand-icon d-flex align-items-center justify-content-center">
                                        🍰
                                    </span>

                                    <span>
                                        Bakeau
                                    </span>

                                </Link>


                                {/* Heading */}
                                <div className="mb-4">

                                    <h1 className="reset-password-title mb-2">

                                        Reset your password

                                    </h1>


                                    <p className="reset-password-subtitle mb-0">

                                        Enter a new password for your Bakeau account.

                                    </p>

                                </div>


                                {/* Invalid Token */}
                                {!token ? (

                                    <div className="alert alert-danger">

                                        This password reset link is invalid.

                                    </div>

                                ) : (

                                    <form
                                        onSubmit={
                                            handleSubmit
                                        }
                                    >

                                        {/* New Password */}
                                        <div className="mb-3">

                                            <label
                                                htmlFor="newPassword"
                                                className="reset-password-label d-block mb-2"
                                            >
                                                New password
                                            </label>

                                            <div className="reset-password-input-wrapper">

                                                <input
                                                    id="newPassword"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="form-control reset-password-input"
                                                    value={password}
                                                    onChange={(event) =>
                                                        setPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="new-password"
                                                    required
                                                />

                                                {/* Show or hide password */}
                                                <button
                                                    type="button"
                                                    className="reset-password-toggle"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                >

                                                    {/* Eye icon */}
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                    </svg>

                                                </button>

                                            </div>

                                        </div>

                                        {/* Confirm Password */}
                                        <div className="mb-2">

                                            <label
                                                htmlFor="confirmPassword"
                                                className="reset-password-label d-block mb-2"
                                            >
                                                Confirm new password
                                            </label>

                                            <div className="reset-password-input-wrapper">

                                                <input
                                                    id="confirmPassword"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="form-control reset-password-input"
                                                    value={confirmPassword}
                                                    onChange={(event) =>
                                                        setConfirmPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="new-password"
                                                    required
                                                />

                                                {/* Show or hide confirmation password */}
                                                <button
                                                    type="button"
                                                    className="reset-password-toggle"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Hide confirmation password"
                                                            : "Show confirmation password"
                                                    }
                                                >

                                                    {/* Eye icon */}
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                    </svg>

                                                </button>

                                            </div>

                                        </div>


                                        {/* Password Requirements */}
                                        <p className="reset-password-helper mb-4">

                                            At least 8 characters with uppercase, lowercase, and a number.

                                        </p>


                                        {/* Error */}
                                        {error && (

                                            <div
                                                className="alert alert-danger"
                                                role="alert"
                                            >
                                                {error}
                                            </div>

                                        )}


                                        {/* Success */}
                                        {message && (

                                            <div
                                                className="alert alert-success"
                                                role="alert"
                                            >
                                                {message}
                                            </div>

                                        )}


                                        {/* Reset Button */}
                                        {!message && (

                                            <button
                                                type="submit"
                                                className="reset-password-submit-button w-100"
                                                disabled={
                                                    isSubmitting
                                                }
                                            >

                                                {
                                                    isSubmitting
                                                        ? "Resetting..."
                                                        : "Reset Password"
                                                }

                                            </button>

                                        )}


                                        {/* Return to Login */}
                                        {message && (

                                            <button
                                                type="button"
                                                className="reset-password-submit-button w-100"
                                                onClick={() =>
                                                    navigate(
                                                        getLoginPath()
                                                    )
                                                }
                                            >

                                                Return to Sign In

                                            </button>

                                        )}

                                    </form>

                                )}

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}