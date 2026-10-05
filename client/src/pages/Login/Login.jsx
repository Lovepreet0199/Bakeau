//Allow the login form to manage its input values and messages
import { useState } from "react";

//Allows internal navigation between Bakeau pages
import { Link, useNavigate } from "react-router-dom";

//Import the login page styles
import "./Login.css";

//Displays the Bakeau sign in page
export default function Login() {

    //Allows React to send the user to another page after login
    const navigate = useNavigate();

    //Returns the user to the previous page when possible
    function handleBack() {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    }

    //Stores the values entered into the login form
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    //Stores an error message if the login attempt fails
    const [formError, setFormError] = useState("");

    //Tracks whether the login request is currently being processed
    const [isSubmitting, setIsSubmitting] = useState(false);

    //Tracks whether the user wants their login to stay saved on this device
    const [rememberDevice, setRememberDevice] = useState(false);

    //Updates the login form when the user types into an input
    function handleChange(event) {

        //Get the name and value of the input that changed
        const { name, value } = event.target;

        //Update only the field that the user changed
        setFormData({
            ...formData,
            [name]: value
        });
    }

    //Handles the login form submission
    async function handleSubmit(event) {

        //Stop the browser from refreshing the page when the form is submitted
        event.preventDefault();

        //Clear any previous login error
        setFormError("");

        //Show the loading state while the login request  is being processed
        setIsSubmitting(true);

        try {
            //Send the user's email and password to the login API
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",

                    //Tell the backend that the request body contains JSON
                    headers: {
                        "Content-Type": "application/json"
                    },

                    //Convert the login form data into JSON
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                }
            );

            //Convert the backend JSON response into a JavaScript object
            const data = await response.json();

            //Send unverified users back to the email verification flow
            if (response.status === 403 && data.emailVerified === false) {

                //Save the email so the Check Email page knows which account to use
                sessionStorage.setItem(
                    "pendingVerificationEmail",
                    formData.email
                );

                //Send the user to the Check Email page
                navigate("/check-email", {
                    state: {
                        email: formData.email
                    }
                });

                //Stop the login function because this user must verify their email first
                return;
            }

            //Stop if the login request was not successful
            if (!response.ok) {
                setFormError(
                    data.message || "Unable to sign in. Please check your email and password"
                );
                return;
            }

            //Choose where to save the login based on the Remember this device option
            const storage = rememberDevice ? localStorage : sessionStorage;

            //Save the JWT so it can be used for authenticated API requests
            storage.setItem("token", data.token);

            //Save the logged-in user's information for use in the frontend
            storage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            //Check whether the logged-in bakery owner already has a bakery
            const bakeryResponse = await fetch(
                "http://localhost:3000/api/bakeries/mine",
                {
                    method: "GET",

                    //Send the JWT so the backend knows which bakery owner is logged in
                    headers: {
                        Authorization: `Bearer ${data.token}`
                    }
                }
            );

            //Convert the bakery API response into a JavaScript object
            const bakeryData = await bakeryResponse.json();

            //Send a new Bakery Owner to the bakery setup flow
            if (bakeryResponse.status === 404) {
                navigate("/bakery-setup");
                return;
            }

            //Stop if the bakery information could not be retrieved
            if (!bakeryResponse.ok) {
                setFormError(
                    bakeryData.message || "Unable to load your bakery. Please try again."
                );
                return;
            }

            //Send an existing Bakery Owner to their dashboard
            navigate("/dashboard");

        } catch (error) {

            //Show an error if React could not connect to the backend
            setFormError(
                "Unable to connect to Bakeau. Please try again."
            );

            //Log the actual error in the console for debugging
            console.error("Login error: ", error);
        } finally {

            //Stop the loading state after the login process finishes
            setIsSubmitting(false);
        }
    }
    return (
        <main className="login-page min-vh-100">

            {/* Split screen layout for the login page */}
            <div className="container-fluid p-0 min-vh-100">
                <div className="row g-0 min-vh-100">

                    {/* Bakery image is displayed on desktop and hidden on smaller screens */}
                    <section className="d-none d-lg-block col-lg-5 login-image-panel">

                        {/* Dark overlay improves the readability of text over the cake image */}
                        <div className="login-image-overlay"></div>

                        {/* Bakeau branding displayed over the bakery image */}
                        <div className="login-image-content d-flex flex-column justify-content-end h-100">

                            <Link
                                to="/"
                                className="login-brand d-inline-flex align-items-center gap-2 mb-4"
                            >
                                <span
                                    className="login-brand-icon d-flex align-items-center justify-content-center"
                                    aria-hidden="true"
                                >
                                    🍰
                                </span>

                                <span>Bakeau</span>
                            </Link>

                            <h2 className="login-image-title mb-3">
                                Turn your baked
                                <br />
                                creations into orders.
                            </h2>

                            <p className="login-image-description mb-0">
                                A simple platform to manage your bakery, products,
                                orders, and your online storefront.
                            </p>

                        </div>

                    </section>

                    {/* Login form */}
                    <section className="col-12 col-lg-7 login-form-panel">
                        {/* Centers the sign in form inside the right side of the page */}
                        <div className="d-flex align-items-center justify-content-center h-100 px-4 px-md-5">
                            <div className="login-form-content w-100">

                                {/* Navigation above the login form */}
                                <div className="login-top-navigation d-flex align-items-center justify-content-between mb-5">

                                    <button
                                        type="button"
                                        className="login-back-button d-inline-flex align-items-center gap-2"
                                        onClick={handleBack}
                                    >
                                        <span aria-hidden="true">←</span>
                                        Back
                                    </button>

                                    {/* Bakeau brand is shown here on smaller screens */}
                                    <Link
                                        to="/"
                                        className="login-mobile-brand d-inline-flex d-lg-none align-items-center gap-2"
                                    >
                                        <span
                                            className="login-mobile-brand-icon d-flex align-items-center justify-content-center"
                                            aria-hidden="true"
                                        >
                                            🍰
                                        </span>

                                        <span>Bakeau</span>
                                    </Link>

                                </div>

                                {/* Introduces the sign in form */}
                                <div className="mb-4">
                                    <h1
                                        id="login-title"
                                        className="login-title mb-2"
                                    >
                                        Sign in to Bakeau
                                    </h1>

                                    <p className="login-subtitle mb-0">
                                        Manage your bakery, products, orders, and storefront.
                                    </p>
                                </div>

                                {/* Sign in form */}
                                <form
                                    onSubmit={handleSubmit}
                                    aria-labelledby="login-title"
                                >
                                    {/* Email address field */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="email"
                                            className="login-form-label d-block mb-2"
                                        >
                                            Email address
                                        </label>

                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control login-input"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>

                                    {/* Password field */}
                                    <div className="mb-3">

                                        {/* Password label and forgot password link */}
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <label
                                                htmlFor="password"
                                                className="login-form-label"
                                            >
                                                Password
                                            </label>

                                            <Link
                                                to="/forgot-password"
                                                className="login-forgot-link"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>

                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control login-input"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                            required
                                        />

                                    </div>

                                    {/* Login options */}
                                    <div className="d-flex align-items-center justify-content-between mb-4">

                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                id="rememberDevice"
                                                className="form-check-input login-checkbox"
                                                checked={rememberDevice}
                                                onChange={(event) => setRememberDevice(event.target.checked)}
                                            />

                                            <label
                                                htmlFor="rememberDevice"
                                                className="form-check-label login-checkbox-label"
                                            >
                                                Remember this device
                                            </label>
                                        </div>

                                    </div>

                                    {/* Shows an error if the login attempt fails */}
                                    {formError && (
                                        <div
                                            className="login-error mb-4"
                                            role="alert"
                                        >
                                            {formError}
                                        </div>
                                    )}

                                    {/* Submit the login form */}
                                    <button
                                        type="submit"
                                        className="login-submit-btn w-100"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Signing in..." : "Sign in"}
                                    </button>

                                    {/* Separates the login action from account creation */}
                                    <div className="login-divider d-flex align-items-center my-4">
                                        <div className="login-divider-line flex-grow-1"></div>

                                        <span className="login-divider-text px-3">
                                            OR
                                        </span>

                                        <div className="login-divider-line flex-grow-1"></div>
                                    </div>

                                    {/* Allows a new bakery owner to create an account */}
                                    <p className="login-register-text text-center mb-0">
                                        New to Bakeau?{" "}
                                        <Link
                                            to="/register"
                                            className="login-register-link"
                                        >
                                            Create a bakery account
                                        </Link>
                                    </p>

                                </form>

                            </div>
                        </div>
                    </section>

                </div>
            </div>

        </main>
    );
}

