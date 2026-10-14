import API_URL from "../../config/api.js";
//Import React state
import {
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useParams,
    useSearchParams
} from "react-router-dom";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Reset Password styles
import "./StorefrontResetPassword.css";


//Displays Reset Password page for Bakery Customers
export default function StorefrontResetPassword() {

    //Get Bakery slug from URL
    const {
        slug
    } = useParams();

    //Read reset token from URL
    const [
        searchParams
    ] = useSearchParams();

    const token =
        searchParams.get("token");


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);


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


    //Tracks password visibility
    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    //Tracks confirmation password visibility
    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);


    //Stores error message
    const [
        error,
        setError
    ] = useState("");

    //Stores success message
    const [
        message,
        setMessage
    ] = useState("");

    //Tracks reset request
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);


    //Load Bakery information when page opens
    useState(() => {

        async function loadBakery() {

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/bakeries/public/${slug}`
                    );

                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load Bakery"
                    );
                }


                setBakery(
                    data.bakery
                );


            } catch (error) {

                console.error(
                    "Load Bakery error:",
                    error.message
                );
            }
        }


        loadBakery();

    }, [slug]);


    //Submits new Customer password
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

            //Send reset token and new password
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


            //Clear Password inputs
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

        <div
            className="storefront-reset-password-page min-vh-100 d-flex flex-column"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Storefront Navbar */}
            {bakery && (
                <StorefrontNavbar
                    bakery={bakery}
                />
            )}


            {/* Reset Password Content */}
            <main className="flex-grow-1 d-flex align-items-center">

                <div className="container py-5">

                    <div className="row justify-content-center">

                        <div className="col-12 col-md-8 col-lg-5">

                            <div className="storefront-reset-password-card">


                                {/* Heading */}
                                <div className="text-center mb-4">

                                    <h1 className="storefront-reset-password-title mb-2">

                                        Reset your password

                                    </h1>

                                    <p className="storefront-reset-password-subtitle mb-0">

                                        Create a new password for your account.

                                    </p>

                                </div>


                                {/* Invalid Token */}
                                {!token ? (

                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
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
                                                htmlFor="customerNewPassword"
                                                className="storefront-reset-password-label d-block mb-2"
                                            >
                                                New password
                                            </label>


                                            <div className="storefront-reset-password-input-wrapper">

                                                <input
                                                    id="customerNewPassword"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="form-control storefront-reset-password-input"
                                                    value={
                                                        password
                                                    }
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
                                                    className="storefront-reset-password-toggle"
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
                                                htmlFor="customerConfirmPassword"
                                                className="storefront-reset-password-label d-block mb-2"
                                            >
                                                Confirm new password
                                            </label>


                                            <div className="storefront-reset-password-input-wrapper">

                                                <input
                                                    id="customerConfirmPassword"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="form-control storefront-reset-password-input"
                                                    value={
                                                        confirmPassword
                                                    }
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
                                                    className="storefront-reset-password-toggle"
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
                                        <p className="storefront-reset-password-helper mb-4">

                                            8+ characters with uppercase, lowercase, and a number

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


                                        {/* Reset Password */}
                                        {!message && (

                                            <button
                                                type="submit"
                                                className="storefront-reset-password-button w-100"
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

                                    </form>

                                )}


                                {/* Return to Customer Login */}
                                <div className="text-center mt-4">

                                    <Link
                                        to={`/${slug}/login`}
                                        className="storefront-reset-password-back text-decoration-none"
                                    >
                                        ← Back to Sign In
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>


            {/* Storefront Footer */}
            {bakery && (
                <StorefrontFooter
                    bakery={bakery}
                />
            )}

        </div>
    );
}