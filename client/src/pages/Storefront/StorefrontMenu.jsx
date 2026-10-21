//Import API URL
import API_URL from "../../config/api.js";

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

//Import icons
import {
    ArrowRight,
    Heart
} from "lucide-react";

//Import shared Storefront components
import StorefrontNavbar from "../../components/storefront/StorefrontNavbar";
import StorefrontFooter from "../../components/storefront/StorefrontFooter";

//Import Storefront theme helper
import {
    getStorefrontTheme
} from "../../utils/storefrontTheme";

//Import shared Storefront styles
import "./BakeryStorefront.css";

//Import Menu page styles
import "./StorefrontMenu.css";


//Displays the complete public Bakery Menu
export default function StorefrontMenu() {

    //Get Bakery slug from URL
    const { slug } = useParams();

    //Used to navigate Customer
    const navigate = useNavigate();

    //Stores Bakery information
    const [bakery, setBakery] =
        useState(null);

    //Stores published Products
    const [products, setProducts] =
        useState([]);

    //Stores Favourite Product IDs
    const [
        favouriteProductIds,
        setFavouriteProductIds
    ] = useState([]);

    //Tracks Favourite currently updating
    const [
        updatingFavouriteId,
        setUpdatingFavouriteId
    ] = useState(null);

    //Tracks loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores loading error
    const [error, setError] =
        useState("");


    //Loads Bakery and Products
    useEffect(() => {

        async function loadMenu() {

            setIsLoading(true);
            setError("");

            try {

                //Request Bakery and Products
                const [
                    bakeryResponse,
                    productsResponse
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/api/bakeries/public/${slug}`
                    ),
                    fetch(
                        `${API_URL}/api/bakeries/public/${slug}/products`
                    )
                ]);


                const bakeryData =
                    await bakeryResponse.json();

                const productsData =
                    await productsResponse.json();


                //Stop if Bakery failed
                if (!bakeryResponse.ok) {

                    throw new Error(
                        bakeryData.message ||
                        "Unable to load bakery"
                    );
                }


                //Stop if Products failed
                if (!productsResponse.ok) {

                    throw new Error(
                        productsData.message ||
                        "Unable to load products"
                    );
                }


                //Save Bakery
                setBakery(
                    bakeryData.bakery
                );


                //Save Products
                setProducts(
                    productsData.products || []
                );


            } catch (error) {

                console.error(
                    "Load Menu error:",
                    error
                );

                setError(
                    error.message
                );

            } finally {

                setIsLoading(false);
            }
        }


        loadMenu();

    }, [slug]);


    //Loads Customer Favourites
    useEffect(() => {

        async function loadFavourites() {

            //Get authentication token
            const token =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");


            //Guests have no saved Favourites
            if (!token) {

                setFavouriteProductIds([]);

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/favourites`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                //Ignore unauthorized roles
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    setFavouriteProductIds([]);

                    return;
                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load favourites"
                    );
                }


                //Get Product IDs
                const productIds =
                    (
                        data.favourites || []
                    )
                        .map(
                            (favourite) =>
                                favourite.product_id?._id ||
                                favourite.product_id
                        )
                        .filter(Boolean);


                setFavouriteProductIds(
                    productIds
                );


            } catch (error) {

                console.error(
                    "Load Favourites error:",
                    error
                );
            }
        }


        loadFavourites();

    }, [slug]);


    //Formats Product price
    function formatPrice(price) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency:
                    bakery?.currency ||
                    "CAD"
            }
        ).format(
            price || 0
        );
    }


    //Returns Product action text
    function getProductActionLabel(product) {

        const categoryName =
            product?.category?.toLowerCase() ||
            "";


        if (
            categoryName.includes("cake")
        ) {

            return "Customize";
        }


        return "View item";
    }


    //Adds or removes Favourite
    async function toggleFavourite(productId) {

        //Get Customer token
        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");


        //Guests must login
        if (!token) {

            navigate(
                `/${slug}/login`
            );

            return;
        }


        const isFavourite =
            favouriteProductIds.includes(
                productId
            );


        setUpdatingFavouriteId(
            productId
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/api/favourites/${productId}`,
                    {
                        method:
                            isFavourite
                                ? "DELETE"
                                : "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                navigate(
                    `/${slug}/login`
                );

                return;
            }


            if (response.status === 403) {
                return;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update favourite"
                );
            }


            //Remove Favourite
            if (isFavourite) {

                setFavouriteProductIds(
                    (currentFavourites) =>
                        currentFavourites.filter(
                            (id) =>
                                id !== productId
                        )
                );

            } else {

                //Add Favourite
                setFavouriteProductIds(
                    (currentFavourites) => [
                        ...currentFavourites,
                        productId
                    ]
                );
            }


        } catch (error) {

            console.error(
                "Update Favourite error:",
                error
            );

        } finally {

            setUpdatingFavouriteId(
                null
            );
        }
    }


    //Loading screen
    if (isLoading) {

        return (

            <div className="storefront-menu-loading d-flex align-items-center justify-content-center">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading menu...
                    </span>

                </div>

            </div>
        );
    }


    //Error screen
    if (
        error ||
        !bakery
    ) {

        return (

            <div className="storefront-menu-loading d-flex flex-column align-items-center justify-content-center text-center gap-3">

                <h1 className="h4">
                    Unable to load menu
                </h1>

                <p>
                    {
                        error ||
                        "Bakery not found"
                    }
                </p>

                <Link
                    to={`/${slug}`}
                    className="storefront-primary-button text-decoration-none"
                >
                    Back to bakery
                </Link>

            </div>
        );
    }


    return (

        <div
            className="storefront-menu-page min-vh-100 d-flex flex-column bakery-storefront-page"
            style={
                getStorefrontTheme(
                    bakery
                )
            }
        >

            {/* Shared Storefront Navbar */}
            <StorefrontNavbar
                bakery={bakery}
            />


            <main className="storefront-menu-main flex-grow-1">

                <div className="container py-4 py-lg-5">

                    {/* Breadcrumb */}
                    <div className="storefront-menu-breadcrumb">

                        <Link
                            to={`/${slug}`}
                            className="text-decoration-none"
                        >
                            Home
                        </Link>

                        <span>
                            /
                        </span>

                        <span>
                            Menu
                        </span>

                    </div>


                    {/* Page Header */}
                    <section className="storefront-menu-header">

                        <div>

                            <span className="storefront-menu-eyebrow">
                                OUR MENU
                            </span>

                            <h1>
                                Freshly baked for you
                            </h1>

                            <p>
                                Browse everything available from {bakery.name}.
                            </p>

                        </div>

                    </section>


                    {/* Product count */}
                    <section className="storefront-menu-summary">

                        <strong>
                            {products.length}
                        </strong>

                        <span>
                            {products.length === 1
                                ? " item available"
                                : " items available"
                            }
                        </span>

                    </section>


                    {/* Products */}
                    {products.length > 0 ? (

                        <div className="row g-4">

                            {products.map(
                                (product) => (

                                    <div
                                        className="col-12 col-md-6 col-xl-4"
                                        key={
                                            product._id
                                        }
                                    >

                                        <article className="storefront-product-card h-100 d-flex flex-column position-relative">

                                            {/* Product image */}
                                            <div className="ratio ratio-4x3 storefront-product-image-wrapper">

                                                {product.image_url ? (

                                                    <img
                                                        src={
                                                            product.image_url
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="storefront-product-image w-100 h-100"
                                                    />

                                                ) : (

                                                    <div className="storefront-product-placeholder d-flex align-items-center justify-content-center">
                                                        🍰
                                                    </div>

                                                )}

                                            </div>


                                            {/* Favourite button */}
                                            <button
                                                type="button"
                                                className="btn btn-light rounded-circle shadow-sm position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center p-2"
                                                aria-label={
                                                    favouriteProductIds.includes(
                                                        product._id
                                                    )
                                                        ? "Remove from favourites"
                                                        : "Add to favourites"
                                                }
                                                disabled={
                                                    updatingFavouriteId ===
                                                    product._id
                                                }
                                                onClick={() =>
                                                    toggleFavourite(
                                                        product._id
                                                    )
                                                }
                                            >

                                                <Heart
                                                    size={19}
                                                    className={
                                                        favouriteProductIds.includes(
                                                            product._id
                                                        )
                                                            ? "text-danger"
                                                            : "text-dark"
                                                    }
                                                    fill={
                                                        favouriteProductIds.includes(
                                                            product._id
                                                        )
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />

                                            </button>


                                            {/* Product information */}
                                            <div className="d-flex flex-column flex-grow-1 p-4">

                                                {product.category && (

                                                    <span className="storefront-product-category mb-2">
                                                        {product.category}
                                                    </span>

                                                )}


                                                <h2 className="storefront-product-title mb-2">
                                                    {product.name}
                                                </h2>


                                                <p className="storefront-product-price mb-4">

                                                    From{" "}

                                                    <strong>
                                                        {
                                                            formatPrice(
                                                                product.base_price
                                                            )
                                                        }
                                                    </strong>

                                                </p>


                                                <Link
                                                    to={`/${slug}/product/${product._id}`}
                                                    className="storefront-product-action d-flex align-items-center justify-content-between text-decoration-none mt-auto"
                                                >

                                                    <span>
                                                        {
                                                            getProductActionLabel(
                                                                product
                                                            )
                                                        }
                                                    </span>

                                                    <ArrowRight
                                                        size={16}
                                                    />

                                                </Link>

                                            </div>

                                        </article>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <div className="storefront-menu-empty">

                            <h2>
                                Menu coming soon
                            </h2>

                            <p>
                                This bakery has not published any products yet.
                            </p>

                        </div>

                    )}

                </div>

            </main>


            {/* Shared Storefront Footer */}
            <StorefrontFooter
                bakery={bakery}
            />

        </div>
    );
}