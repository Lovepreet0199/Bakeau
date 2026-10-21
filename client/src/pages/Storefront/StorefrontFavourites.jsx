//Import API URL
import API_URL from "../../config/api.js";

//Import Storefront Product styles
import "./BakeryStorefront.css";

//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import React Router tools
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

//Import Storefront icon
import {
    Heart
} from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar
    from "../../components/storefront/StorefrontNavbar";

import StorefrontFooter
    from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import {
    getStorefrontTheme
} from "../../utils/storefrontTheme";


//Displays Favourite Products saved by the logged-in Customer
export default function StorefrontFavourites() {

    //Get Bakery slug
    const {
        slug
    } = useParams();


    //Used to navigate Customer
    const navigate =
        useNavigate();


    //Stores Bakery information
    const [
        bakery,
        setBakery
    ] = useState(null);


    //Stores Customer Favourites
    const [
        favourites,
        setFavourites
    ] = useState([]);


    //Tracks page loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    //Stores page errors
    const [
        error,
        setError
    ] = useState("");


    //Tracks Favourite currently being removed
    const [
        removingFavouriteId,
        setRemovingFavouriteId
    ] = useState(null);


    //Stores Favourite action errors
    const [
        favouriteError,
        setFavouriteError
    ] = useState("");


    //Loads Bakery and Customer Favourites
    useEffect(() => {

        async function loadFavourites() {

            //Get Customer token
            const token =
                localStorage.getItem(
                    "token"
                ) ||
                sessionStorage.getItem(
                    "token"
                );


            //Customer must be logged in
            if (
                !token
            ) {

                navigate(
                    `/${slug}/login`
                );


                return;
            }


            try {

                setIsLoading(
                    true
                );


                setError(
                    ""
                );


                //Load Bakery and Favourites together
                const [
                    bakeryResponse,
                    favouritesResponse
                ] =
                    await Promise.all([

                        fetch(
                            `${API_URL}/api/bakeries/public/${slug}`
                        ),

                        fetch(
                            `${API_URL}/api/favourites`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        )

                    ]);


                const bakeryData =
                    await bakeryResponse.json();


                const favouritesData =
                    await favouritesResponse.json();


                //Customer session expired
                if (
                    favouritesResponse.status ===
                    401
                ) {

                    navigate(
                        `/${slug}/login`
                    );


                    return;
                }


                //Stop if Bakery could not be loaded
                if (
                    !bakeryResponse.ok
                ) {

                    throw new Error(
                        bakeryData.message ||
                        "Unable to load bakery"
                    );
                }


                //Stop if Favourites could not be loaded
                if (
                    !favouritesResponse.ok
                ) {

                    throw new Error(
                        favouritesData.message ||
                        "Unable to load favourites"
                    );
                }


                //Save Bakery
                setBakery(
                    bakeryData.bakery
                );


                //Save Customer Favourites
                setFavourites(
                    favouritesData.favourites ||
                    []
                );


            } catch (error) {

                console.error(
                    "Favourite page loading error:",
                    error
                );


                setError(
                    error.message
                );


            } finally {

                setIsLoading(
                    false
                );
            }
        }


        loadFavourites();


    }, [
        slug,
        navigate
    ]);


    //Keep only Favourite Products from this Bakery
    const bakeryFavourites =
        favourites.filter(
            (favourite) =>
                String(
                    favourite.product_id?.bakery_id
                ) ===
                String(
                    bakery?._id
                )
        );


    //Formats Product prices using Bakery currency
    function formatPrice(
        price
    ) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style:
                    "currency",

                currency:
                    bakery?.currency ||
                    "CAD"
            }
        ).format(
            price ||
            0
        );
    }


    //Removes a Product from Customer Favourites
    async function removeFavourite(
        productId
    ) {

        //Get Customer token
        const token =
            localStorage.getItem(
                "token"
            ) ||
            sessionStorage.getItem(
                "token"
            );


        //Customer must be logged in
        if (
            !token
        ) {

            navigate(
                `/${slug}/login`
            );


            return;
        }


        setFavouriteError(
            ""
        );


        setRemovingFavouriteId(
            productId
        );


        try {

            //Remove Favourite
            const response =
                await fetch(
                    `${API_URL}/api/favourites/${productId}`,
                    {
                        method:
                            "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            //Customer session expired
            if (
                response.status ===
                401
            ) {

                navigate(
                    `/${slug}/login`
                );


                return;
            }


            //Stop if request failed
            if (
                !response.ok
            ) {

                throw new Error(
                    data.message ||
                    "Unable to remove favourite"
                );
            }


            //Remove Favourite from page immediately
            setFavourites(

                (currentFavourites) =>
                    currentFavourites.filter(

                        (favourite) =>
                            String(
                                favourite.product_id?._id ||
                                favourite.product_id
                            ) !==
                            String(
                                productId
                            )
                    )
            );


        } catch (error) {

            console.error(
                "Remove Favourite error:",
                error
            );


            setFavouriteError(
                error.message
            );


        } finally {

            setRemovingFavouriteId(
                null
            );
        }
    }


    //Temporary loading screen
    if (
        isLoading
    ) {

        return (

            <div className="min-vh-100 d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading favourites...
                    </span>

                </div>

            </div>
        );
    }


    //Temporary error screen
    if (
        error ||
        !bakery
    ) {

        return (

            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 text-center p-4">

                <Heart
                    size={30}
                />


                <h1 className="h3 mb-0">
                    Unable to load favourites
                </h1>


                <p className="text-secondary mb-0">

                    {
                        error
                    }

                </p>


                <Link
                    to={`/${slug}`}
                    className="btn btn-dark"
                >
                    Back to bakery
                </Link>

            </div>
        );
    }


    return (

        <div
            className="min-vh-100 d-flex flex-column"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Storefront Navbar */}
            <StorefrontNavbar
                bakery={
                    bakery
                }
            />


            <main className="flex-grow-1">

                <div className="container-xl px-3 py-4 py-lg-5">

                    {/* Page heading */}
                    <div className="mb-4">

                        <h1 className="mb-2">
                            My favourites
                        </h1>


                        <p className="text-secondary mb-0">

                            {
                                bakeryFavourites.length
                            }{" "}

                            saved{" "}

                            {
                                bakeryFavourites.length ===
                                1
                                    ? "product"
                                    : "products"
                            }{" "}

                            from{" "}

                            {
                                bakery.name
                            }

                        </p>

                    </div>


                    {/* Favourite error */}
                    {
                        favouriteError &&
                        (

                            <div
                                className="alert alert-danger mb-4"
                                role="alert"
                            >

                                {
                                    favouriteError
                                }

                            </div>
                        )
                    }


                    {/* Favourite Products */}
                    {
                        bakeryFavourites.length >
                        0
                            ? (

                                <div className="row g-3 g-md-4">

                                    {
                                        bakeryFavourites.map(
                                            (favourite) => {

                                                const product =
                                                    favourite.product_id;


                                                //Skip deleted Products
                                                if (
                                                    !product
                                                ) {

                                                    return null;
                                                }


                                                return (

                                                    <div
                                                        className="col-12 col-sm-6 col-lg-3"
                                                        key={
                                                            favourite._id
                                                        }
                                                    >

                                                        <article className="storefront-product-card h-100 d-flex flex-column position-relative">

                                                            {/* Product image */}
                                                            <div className="ratio ratio-4x3 storefront-product-image-wrapper">

                                                                {
                                                                    product.image_url
                                                                        ? (

                                                                            <img
                                                                                src={
                                                                                    product.image_url
                                                                                }
                                                                                alt={
                                                                                    product.name
                                                                                }
                                                                                className="storefront-product-image w-100 h-100"
                                                                            />
                                                                        )
                                                                        : (

                                                                            <div className="storefront-product-placeholder d-flex align-items-center justify-content-center">
                                                                                🍰
                                                                            </div>
                                                                        )
                                                                }

                                                            </div>


                                                            {/* Remove Favourite */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-light rounded-circle shadow-sm position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center p-2"
                                                                aria-label="Remove from favourites"
                                                                disabled={
                                                                    removingFavouriteId ===
                                                                    product._id
                                                                }
                                                                onClick={() =>
                                                                    removeFavourite(
                                                                        product._id
                                                                    )
                                                                }
                                                            >

                                                                <Heart
                                                                    size={19}
                                                                    className="text-danger"
                                                                    fill="currentColor"
                                                                />

                                                            </button>


                                                            {/* Product information */}
                                                            <div className="d-flex flex-column flex-grow-1 p-3">

                                                                <h2 className="storefront-product-title h5 mb-1">

                                                                    {
                                                                        product.name
                                                                    }

                                                                </h2>


                                                                <p className="storefront-product-price mb-3">

                                                                    From{" "}

                                                                    {
                                                                        formatPrice(
                                                                            product.base_price
                                                                        )
                                                                    }

                                                                </p>


                                                                <Link
                                                                    to={`/${slug}/product/${product._id}`}
                                                                    className="storefront-product-action d-flex align-items-center justify-content-center text-decoration-none mt-auto"
                                                                >
                                                                    View item
                                                                </Link>

                                                            </div>

                                                        </article>

                                                    </div>
                                                );
                                            }
                                        )
                                    }

                                </div>
                            )
                            : (

                                <div className="text-center py-5">

                                    <Heart
                                        size={34}
                                    />


                                    <h2 className="h4 mt-3 mb-2">
                                        No favourites yet
                                    </h2>


                                    <p className="text-secondary mb-4">
                                        Save products you love and they will appear here.
                                    </p>


                                    <Link
                                        to={`/${slug}/menu`}
                                        className="storefront-primary-button d-inline-flex align-items-center justify-content-center text-decoration-none"
                                    >
                                        Browse products
                                    </Link>

                                </div>
                            )
                    }

                </div>

            </main>


            {/* Storefront Footer */}
            <StorefrontFooter
                bakery={
                    bakery
                }
            />

        </div>
    );
}