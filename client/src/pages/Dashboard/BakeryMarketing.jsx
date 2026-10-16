//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import API URL
import API_URL from "../../config/api.js";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage";

//Import Marketing styles
import "./styles/BakeryMarketing.css";


//Displays Bakery marketing tools
export default function BakeryMarketing() {

    //Stores Bakery Products
    const [products, setProducts] =
        useState([]);

    //Tracks Product loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores loading errors
    const [error, setError] =
        useState("");

    //Tracks the Product currently being updated
    const [
        updatingProductId,
        setUpdatingProductId
    ] = useState(null);


    //Loads Bakery Products when the page opens
    useEffect(() => {

        async function loadProducts() {

            try {

                setIsLoading(true);
                setError("");


                //Get logged-in Bakery Owner token
                const token =
                    getAuthToken();


                //Get Bakery Products
                const response =
                    await fetch(
                        `${API_URL}/api/products`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                //Stop if Products could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load products."
                    );
                }


                //Store Bakery Products
                setProducts(
                    data.products || []
                );


            } catch (error) {

                setError(
                    error.message
                );


            } finally {

                setIsLoading(false);
            }
        }


        loadProducts();

    }, []);


    //Count currently featured Products
    const featuredProductCount =
        products.filter(
            (product) =>
                product.is_featured
        ).length;


    //Formats Product price
    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency: "CAD"
            }
        ).format(
            Number(amount || 0)
        );
    }


    //Updates whether a Product is featured
    async function toggleFeaturedProduct(product) {

        try {

            setUpdatingProductId(
                product._id
            );

            setError("");


            //Get logged-in Bakery Owner token
            const token =
                getAuthToken();


            //Reverse the current featured value
            const newFeaturedValue =
                !product.is_featured;


            //Do not allow more than four featured Products
            if (
                newFeaturedValue &&
                featuredProductCount >= 4
            ) {

                setError(
                    "You can feature up to 4 products."
                );

                return;
            }


            //Update Product featured status
            const response =
                await fetch(
                    `${API_URL}/api/products/${product._id}/featured`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            is_featured:
                                newFeaturedValue
                        })
                    }
                );


            const data =
                await response.json();


            //Stop if Product could not be updated
            if (!response.ok) {

                throw new Error(
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to update featured product."
                );
            }


            //Replace Product with updated Product
            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (currentProduct) =>
                            currentProduct._id ===
                                product._id
                                ? data.product
                                : currentProduct
                    )
            );


        } catch (error) {

            setError(
                error.message
            );


        } finally {

            setUpdatingProductId(null);
        }
    }


    return (

        <div className="bakery-marketing-page">


            {/* Marketing page heading */}
            <div className="bakery-marketing-heading">

                <div>

                    <h1>
                        Marketing
                    </h1>

                    <p>
                        Manage how your products are promoted
                        on your bakery storefront.
                    </p>

                </div>

            </div>


            {/* Loading Products */}
            {isLoading && (

                <div className="bakery-marketing-loading">

                    <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading products...
                        </span>
                    </div>


                    <span>
                        Loading products...
                    </span>

                </div>

            )}


            {/* Product loading error */}
            {error && (

                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {/* Featured Products section */}
            {!isLoading && (

                <div className="bakery-marketing-card">

                    {/* Section heading */}
                    <div className="bakery-marketing-card-heading">

                        <div>

                            <h2>
                                Featured Products
                            </h2>

                            <p>
                                Choose which products should
                                receive more visibility on your storefront.
                            </p>

                        </div>

                    </div>


                    <div className="p-3 p-md-4">

                        {/* Featured Product count */}
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">

                            <p className="mb-0 text-muted small">
                                {featuredProductCount} of 4 products featured
                            </p>

                        </div>


                        {/* Products */}
                        <div className="row g-3">

                            {products.map(
                                (product) => (

                                    <div
                                        className="col-12 col-md-6 col-xl-4"
                                        key={product._id}
                                    >

                                        <div className="bakery-marketing-product-card h-100 d-flex flex-column">

                                            {/* Product image */}
                                            <div className="bakery-marketing-product-image">

                                                {product.image_url ? (

                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                    />

                                                ) : (

                                                    <span>
                                                        No image
                                                    </span>

                                                )}

                                            </div>


                                            {/* Product information */}
                                            <div className="p-3 d-flex flex-column flex-grow-1">

                                                <div className="d-flex justify-content-between align-items-start gap-3">

                                                    <div>

                                                        <h3>
                                                            {product.name}
                                                        </h3>

                                                        <p className="mb-1">
                                                            {product.category}
                                                        </p>

                                                        <strong>
                                                            {
                                                                formatMoney(
                                                                    product.base_price
                                                                )
                                                            }
                                                        </strong>

                                                    </div>


                                                    {/* Featured status */}
                                                    {product.is_featured && (

                                                        <span className="bakery-marketing-featured-badge">
                                                            Featured
                                                        </span>

                                                    )}

                                                </div>


                                                {/* Featured Product action */}
                                                <div className="mt-auto pt-3">

                                                    <button
                                                        type="button"
                                                        className={
                                                            product.is_featured
                                                                ? "bakery-marketing-secondary-button w-100"
                                                                : "bakery-marketing-primary-button w-100"
                                                        }
                                                        disabled={
                                                            updatingProductId ===
                                                            product._id ||
                                                            (
                                                                !product.is_featured &&
                                                                featuredProductCount >= 4
                                                            )
                                                        }
                                                        onClick={() =>
                                                            toggleFeaturedProduct(
                                                                product
                                                            )
                                                        }
                                                    >

                                                        {
                                                            updatingProductId ===
                                                                product._id
                                                                ? "Updating..."
                                                                : product.is_featured
                                                                    ? "Remove Featured"
                                                                    : featuredProductCount >= 4
                                                                        ? "Featured Limit Reached"
                                                                        : "Feature Product"
                                                        }

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>


                        {/* Empty Products state */}
                        {products.length === 0 && (

                            <div className="bakery-marketing-empty">

                                <h3>
                                    No products yet
                                </h3>

                                <p>
                                    Add products before choosing
                                    which ones to feature.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            )}


        </div>

    );
}