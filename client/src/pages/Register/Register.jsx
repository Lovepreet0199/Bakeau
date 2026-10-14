import API_URL from "../../config/api.js";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Registration page styles
import "./Register.css";

//Registration page for new Bakeau users
export default function Register() {
    // Controls whether the password is visible or hidden
    const [showPassword, setShowPassword] = useState(false);

    // Controls whether the confirmation password is visible or hidden
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Stores a registration error that can be shown to the user
    const [formError, setFormError] = useState("");

    // Tracks whether the registration request is currently being submitted
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stores the values entered in the registration form
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
        terms: false
    });

    // Updates the registration form when the user changes an input
    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    }

    // Handles the registration form submission
    async function handleSubmit(event) {
        event.preventDefault();

        //Make sure both password fields contain the same password
        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        // Checks that the password meets Bakeau's password requirements
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

        if (!passwordPattern.test(formData.password)) {
            setFormError(
                "Password must be at least 8 characters and include uppercase, lowercase, and a number."
            );
            return;
        }

        //Clears an old error when the form is valid
        setFormError("");

        // Prepares the registration data in the format expected by the backend
        const registrationData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phone_number,
            password: formData.password,
        };

        // Prevents the form from being submitted again while the request is running
        setIsSubmitting(true);

        try {
            // Sends the bakery owner registration data to the backend
            const response = await fetch(
                `${API_URL}/api/auth/register/bakery-owner`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(registrationData)
                }
            );

            //Converts the backend JSON response into a JavaScript object
            const data = await response.json();

            //Stop registration if the backend returns an error
            if (!response.ok) {

                // Express-validator returns validation errors inside an errors array
                if (data.errors && data.errors.length > 0) {
                    setFormError(data.errors[0].msg);
                } else {
                    setFormError(data.message || "Registration failed. Please try again.");
                }

                return;
            }

            //Registration was successful
            setFormError("");

            //Temporarily save the email so the verification page still works after a refresh
            sessionStorage.setItem(
                "pendingVerificationEmail",
                formData.email
            );

            //Send the user to the email verification screen after registration
            navigate("/check-email", {
                state: {
                    email: formData.email
                }
            });

        } catch (error) {
            // Handles connection errors such as the backend server being unavailable
            setFormError("Unable to connect to Bakeau. Please try again.");
            console.error("Registration error:", error);
        } finally {
            // Allows the form to be submitted again after the request finishes
            setIsSubmitting(false);
        }
    }

    //Used to move the user to the email verification screen
    const navigate = useNavigate();

    return (
        <main className="register-page container-fluid p-0">
            <div className="row g-0 min-vh-100">

                {/* Left side introduces Bakeau and the main Bakery features */}
                <aside className="register-sidebar col-lg-3 d-flex flex-column">
                    <p className="register-logo">Bakeau</p>

                    <div className="my-auto">
                        <p className="register-tagline">Your bakery, online in minutes</p>

                        <div className="register-features">
                            <p>✦ Beautiful branded storefront</p>
                            <p>✦ Stripe payment processing</p>
                            <p>✦ Order & pickup management</p>
                            <p>✦ Product customization</p>
                            <p>✦ Customer reviews</p>
                        </div>
                    </div>
                    <p className="register-trial">
                        14-day free trial · No credit card required
                    </p>
                </aside>

                {/* Right side contains the bakery owner registration form */}
                <section className="register-content col-lg-9 d-flex align-items-center justify-content-center"
                    aria-labelledby="register-heading">


                    <div className="register-form-container">
                        {/* Allows users to return to the Bakeau landing page */}
                        <Link to="/" className="register-back-link">
                            <span aria-hidden="true">‹</span>
                            Back to Bakeau
                        </Link>

                        {/* Main heading for the registration page */}
                        <h1 id="register-heading">Create your account</h1>


                        <p>
                            Start your 14-day free trial. No credit card required.
                        </p>

                        {/* Bakery owner registration form */}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                {/* First name */}
                                <div className="col-6 mb-3">
                                    <label htmlFor="firstName" className="form-label">
                                        First name <span className="required-field">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="form-control"
                                        autoComplete="given-name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Last name */}
                                <div className="col-6 mb-3">
                                    <label htmlFor="lastName" className="form-label">
                                        Last name <span className="required-field">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="form-control"
                                        autoComplete="family-name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                            </div>
                            {/* Email address */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    Email <span className="required-field">*</span>
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Phone number */}
                            <div className="mb-3">

                                <label
                                    htmlFor="phone_number"
                                    className="form-label"
                                >
                                    Phone number <span className="required-field">*</span>
                                </label>

                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    className="form-control"
                                    autoComplete="tel"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Password <span className="required-field">*</span>
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        className="form-control"
                                        autoComplete="new-password"
                                        aria-describedby="passwordHelp"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                    {/* Allows the user to show or hide their password */}
                                    <button
                                        type="button"
                                        className="btn password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {/* Eye icon for password visibility */}
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
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Explains the password requirements */}
                                <div id="passwordHelp" className="form-text">
                                    8+ characters with uppercase, lowercase, and a number
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm password <span className="required-field">*</span>
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="form-control"
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />

                                    {/* Allows the user to show or hide the confirmation password */}
                                    <button
                                        type="button"
                                        className="btn password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirmation password"
                                                : "Show confirmation password"
                                        }
                                    >
                                        {/* Eye icon for password visibility */}
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
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Shows an error when the registration form is invalid */}
                                {formError && (
                                    <div className="register-error" role="alert">
                                        {formError}
                                    </div>
                                )}
                            </div>

                            {/* Terms and privacy agreement */}
                            <div className="form-check mb-4">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="terms"
                                    className="form-check-input"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    required
                                />

                                <label htmlFor="terms" className="form-check-label">
                                    I agree to Bakeau's{" "}
                                    <Link to="/terms">Terms of Service</Link>
                                    {" "}and{" "}
                                    <Link to="/privacy">Privacy Policy</Link>.
                                    <span className="required-field">*</span>
                                </label>
                            </div>

                            {/* Submits the bakery owner registration form */}
                            <button
                                type="submit"
                                className="btn register-submit-btn w-100"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating account..." : "Create account"}
                            </button>

                            {/* Link for users who already have a Bakeau account */}
                            <p className="register-signin text-center mt-4 mb-0">
                                Already have an account?{" "}
                                <Link to="/login">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </div>
                </section>

            </div>
        </main>
    );
}