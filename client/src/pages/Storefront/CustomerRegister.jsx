//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams
} from "react-router-dom";

//Import Customer registration styles
import "./CustomerRegister.css";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";


//Displays Customer registration for a Bakery Storefront
export default function CustomerRegister() {

    //Get Bakery slug from the URL
    const { slug } = useParams();

    //Used to move the Customer after registration
    const navigate = useNavigate();

    //Get optional return location
    const [searchParams] =
        useSearchParams();

    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);

    //Tracks Bakery loading
    const [
        isBakeryLoading,
        setIsBakeryLoading
    ] = useState(true);

    //Stores Bakery loading errors
    const [
        bakeryError,
        setBakeryError
    ] = useState("");

    //Controls whether the Password is visible
    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    //Controls whether the Confirm Password is visible
    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);

    //Stores registration errors
    const [
        formError,
        setFormError
    ] = useState("");

    //Tracks registration request
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    //Stores Customer registration values
    const [
        formData,
        setFormData
    ] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
        terms: false
    });


    //Get where the Customer should return after authentication
    const redirectTo =
        searchParams.get("redirect") ||
        `/store/${slug}`;


    //Loads public Bakery information
    useEffect(() => {

        async function fetchBakery() {

            try {

                //Request Bakery using public slug
                const response =
                    await fetch(
                        `http://localhost:3000/api/bakeries/public/${slug}`
                    );

                //Convert response into JavaScript data
                const data =
                    await response.json();

                //Stop if Bakery could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load bakery"
                    );
                }

                //Save Bakery information
                setBakery(
                    data.bakery
                );

            } catch (error) {

                //Display Bakery loading error
                setBakeryError(
                    error.message
                );

            } finally {

                //Stop Bakery loading
                setIsBakeryLoading(
                    false
                );
            }
        }

        fetchBakery();

    }, [slug]);


    //Updates Customer registration form
    function handleChange(event) {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setFormData(
            (currentFormData) => ({
                ...currentFormData,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value
            })
        );

        //Clear previous error while Customer edits
        setFormError("");
    }


    //Handles Customer registration
    async function handleSubmit(event) {

        event.preventDefault();


        //Make sure both Password fields match
        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setFormError(
                "Passwords do not match."
            );

            return;
        }


        //Match Bakeau password requirements
        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;


        //Stop if Password does not meet requirements
        if (
            !passwordPattern.test(
                formData.password
            )
        ) {

            setFormError(
                "Password must be at least 8 characters and include uppercase, lowercase, and a number."
            );

            return;
        }


        //Clear previous error
        setFormError("");

        //Prepare Customer registration data
        const registrationData = {

            first_name:
                formData.firstName.trim(),

            last_name:
                formData.lastName.trim(),

            email:
                formData.email
                    .trim()
                    .toLowerCase(),

            phone_number:
                formData.phone_number.trim(),

            password:
                formData.password
        };


        //Prevent another submission while request runs
        setIsSubmitting(
            true
        );


        try {

            //Send Customer registration data to backend
            const response =
                await fetch(
                    "http://localhost:3000/api/auth/register/customer",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                registrationData
                            )
                    }
                );


            //Convert backend response
            const data =
                await response.json();


            //Stop if backend returns an error
            if (!response.ok) {

                //Express-validator errors
                if (
                    data.errors &&
                    data.errors.length > 0
                ) {

                    setFormError(
                        data.errors[0].msg
                    );

                } else {

                    setFormError(
                        data.message ||
                        "Registration failed. Please try again."
                    );
                }

                return;
            }


            //Save email for verification page
            sessionStorage.setItem(
                "pendingVerificationEmail",
                formData.email.trim()
            );


            //Remember where Customer should return after Login
            localStorage.setItem(
                "authReturnTo",
                redirectTo
            );

            //Remember which Bakery the Customer came from
            localStorage.setItem(
                "authBakerySlug",
                slug
            );


            //Send Customer to email verification screen
            navigate(
                "/check-email",
                {
                    state: {
                        email:
                            formData.email.trim()
                    }
                }
            );

        } catch (error) {

            //Handle connection errors
            setFormError(
                "Unable to connect to Bakeau. Please try again."
            );

            console.error(
                "Customer registration error:",
                error
            );

        } finally {

            //Allow form to be submitted again
            setIsSubmitting(
                false
            );
        }
    }


    //Display Bakery loading
    if (isBakeryLoading) {

        return (

            <div className="min-vh-100 d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading...
                    </span>

                </div>

            </div>
        );
    }


    //Display Bakery loading error
    if (
        bakeryError ||
        !bakery
    ) {

        return (

            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <h1 className="h3 mb-0">
                    Bakery unavailable
                </h1>

                <p className="text-secondary mb-0">

                    {
                        bakeryError ||
                        "Bakery not found"
                    }

                </p>

                <Link
                    to="/"
                    className="btn btn-dark"
                >
                    Back to Bakeau
                </Link>

            </div>
        );
    }


    return (

        //Use Bakery branding or default Storefront branding
        <main
            className="customer-register-page container-fluid p-0"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            <div className="row g-0 min-vh-100">

                {/* Left side introduces the Bakery Customer experience */}
                <aside className="customer-register-sidebar col-lg-3 d-flex flex-column">

                    {/* Bakery branding */}
                    <div className="d-flex align-items-center gap-2">

                        {bakery.logo_image_url ? (

                            <img
                                src={
                                    bakery.logo_image_url
                                }
                                alt={`${bakery.name} logo`}
                                className="customer-register-logo-image"
                            />

                        ) : null}


                        <p className="customer-register-logo mb-0">

                            {
                                bakery.name
                            }

                        </p>

                    </div>


                    <div className="my-auto">

                        <p className="customer-register-tagline">

                            Your favorites, just a few clicks away

                        </p>


                        <div className="customer-register-features">

                            <p>
                                ✦ Order directly from {bakery.name}
                            </p>

                            <p>
                                ✦ Save your order information
                            </p>

                            <p>
                                ✦ Choose pickup times
                            </p>

                            <p>
                                ✦ Track your orders
                            </p>

                            <p>
                                ✦ Manage your order history
                            </p>

                        </div>

                    </div>


                    <p className="customer-register-sidebar-note">

                        Secure ordering powered by Bakeau

                    </p>

                </aside>


                {/* Right side contains Customer registration form */}
                <section
                    className="customer-register-content col-lg-9 d-flex align-items-center justify-content-center"
                    aria-labelledby="customer-register-heading"
                >

                    <div className="customer-register-form-container">

                        {/* Return to Bakery */}
                        <Link
                            to={`/store/${slug}`}
                            className="customer-register-back-link"
                        >

                            <span aria-hidden="true">
                                ‹
                            </span>

                            Back to {bakery.name}

                        </Link>


                        {/* Main heading */}
                        <h1 id="customer-register-heading">

                            Create your account

                        </h1>


                        <p className="customer-register-intro">

                            Create an account to place orders and manage your purchases.

                        </p>


                        {/* Customer registration form */}
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="row">

                                {/* First name */}
                                <div className="col-6 mb-3">

                                    <label
                                        htmlFor="firstName"
                                        className="form-label"
                                    >

                                        First name{" "}

                                        <span className="customer-required-field">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="form-control"
                                        autoComplete="given-name"
                                        value={
                                            formData.firstName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Last name */}
                                <div className="col-6 mb-3">

                                    <label
                                        htmlFor="lastName"
                                        className="form-label"
                                    >

                                        Last name{" "}

                                        <span className="customer-required-field">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="form-control"
                                        autoComplete="family-name"
                                        value={
                                            formData.lastName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* Email */}
                            <div className="mb-3">

                                <label
                                    htmlFor="email"
                                    className="form-label"
                                >

                                    Email{" "}

                                    <span className="customer-required-field">
                                        *
                                    </span>

                                </label>


                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    autoComplete="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* Phone number */}
                            <div className="mb-3">

                                <label
                                    htmlFor="phone_number"
                                    className="form-label"
                                >

                                    Phone number{" "}

                                    <span className="customer-required-field">
                                        *
                                    </span>

                                </label>


                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    className="form-control"
                                    autoComplete="tel"
                                    value={
                                        formData.phone_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* Password */}
                            <div className="mb-3">

                                <label
                                    htmlFor="password"
                                    className="form-label"
                                >

                                    Password{" "}

                                    <span className="customer-required-field">
                                        *
                                    </span>

                                </label>


                                <div className="customer-password-input-wrapper">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="password"
                                        name="password"
                                        className="form-control"
                                        autoComplete="new-password"
                                        aria-describedby="customerPasswordHelp"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />


                                    {/* Show or hide Password */}
                                    <button
                                        type="button"
                                        className="btn customer-password-toggle"
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


                                {/* Password requirements */}
                                <div
                                    id="customerPasswordHelp"
                                    className="form-text"
                                >

                                    8+ characters with uppercase, lowercase, and a number

                                </div>

                            </div>


                            {/* Confirm Password */}
                            <div className="mb-3">

                                <label
                                    htmlFor="confirmPassword"
                                    className="form-label"
                                >

                                    Confirm password{" "}

                                    <span className="customer-required-field">
                                        *
                                    </span>

                                </label>


                                <div className="customer-password-input-wrapper">

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="form-control"
                                        autoComplete="new-password"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />


                                    {/* Show or hide Confirm Password */}
                                    <button
                                        type="button"
                                        className="btn customer-password-toggle"
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


                                {/* Registration error */}
                                {formError && (

                                    <div
                                        className="customer-register-error"
                                        role="alert"
                                    >

                                        {
                                            formError
                                        }

                                    </div>
                                )}

                            </div>


                            {/* Terms agreement */}
                            <div className="form-check mb-4">

                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="terms"
                                    className="form-check-input"
                                    checked={
                                        formData.terms
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />


                                <label
                                    htmlFor="terms"
                                    className="form-check-label"
                                >

                                    I agree to Bakeau's{" "}

                                    <Link to="/terms">
                                        Terms of Service
                                    </Link>

                                    {" "}and{" "}

                                    <Link to="/privacy">
                                        Privacy Policy
                                    </Link>

                                    .

                                    <span className="customer-required-field">
                                        *
                                    </span>

                                </label>

                            </div>


                            {/* Create Customer account */}
                            <button
                                type="submit"
                                className="btn customer-register-submit-btn w-100"
                                disabled={
                                    isSubmitting
                                }
                            >

                                {
                                    isSubmitting
                                        ? "Creating account..."
                                        : "Create account"
                                }

                            </button>


                            {/* Existing Customer */}
                            <p className="customer-register-signin text-center mt-4 mb-0">

                                Already have an account?{" "}

                                <Link
                                    to={`/store/${slug}/login?redirect=${encodeURIComponent(
                                        redirectTo
                                    )}`}
                                >
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