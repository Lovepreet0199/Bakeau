import API_URL from "../../config/api.js";
//Import useState to manage the resend email status
import { useState } from "react";

//Allows this page to receive information passed from the registration page
import { Link, useLocation } from "react-router-dom";

//Import the page styles
import "./CheckEmail.css";

//Displays instructions after the user creates their Bakeau account
export default function CheckEmail() {

    //Gets the information passed to this page during navigation
    const location = useLocation();

    //Gets the Bakery Storefront the Customer came from
    const bakerySlug =
        localStorage.getItem(
            "authBakerySlug"
        );

    //Gets where the Customer should return after Login
    const returnTo =
        localStorage.getItem(
            "authReturnTo"
        );

    //Creates the correct Login path
    const signInPath =
        bakerySlug
            ? `/store/${bakerySlug}/login${returnTo
                ? `?redirect=${encodeURIComponent(
                    returnTo
                )}`
                : ""
            }`
            : "/login";

    //Gets the email from navigation state, or from session storage after a page refresh
    const email =
        location.state?.email ||
        sessionStorage.getItem("pendingVerificationEmail");

    //Tracks whether a new verification email is currently being sent
    const [isResending, setIsResending] = useState(false);

    //Stores a success or error message after trying to resend the email
    const [resendMessage, setResendMessage] = useState("");

    //Sends a new verification email to the registered email address
    async function handleResendEmail() {

        //Stop if the email address is not available
        if (!email) {
            setResendMessage("Email address is unavailable. Please register again.");
            return;
        }

        //Show the loading state while the verification email is being sent
        setIsResending(true);

        //Clear any old message before making a new request
        setResendMessage("");

        try {

            //Send the email address to the resend verification API
            const response = await fetch(
                `${API_URL}/api/auth/resend-verification`,
                {
                    method: "POST",

                    //Tell the backend that the request body will contain JSON
                    headers: {
                        "Content-Type": "application/json"
                    },

                    //Convert the email data into JSON and send it in the request body
                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            //Convert the JSON response from the backend into a JavaScript object
            const data = await response.json();

            //Stop if the backend could not resend the verification email
            if (!response.ok) {
                setResendMessage(data.message || "Unable to resend verification email.");
                return;
            }

            //Show the success message returned by the backend
            setResendMessage(data.message);

        } catch (error) {

            //Show an error if React could not connect to the backend
            setResendMessage("Unable to connect to Bakeau. Please try again.");

            //Log the actual error in the console for debugging
            console.error("Resend verification error:", error);

        } finally {
            //Stop the loading state after the resend request finishes
            setIsResending(false);
        }

    }

    return (
        <main className="check-email-page min-vh-100">

            {/* Simple header keeps the user focused on email verification */}
            <header className="py-4">
                <div className="container-fluid px-4 px-md-5">
                    <div className="d-flex align-items-center justify-content-between">

                        <a href="/" className="check-email-logo">
                            Bakeau
                        </a>

                        <Link
                            to={signInPath}
                            className="check-email-signin"
                        >
                            Sign in →
                        </Link>

                    </div>
                </div>
            </header>

            {/* Main email verification content */}
            <section
                className="container py-4 py-md-5"
                aria-labelledby="check-email-title"
            >
                <div className="row justify-content-center">
                    <div className="col-12 col-md-9 col-lg-7 col-xl-6">

                        {/* Main verification card */}
                        <div className="check-email-card text-center p-4 p-md-5">

                            {/* Email illustration shown at the top of the card */}
                            <div
                                className="check-email-icon d-flex align-items-center justify-content-center mx-auto mb-4"
                                aria-hidden="true"
                            >
                                ✉
                            </div>

                            <h1
                                id="check-email-title"
                                className="mb-3"
                            >
                                Check your email
                            </h1>

                            <p className="check-email-subtitle mb-3">
                                We've sent a verification link to
                            </p>

                            {/* Displays the email address where the verification link was sent */}
                            <div
                                className="check-email-address d-flex align-items-center justify-content-center gap-2 mx-auto mb-4"
                            >
                                <span aria-hidden="true">✉</span>
                                <span>{email}</span>
                            </div>

                            <p className="check-email-instructions mx-auto mb-4">
                                Please check your inbox and click the verification
                                link to activate your Bakeau account. It may take
                                a few minutes to arrive.
                            </p>

                            {/* Helps users who cannot find the verification email */}
                            <div
                                className="check-email-help d-flex gap-3 mx-auto mb-4 text-start"
                            >
                                <span
                                    className="check-email-help-icon d-flex align-items-center justify-content-center flex-shrink-0"
                                    aria-hidden="true"
                                >
                                    i
                                </span>

                                <div>
                                    <strong className="d-block mb-1">
                                        Don't see the email?
                                    </strong>

                                    <p className="mb-0">
                                        Check your spam or junk folder. The email
                                        may have been filtered there.
                                    </p>
                                </div>
                            </div>

                            {/* Allows the user to request a new verification email */}
                            <button
                                type="button"
                                className="check-email-resend-btn d-flex align-items-center justify-content-center gap-2 w-100 mx-auto mb-3"
                                //Run the resend function when the user clicks the button
                                onClick={handleResendEmail}
                                disabled={isResending}
                            >
                                <span aria-hidden="true">↻</span>
                                {isResending ? "Sending..." : "Resend verification email"}
                            </button>

                            {/* Shows the result of the resend verification request */}
                            {resendMessage && (
                                <p
                                    className="check-email-message mb-3"
                                    aria-live="polite"
                                >
                                    {resendMessage}
                                </p>
                            )}

                            {/* Gives the user another way to get help */}
                            <p className="check-email-support mb-0">
                                Still having trouble?{" "}
                                <a href="mailto:support@bakeau.ca">
                                    Contact support
                                </a>
                            </p>

                            {/* Separates the main actions from the back link */}
                            <hr className="check-email-divider mx-auto my-4" />

                            {/* Returns the user to the login page */}
                            <Link
                                to={signInPath}
                                className="check-email-back d-inline-flex align-items-center gap-2"
                            >
                                <span aria-hidden="true">←</span>
                                Back to sign in
                            </Link>

                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}