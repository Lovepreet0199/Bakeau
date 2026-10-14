//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useParams
} from "react-router-dom";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import { getStorefrontTheme } from "../../utils/storefrontTheme";

//Import Forgot Password styles
import "./StorefrontForgotPassword.css";


//Displays Forgot Password page for Bakery Customers
export default function StorefrontForgotPassword() {

    //Get Bakery slug from URL
    const {
        slug
    } = useParams();


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);

    //Stores Customer email
    const [
        email,
        setEmail
    ] = useState("");

    //Stores success message
    const [
        message,
        setMessage
    ] = useState("");

    //Stores page error
    const [
        error,
        setError
    ] = useState("");

    //Tracks form submission
    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    //Tracks Bakery loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    //Load Bakery information
    useEffect(() => {

        async function loadBakery() {

            try {

                const response =
                    await fetch(
                        `http://localhost:3000/api/bakeries/public/${slug}`
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

                setError(
                    error.message
                );

            } finally {

                setIsLoading(
                    false
                );
            }
        }


        loadBakery();

    }, [
        slug
    ]);


    //Requests Customer password reset email
    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        setError("");
        setMessage("");
        setIsSubmitting(true);


        try {

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
                                    email.trim(),

                                //Tells backend which Bakery Storefront this Customer came from
                                bakery_slug:
                                    slug
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to request password reset"
                );
            }


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


    //Loading
    if (isLoading) {

        return (

            <div className="min-vh-100 d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading Bakery...
                    </span>
                </div>

            </div>
        );
    }


    return (

        <div
            className="storefront-forgot-password-page min-vh-100 d-flex flex-column"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar
                bakery={bakery}
            />


            {/* Forgot Password Content */}
            <main className="flex-grow-1 d-flex align-items-center">

                <div className="container py-5">

                    <div className="row justify-content-center">

                        <div className="col-12 col-md-8 col-lg-5">

                            <div className="storefront-forgot-password-card">


                                {/* Heading */}
                                <div className="text-center mb-4">

                                    <h1 className="storefront-forgot-password-title mb-2">

                                        Forgot your password?

                                    </h1>

                                    <p className="storefront-forgot-password-subtitle mb-0">

                                        Enter your email and we'll send you a secure password reset link.

                                    </p>

                                </div>


                                {/* Form */}
                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    <div className="mb-3">

                                        <label
                                            htmlFor="customerForgotEmail"
                                            className="storefront-forgot-password-label d-block mb-2"
                                        >
                                            Email address
                                        </label>


                                        <input
                                            id="customerForgotEmail"
                                            type="email"
                                            className="form-control storefront-forgot-password-input"
                                            value={
                                                email
                                            }
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="email"
                                            placeholder="you@example.com"
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
                                        className="storefront-forgot-password-button w-100"
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


                                {/* Return to Customer Login */}
                                <div className="text-center mt-4">

                                    <Link
                                        to={`/store/${slug}/login`}
                                        className="storefront-forgot-password-back text-decoration-none"
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
            <StorefrontFooter
                bakery={bakery}
            />

        </div>
    );
}