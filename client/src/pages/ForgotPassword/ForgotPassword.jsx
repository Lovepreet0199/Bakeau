//Import React state
import { useState } from "react";

//Import React Router tools
import {
    Link,
    useNavigate
} from "react-router-dom";

//Import Forgot Password styles
import "./ForgotPassword.css";


//Displays the Forgot Password page
export default function ForgotPassword() {

    //Used to return to previous page
    const navigate =
        useNavigate();

    //Stores Customer or Bakery Owner email
    const [
        email,
        setEmail
    ] = useState("");

    //Stores page message
    const [
        message,
        setMessage
    ] = useState("");

    //Stores request error
    const [
        error,
        setError
    ] = useState("");

    //Tracks request loading
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);


    //Returns user to previous page
    function handleBack() {

        if (
            window.history.length >
            1
        ) {

            navigate(-1);

        } else {

            navigate("/");
        }
    }


    //Requests password reset email
    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        setError("");
        setMessage("");
        setIsSubmitting(true);


        try {

            //Send email to Forgot Password API
            const response =
                await fetch(
                    "http://localhost:3000/api/auth/forgot-password",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email:
                                    email.trim()
                            })
                    }
                );


            const data =
                await response.json();


            //Stop if request failed
            if (!response.ok) {

                throw new Error(
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to request password reset"
                );
            }


            //Show generic success message
            setMessage(
                data.message
            );


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

        <main className="forgot-password-page min-vh-100">

            <div className="container-fluid p-0 min-vh-100">

                <div className="row g-0 min-vh-100">


                    {/* Bakery Image */}
                    <section className="d-none d-lg-block col-lg-5 forgot-password-image-panel">

                        <div className="forgot-password-image-overlay" />


                        <div className="forgot-password-image-content d-flex flex-column justify-content-end h-100">

                            <Link
                                to="/"
                                className="forgot-password-brand d-inline-flex align-items-center gap-2 mb-4 text-decoration-none"
                            >

                                <span className="forgot-password-brand-icon d-flex align-items-center justify-content-center">

                                    🍰

                                </span>

                                <span>
                                    Bakeau
                                </span>

                            </Link>


                            <h2 className="forgot-password-image-title mb-3">

                                Get back to
                                <br />
                                your bakery.

                            </h2>


                            <p className="forgot-password-image-description mb-0">

                                Reset your password securely and continue managing your Bakeau account.

                            </p>

                        </div>

                    </section>


                    {/* Forgot Password Form */}
                    <section className="col-12 col-lg-7 forgot-password-form-panel">

                        <div className="d-flex align-items-center justify-content-center h-100 px-4 px-md-5">

                            <div className="forgot-password-form-content w-100">


                                {/* Top Navigation */}
                                <div className="d-flex align-items-center justify-content-between mb-5">

                                    <button
                                        type="button"
                                        className="forgot-password-back-button"
                                        onClick={
                                            handleBack
                                        }
                                    >
                                        ← Back
                                    </button>


                                    <Link
                                        to="/"
                                        className="forgot-password-mobile-brand d-inline-flex d-lg-none align-items-center gap-2 text-decoration-none"
                                    >

                                        <span className="forgot-password-brand-icon d-flex align-items-center justify-content-center">

                                            🍰

                                        </span>

                                        <span>
                                            Bakeau
                                        </span>

                                    </Link>

                                </div>


                                {/* Heading */}
                                <div className="mb-4">

                                    <h1 className="forgot-password-title mb-2">

                                        Forgot your password?

                                    </h1>

                                    <p className="forgot-password-subtitle mb-0">

                                        Enter your email and we'll send you a secure password reset link.

                                    </p>

                                </div>


                                {/* Forgot Password Form */}
                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    <div className="mb-4">

                                        <label
                                            htmlFor="forgotPasswordEmail"
                                            className="forgot-password-label d-block mb-2"
                                        >
                                            Email address
                                        </label>


                                        <input
                                            id="forgotPasswordEmail"
                                            type="email"
                                            className="form-control forgot-password-input"
                                            placeholder="you@example.com"
                                            value={
                                                email
                                            }
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="email"
                                            required
                                        />

                                    </div>


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


                                    <button
                                        type="submit"
                                        className="forgot-password-submit-button w-100"
                                        disabled={
                                            isSubmitting
                                        }
                                    >

                                        {
                                            isSubmitting
                                                ? "Sending..."
                                                : "Send Reset Link"
                                        }

                                    </button>

                                </form>


                                <p className="forgot-password-signin text-center mt-4 mb-0">

                                    Remember your password?{" "}

                                    <button
                                        type="button"
                                        className="forgot-password-signin-link"
                                        onClick={
                                            handleBack
                                        }
                                    >
                                        Sign in
                                    </button>

                                </p>

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}