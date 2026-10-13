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

//Import Customer Login styles
import "./CustomerLogin.css";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";


//Displays Customer Login inside a Bakery Storefront
export default function CustomerLogin() {

    //Get Bakery slug from the URL
    const { slug } = useParams();

    //Used to move the Customer after Login
    const navigate = useNavigate();

    //Reads optional redirect information
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

    //Stores Customer Login values
    const [
        formData,
        setFormData
    ] = useState({
        email: "",
        password: ""
    });

    //Tracks Login errors
    const [
        formError,
        setFormError
    ] = useState("");

    //Tracks Login request
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    //Tracks Remember Device option
    const [
        rememberDevice,
        setRememberDevice
    ] = useState(false);

    //Controls Password visibility
    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    //Only allows safe internal Bakeau redirects
    function getSafeRedirect(
        redirectPath
    ) {

        if (
            redirectPath &&
            redirectPath.startsWith("/") &&
            !redirectPath.startsWith("//")
        ) {

            return redirectPath;
        }

        return null;
    }


    //Get redirect from URL
    const redirectFromUrl =
        getSafeRedirect(
            searchParams.get(
                "redirect"
            )
        );


    //Get redirect saved during Customer registration
    const savedRedirect =
        getSafeRedirect(
            localStorage.getItem(
                "authReturnTo"
            )
        );


    //Choose where Customer returns after Login
    const returnTo =
        redirectFromUrl ||
        savedRedirect ||
        `/store/${slug}`;


    //Loads Bakery information
    useEffect(() => {

        async function fetchBakery() {

            try {

                //Request public Bakery
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


    //Updates Login form
    function handleChange(event) {

        const {
            name,
            value
        } = event.target;

        setFormData(
            (currentFormData) => ({
                ...currentFormData,
                [name]: value
            })
        );

        //Clear old Login error
        setFormError("");
    }


    //Handles Customer Login
    async function handleSubmit(event) {

        event.preventDefault();

        //Clear previous error
        setFormError("");

        //Start loading
        setIsSubmitting(
            true
        );


        try {

            //Send Login information to shared Login API
            const response =
                await fetch(
                    "http://localhost:3000/api/auth/login",
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
                                    formData.email
                                        .trim()
                                        .toLowerCase(),

                                password:
                                    formData.password
                            })
                    }
                );


            //Convert backend response
            const data =
                await response.json();


            //Send unverified Customer back to Check Email
            if (
                response.status ===
                403 &&
                data.emailVerified ===
                false
            ) {

                //Remember Customer email
                sessionStorage.setItem(
                    "pendingVerificationEmail",
                    formData.email.trim()
                );

                //Remember current Bakery
                localStorage.setItem(
                    "authBakerySlug",
                    slug
                );

                //Remember Customer destination
                localStorage.setItem(
                    "authReturnTo",
                    returnTo
                );

                //Send Customer to shared Check Email page
                navigate(
                    "/check-email",
                    {
                        state: {
                            email:
                                formData.email.trim()
                        }
                    }
                );

                return;
            }


            //Stop if Login failed
            if (!response.ok) {

                setFormError(
                    data.message ||
                    "Unable to sign in. Please check your email and password."
                );

                return;
            }


            //Only Customers should use this Login page
            if (
                data.user.role !==
                "customer"
            ) {

                setFormError(
                    "This sign in page is for customers. Bakery owners should use the Bakeau business sign in."
                );

                return;
            }


            //Choose where Login should be stored
            const storage =
                rememberDevice
                    ? localStorage
                    : sessionStorage;


            //Remove older Login information
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


            //Save Customer JWT
            storage.setItem(
                "token",
                data.token
            );


            //Save Customer information
            storage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );


            //Remove temporary authentication information
            localStorage.removeItem(
                "authReturnTo"
            );

            localStorage.removeItem(
                "authBakerySlug"
            );

            sessionStorage.removeItem(
                "pendingVerificationEmail"
            );


            //Return Customer to Storefront, Cart or Checkout
            navigate(
                returnTo
            );


        } catch (error) {

            //Display connection error
            setFormError(
                "Unable to connect to Bakeau. Please try again."
            );

            console.error(
                "Customer Login error:",
                error
            );

        } finally {

            //Stop Login loading
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


    //Display Bakery error
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
            className="customer-login-page container-fluid p-0"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            <div className="row g-0 min-vh-100">

                {/* Bakery information panel */}
                <aside className="customer-login-sidebar col-lg-3 d-flex flex-column">

                    {/* Bakery branding */}
                    <div className="d-flex align-items-center gap-2">

                        {bakery.logo_image_url && (

                            <img
                                src={
                                    bakery.logo_image_url
                                }
                                alt={`${bakery.name} logo`}
                                className="customer-login-logo-image"
                            />
                        )}


                        <p className="customer-login-logo mb-0">

                            {
                                bakery.name
                            }

                        </p>

                    </div>


                    <div className="my-auto">

                        <p className="customer-login-tagline">
                            Welcome back.
                        </p>


                        <div className="customer-login-features">

                            <p>
                                ✦ Continue your order
                            </p>

                            <p>
                                ✦ View your previous orders
                            </p>

                            <p>
                                ✦ Keep track of your purchases
                            </p>

                            <p>
                                ✦ Order again from your favorites
                            </p>

                        </div>

                    </div>


                    <p className="customer-login-sidebar-note">
                        Secure ordering powered by Bakeau
                    </p>

                </aside>


                {/* Customer Login form */}
                <section
                    className="customer-login-content col-lg-9 d-flex align-items-center justify-content-center"
                    aria-labelledby="customer-login-heading"
                >

                    <div className="customer-login-form-container">

                        {/* Back to Bakery */}
                        <Link
                            to={`/store/${slug}`}
                            className="customer-login-back-link"
                        >

                            <span aria-hidden="true">
                                ‹
                            </span>

                            Back to {bakery.name}

                        </Link>


                        {/* Login heading */}
                        <h1 id="customer-login-heading">

                            Welcome back

                        </h1>


                        <p className="customer-login-intro">

                            Sign in to continue ordering from{" "}

                            <strong>
                                {bakery.name}
                            </strong>.

                        </p>


                        {/* Customer Login form */}
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* Email */}
                            <div className="mb-3">

                                <label
                                    htmlFor="email"
                                    className="form-label"
                                >
                                    Email address
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


                            {/* Password */}
                            <div className="mb-3">

                                <div className="d-flex align-items-center justify-content-between mb-2">

                                    <label
                                        htmlFor="password"
                                        className="form-label mb-0"
                                    >
                                        Password
                                    </label>


                                    <Link
                                        to="/forgot-password"
                                        className="customer-login-forgot-link"
                                    >
                                        Forgot password?
                                    </Link>

                                </div>


                                <div className="customer-login-password-wrapper">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="password"
                                        name="password"
                                        className="form-control"
                                        autoComplete="current-password"
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
                                        className="btn customer-login-password-toggle"
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

                            </div>


                            {/* Remember Customer */}
                            <div className="form-check mb-4">

                                <input
                                    type="checkbox"
                                    id="rememberDevice"
                                    className="form-check-input"
                                    checked={
                                        rememberDevice
                                    }
                                    onChange={(event) =>
                                        setRememberDevice(
                                            event.target.checked
                                        )
                                    }
                                />


                                <label
                                    htmlFor="rememberDevice"
                                    className="form-check-label"
                                >
                                    Remember this device
                                </label>

                            </div>


                            {/* Login error */}
                            {formError && (

                                <div
                                    className="customer-login-error mb-3"
                                    role="alert"
                                >

                                    {
                                        formError
                                    }

                                </div>
                            )}


                            {/* Sign In */}
                            <button
                                type="submit"
                                className="btn customer-login-submit-btn w-100"
                                disabled={
                                    isSubmitting
                                }
                            >

                                {
                                    isSubmitting
                                        ? "Signing in..."
                                        : "Sign in"
                                }

                            </button>


                            {/* Customer registration */}
                            <p className="customer-login-register text-center mt-4 mb-0">

                                Don't have an account?{" "}

                                <Link
                                    to={`/store/${slug}/register?redirect=${encodeURIComponent(
                                        returnTo
                                    )}`}
                                >
                                    Create an account
                                </Link>

                            </p>


                            {/* Bakery Owner Login */}
                            <p className="customer-login-owner text-center mt-3 mb-0">

                                Are you a bakery owner?{" "}

                                <Link to="/login">
                                    Business sign in
                                </Link>

                            </p>

                        </form>

                    </div>

                </section>

            </div>

        </main>
    );
}