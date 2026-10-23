import API_URL from "../../config/api.js";
//Allow the Login form to manage its input values and messages
import {
    useState
} from "react";

//Allows navigation between Bakeau pages
import {
    Link,
    useNavigate
} from "react-router-dom";

//Reuse the existing Bakeau Login styles
import "../Login/Login.css";

//Import Admin Login button styles
import "./AdminLogin.css";


//Displays the Platform Administrator Login page
export default function AdminLogin() {

    //Allows React to send the Admin to another page after Login
    const navigate =
        useNavigate();

    //Stores Login form values
    const [formData, setFormData] =
        useState({
            email: "",
            password: ""
        });

    //Stores an error message if Login fails
    const [formError, setFormError] =
        useState("");

    //Tracks whether the Login request is running
    const [isSubmitting, setIsSubmitting] =
        useState(false);


    //Returns to the previous page when possible
    function handleBack() {

        if (window.history.length > 1) {

            navigate(-1);

        } else {

            navigate("/");
        }
    }


    //Updates Login form fields
    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        setFormData({
            ...formData,
            [name]: value
        });
    }


    //Handles Platform Administrator Login
    async function handleSubmit(event) {

        //Stop normal form refresh
        event.preventDefault();

        //Clear old error
        setFormError("");

        //Start loading state
        setIsSubmitting(true);


        try {

            //Send Login request
            const response =
                await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                formData.email,

                            password:
                                formData.password
                        })
                    }
                );


            //Convert backend response to JSON
            const data =
                await response.json();


            //Stop if Login fails
            if (!response.ok) {

                setFormError(
                    data.message ||
                    "Unable to sign in. Please check your email and password."
                );

                return;
            }


            //Only Platform Administrators can use this Login
            if (
                data.user.role !==
                "platformAdmin"
            ) {

                setFormError(
                    "This sign in page is for Platform Administrators."
                );

                return;
            }


            //Remove any previous Login
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


            //Save Platform Admin Login
            sessionStorage.setItem(
                "token",
                data.token
            );

            sessionStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );


            //Send Admin to Bakery Accounts
            navigate(
                "/admin/bakeries"
            );


        } catch (error) {

            console.error(
                "Admin Login error:",
                error
            );


            setFormError(
                "Unable to connect to Bakeau. Please try again."
            );

        } finally {

            //Stop loading state
            setIsSubmitting(false);
        }
    }


    return (

        <main className="login-page min-vh-100">

            {/* Split screen Login layout */}
            <div className="container-fluid p-0 min-vh-100">

                <div className="row g-0 min-vh-100">


                    {/* Bakery image panel */}
                    <section className="d-none d-lg-block col-lg-5 login-image-panel">

                        {/* Dark overlay for readability */}
                        <div className="login-image-overlay">
                        </div>


                        {/* Bakeau branding */}
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

                                <span>
                                    Bakeau
                                </span>

                            </Link>


                            <h2 className="login-image-title mb-3">
                                Manage the
                                <br />
                                Bakeau platform.
                            </h2>


                            <p className="login-image-description mb-0">
                                Review Bakery accounts, approvals,
                                suspensions, and platform activity.
                            </p>

                        </div>

                    </section>


                    {/* Admin Login form */}
                    <section className="col-12 col-lg-7 login-form-panel">

                        <div className="d-flex align-items-center justify-content-center h-100 px-4 px-md-5">

                            <div className="login-form-content w-100">


                                {/* Navigation */}
                                <div className="login-top-navigation d-flex align-items-center justify-content-between mb-5">

                                    <button
                                        type="button"
                                        className="login-back-button d-inline-flex align-items-center gap-2"
                                        onClick={
                                            handleBack
                                        }
                                    >

                                        <span aria-hidden="true">
                                            ←
                                        </span>

                                        Back

                                    </button>


                                    {/* Mobile Bakeau Brand */}
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

                                        <span>
                                            Bakeau
                                        </span>

                                    </Link>

                                </div>


                                {/* Login Heading */}
                                <div className="mb-4">

                                    <h1
                                        id="admin-login-title"
                                        className="login-title mb-2"
                                    >
                                        Admin sign in
                                    </h1>


                                    <p className="login-subtitle mb-0">
                                        Manage Bakery accounts and platform activity.
                                    </p>

                                </div>


                                {/* Login Error */}
                                {formError && (

                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {formError}
                                    </div>

                                )}


                                {/* Login Form */}
                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    aria-labelledby="admin-login-title"
                                >


                                    {/* Email */}
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
                                            placeholder="admin@bakeau.com"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            autoComplete="email"
                                            required
                                        />

                                    </div>


                                    {/* Password */}
                                    <div className="mb-4">

                                        <label
                                            htmlFor="password"
                                            className="login-form-label d-block mb-2"
                                        >
                                            Password
                                        </label>


                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control login-input"
                                            placeholder="Enter your password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            autoComplete="current-password"
                                            required
                                        />

                                    </div>


                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        className="btn login-submit-button w-100"
                                        disabled={
                                            isSubmitting
                                        }
                                    >

                                        {isSubmitting
                                            ? "Signing in..."
                                            : "Sign in"}

                                    </button>

                                </form>

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}