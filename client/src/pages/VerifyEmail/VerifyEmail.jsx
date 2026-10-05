//Allows the page to read URL parameters and navigate using internal links
import { Link, useSearchParams } from "react-router-dom";

//Allows the page to manage state, track verification, and run verification when the page loads
import { useEffect, useRef, useState } from "react";

//Import the email verification page styles
import "./VerifyEmail.css";

//Verifies the user's email address when they open the verification link
export default function VerifyEmail() {

    //Get access to the query parameters in the current URL
    const [searchParam] = useSearchParams();

    //Get the email verification token from the URL
    const token = searchParam.get("token");

    //Start with an error if the URL has no token, otherwise begin verification
    const [verificationStatus, setVerificationStatus] = useState(
        token ? "verifying" : "error"
    );

    //Show a missing token message immediately when the URL has no verification token
    const [verificationMessage, setVerificationMessage] = useState(
        token ? "" : "Verification token is missing."
    );

    //Keep track of whether the verification request has already started
    const hasVerified = useRef(false);

    //Run the email verification process when the verification page loads
    useEffect(() => {

        //Stop if the verification request has already started
        if (hasVerified.current) {
            return;
        }

        //Stop verification if there is no token in the URL
        if (!token) {
            return;
        }

        //Mark the verification request as started
        hasVerified.current = true;

        //Send the verification token to the backend
        async function verifyEmail() {

            //Try to verify the email and handle any connection errors
            try {

                //Send the verification token to the backend
                const response = await fetch(
                    "http://localhost:3000/api/auth/verify-email",
                    {
                        method: "POST",

                        //Tell the backend that the request body contains JSON
                        headers: {
                            "Content-Type": "application/json"
                        },

                        //Convert the verification token into JSON
                        body: JSON.stringify({
                            token: token
                        })
                    }
                );

                //Convert the backend JSON response into a JavaScript object
                const data = await response.json();

                //Stop if the verification token is invalid or has expired
                if (!response.ok) {
                    setVerificationStatus("error");
                    setVerificationMessage(
                        data.message || "Unable to verify your email."
                    );
                    return;
                }

                //Remove the temporary email because verification is complete
                sessionStorage.removeItem("pendingVerificationEmail");

                //Update the page when the email is verified successfully
                setVerificationStatus("success");

                //Show the success message returned by the backend
                setVerificationMessage(data.message);

            } catch (error) {

                //Show an error if React could not connect to the backend
                setVerificationStatus("error");

                //Show a helpful message to the user
                setVerificationMessage(
                    "Unable to connect to Bakeau. Please try again."
                );

                //Log the actual error in the console for debugging
                console.error("Email verification error:", error);
            }
        }

        //Start the email verification request
        verifyEmail();

    }, [token]);

    return (
        //Main content of the email verification page
        <main className="verify-email-page min-vh-100">

            {/* Simple Bakeau header */}
            <header className="verify-email-header py-4">
                <div className="container-fluid px-4 px-md-5 d-flex justify-content-between align-items-center">

                    {/* Bakeau logo */}
                    <Link
                        to="/"
                        className="verify-email-logo text-decoration-none"
                    >
                        Bakeau
                    </Link>

                    {/* Sign in link */}
                    <Link
                        to="/login"
                        className="verify-email-signin text-decoration-none"
                    >
                        Sign in <span aria-hidden="true">→</span>
                    </Link>

                </div>
            </header>

            {/* Main verification content */}
            <section
                className="verify-email-section container"
                aria-labelledby="verification-heading"
            >
                <div className="row justify-content-center">
                    <div className="col-12 col-md-9 col-lg-7 col-xl-6">

                        <div className="verify-email-content">

                            {/* Small section label */}
                            <p className="verify-email-label mb-3">
                                Email verification
                            </p>

                            {/* Shows while Bakeau checks the verification token */}
                            {verificationStatus === "verifying" && (
                                <div
                                    className="verify-email-status"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {/* Small loading indicator */}
                                    <div
                                        className="verify-email-loader mb-4"
                                        aria-hidden="true"
                                    ></div>

                                    <h1 id="verification-heading">
                                        Verifying your email
                                    </h1>

                                    <p className="verify-email-description mb-0">
                                        This should only take a moment. We're confirming
                                        your email address with Bakeau.
                                    </p>
                                </div>
                            )}

                            {/* Shows when verification succeeds */}
                            {verificationStatus === "success" && (
                                <div
                                    className="verify-email-status"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {/* Small success indicator */}
                                    <div className="verify-email-result d-flex align-items-center gap-2 mb-4">
                                        <span
                                            className="verify-email-result-icon"
                                            aria-hidden="true"
                                        >
                                            ✓
                                        </span>

                                        <span>Email confirmed</span>
                                    </div>

                                    <h1 id="verification-heading">
                                        Your email is verified
                                    </h1>

                                    <p className="verify-email-description">
                                        Your email address has been confirmed successfully.
                                        You can now sign in and continue setting up your bakery.
                                    </p>

                                    {/* Continue to the login page */}
                                    <Link
                                        to="/login"
                                        className="verify-email-button d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none"
                                    >
                                        Continue to sign in
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            )}

                            {/* Shows when verification fails */}
                            {verificationStatus === "error" && (
                                <div
                                    className="verify-email-status"
                                    role="alert"
                                >
                                    {/* Small error indicator */}
                                    <div className="verify-email-result verify-email-result-error d-flex align-items-center gap-2 mb-4">
                                        <span
                                            className="verify-email-result-icon"
                                            aria-hidden="true"
                                        >
                                            !
                                        </span>

                                        <span>Verification unsuccessful</span>
                                    </div>

                                    <h1 id="verification-heading">
                                        We couldn't verify this link
                                    </h1>

                                    <p className="verify-email-description">
                                        {verificationMessage}
                                    </p>

                                    <p className="verify-email-secondary-text">
                                        The link may have expired or already been used.
                                        You can request a new verification email below.
                                    </p>

                                    {/* Return to the page where a new email can be requested */}
                                    <Link
                                        to="/check-email"
                                        className="verify-email-button d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none"
                                    >
                                        Get a new verification link
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            )}

                            {/* Help section */}
                            <div className="verify-email-footer mt-5 pt-4">
                                <p className="mb-0">
                                    Having trouble?{" "}
                                    <a href="mailto:support@bakeau.ca">
                                        Contact support
                                    </a>
                                </p>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

        </main>
    );
}