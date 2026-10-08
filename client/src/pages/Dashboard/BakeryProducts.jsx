//Import React hooks used to store products and load them from the API
import { useState, useEffect } from "react";

//Used to navigate to another Bakery Owner page
import { useNavigate } from "react-router-dom";

//Import the Add Product icon
import { Plus, Search, Star } from "lucide-react";

//Import the reusable product card
import ProductCard from "./components/ProductCard";

//Import the authentication token helper
import { getAuthToken } from "../../utils/authStorage";

//Import styles
import "./styles/Products.css";

//Displays the Bakery Owner products page
export default function BakeryProducts() {

    //Used to navigate between Bakery Owner pages
    const navigate = useNavigate();

    //Stores the bakery products returned by the API
    const [products, setProducts] = useState([]);

    //Tracks the text entered in the product search
    const [searchTerm, setSearchTerm] = useState("");

    //Tracks the currently selected product filter
    const [activeFilter, setActiveFilter] = useState("all");

    //Stores the Product waiting to be deleted
    const [productToDelete, setProductToDelete] = useState(null);

    //Tracks whether the Product is currently being deleted
    const [isProductDeleting, setIsProductDeleting] = useState(false);

    //Stores the Product currently updating its featured state
    const [featuredProductId, setFeaturedProductId] = useState(null);

    //Stores the Product currently updating its publishing status
    const [statusProductId, setStatusProductId] = useState(null);

    //Stores the Product currently updating its availability
    const [availabilityProductId, setAvailabilityProductId] = useState(null);

    //Tracks whether Products are being loaded
    const [isProductsLoading, setIsProductsLoading] = useState(true);

    //Stores any Product loading error
    const [productsError, setProductsError] = useState("");

    //Loads the bakery products when the Products page opens
    useEffect(() => {

        //Gets the Bakery Owner products from the backend
        async function fetchProducts() {

            setIsProductsLoading(true);
            setProductsError("");

            try {

                //Get the logged-in user's JWT token
                const token = getAuthToken();

                //Request the Bakery Owner's products
                const response = await fetch(
                    "http://localhost:3000/api/products",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                //Convert the response into JavaScript data
                const data = await response.json();

                //Stop if Products could not be loaded
                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load products"
                    );
                }

                //Store the Products returned by the backend
                setProducts(data.products || []);

            } catch (error) {

                setProductsError(error.message);

            } finally {

                setIsProductsLoading(false);
            }
        }

        //Run the function when the Products page loads
        fetchProducts();
    }, []);

    //Filters products using the search text and selected filter
    const filteredProducts = products.filter((product) => {

        //Checks if the product matches the search text
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());

        //Starts by allowing all products
        let matchesFilter = true;

        //Shows only published Products
        if (activeFilter === "active") {
            matchesFilter = product.status === "active";
        }

        //Shows only draft Products
        if (activeFilter === "draft") {
            matchesFilter = product.status === "draft";
        }

        //Shows only hidden Products
        if (activeFilter === "hidden") {
            matchesFilter = product.status === "hidden";
        }

        //Shows only featured Products
        if (activeFilter === "featured") {
            matchesFilter = product.is_featured;
        }

        return matchesSearch && matchesFilter;

    });

    //Deletes the selected Product
    async function handleDeleteProduct() {

        //Stop if no Product is selected
        if (!productToDelete) {
            return;
        }

        //Show the Product deletion loading state
        setIsProductDeleting(true);

        try {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Delete the selected Product
            const response = await fetch(
                `http://localhost:3000/api/products/${productToDelete._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            //Convert the response into JavaScript data
            const data = await response.json();

            //Stop if the Product could not be deleted
            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to delete product"
                );
            }

            //Remove the deleted Product from the Products page
            setProducts((currentProducts) =>
                currentProducts.filter(
                    (product) => product._id !== productToDelete._id
                )
            );

            //Close the delete confirmation modal
            setProductToDelete(null);

        } catch (error) {

            console.error("Product deletion error:", error.message);

        } finally {

            //Remove the Product deletion loading state
            setIsProductDeleting(false);
        }
    }

    //Updates whether a Product is featured
    async function handleToggleFeatured(product) {

        //Checks that the featured button is calling this function
        console.log("Feature clicked:", product);

        //Store the new featured value
        const newFeaturedValue = !product.is_featured;

        //Show the loading state for this Product
        setFeaturedProductId(product._id);

        try {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Update only the Product's featured state
            const response = await fetch(
                `http://localhost:3000/api/products/${product._id}/featured`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        is_featured: newFeaturedValue
                    })
                }
            );

            //Convert the response into JavaScript data
            const data = await response.json();

            //Checks the response returned by the backend
            console.log("Featured response:", response.status, data);

            //Stop if the featured state could not be updated
            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.errors?.[0]?.msg ||
                    "Unable to update featured product"
                );
            }

            //Replace the Product with the updated Product returned by the backend
            setProducts((currentProducts) =>
                currentProducts.map((currentProduct) =>
                    currentProduct._id === product._id
                        ? data.product
                        : currentProduct
                )
            );

        } catch (error) {

            console.error(
                "Product featured update error:",
                error.message
            );

        } finally {

            //Remove the Product featured loading state
            setFeaturedProductId(null);
        }
    }

    //Updates whether a Product can currently be ordered
    async function handleToggleAvailability(product) {

        const newAvailability = !product.is_available;

        setAvailabilityProductId(product._id);

        try {

            const token = getAuthToken();

            const response = await fetch(
                `http://localhost:3000/api/products/${product._id}/availability`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        is_available: newAvailability
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.errors?.[0]?.msg ||
                    "Unable to update product availability"
                );
            }

            //Replace the Product with the updated Product
            setProducts((currentProducts) =>
                currentProducts.map((currentProduct) =>
                    currentProduct._id === product._id
                        ? data.product
                        : currentProduct
                )
            );

        } catch (error) {

            console.error(
                "Product availability update error:",
                error.message
            );

        } finally {

            setAvailabilityProductId(null);
        }
    }

    //Changes a Product between Published and Hidden
    async function handleToggleProductStatus(product) {

        //Published Products become hidden and hidden Products become published
        const newStatus =
            product.status === "active"
                ? "hidden"
                : "active";

        setStatusProductId(product._id);

        try {

            const token = getAuthToken();

            const response = await fetch(
                `http://localhost:3000/api/products/${product._id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.errors?.[0]?.msg ||
                    "Unable to update product status"
                );
            }

            //Replace the Product with the updated Product
            setProducts((currentProducts) =>
                currentProducts.map((currentProduct) =>
                    currentProduct._id === product._id
                        ? data.product
                        : currentProduct
                )
            );

        } catch (error) {

            console.error(
                "Product status update error:",
                error.message
            );

        } finally {

            setStatusProductId(null);
        }
    }

    return (
        <div className="bakery-dashboard-content">

            {/* Products page heading */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                {/* Products page information */}
                <div>
                    <h1>Products</h1>

                    <p className="mb-0">
                        Manage the products available in your bakery storefront.
                    </p>
                </div>

                {/* Opens the Add Product page */}
                <button
                    type="button"
                    className="btn bakery-dashboard-primary-button d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate("/bakery/products/new")}
                >
                    <Plus size={18} strokeWidth={2} />
                    <span>Add product</span>
                </button>
            </div>

            {/* Products search and filters */}
            <div className="d-flex flex-column flex-lg-row gap-3 mb-4">

                {/* Product search */}
                <div className="bakery-product-search d-flex align-items-center flex-grow-1">
                    <Search size={18} />

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search products"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>

                {/* Product Filters */}
                <div className="d-flex flex-wrap gap-2">

                    <button
                        type="button"
                        className={`btn bakery-product-filter-button ${activeFilter === "all" ? "active" : ""}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        All
                    </button>

                    <button
                        type="button"
                        className={`btn bakery-product-filter-button ${activeFilter === "active" ? "active" : ""}`}
                        onClick={() => setActiveFilter("active")}
                    >
                        Published
                    </button>

                    <button
                        type="button"
                        className={`btn bakery-product-filter-button ${activeFilter === "draft" ? "active" : ""}`}
                        onClick={() => setActiveFilter("draft")}
                    >
                        Draft
                    </button>

                    <button
                        type="button"
                        className={`btn bakery-product-filter-button ${activeFilter === "hidden" ? "active" : ""}`}
                        onClick={() => setActiveFilter("hidden")}
                    >
                        Hidden
                    </button>

                    <button
                        type="button"
                        className={`btn bakery-product-filter-button d-flex align-items-center gap-2 ${activeFilter === "featured" ? "active" : ""}`}
                        onClick={() => setActiveFilter("featured")}
                    >
                        <Star size={14} />
                        Featured
                    </button>

                </div>
            </div>

            {/* Products loading state */}
            {isProductsLoading ? (

                <div className="bakery-products-empty-state">
                    <p className="mb-0">Loading products...</p>
                </div>

            ) : productsError ? (

                /* Products loading error */
                <div className="bakery-products-empty-state">
                    <p className="bakery-products-error mb-0">
                        {productsError}
                    </p>
                </div>

            ) : products.length === 0 ? (

                /* No Products created yet */
                <div className="bakery-products-empty-state">

                    <h2>No products yet</h2>

                    <p>
                        Add your first product to start building your bakery storefront.
                    </p>

                    <button
                        type="button"
                        className="btn bakery-dashboard-primary-button"
                        onClick={() => navigate("/bakery/products/new")}
                    >
                        Add product
                    </button>

                </div>

            ) : filteredProducts.length === 0 ? (

                /* No Products match the selected search or filter */
                <div className="bakery-products-empty-state">

                    <h2>No products found</h2>

                    <p className="mb-0">
                        Try changing your search or selected filter.
                    </p>

                </div>

            ) : (

                /* Products grid */
                <div className="row g-3">

                    {filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            className="col-12 col-md-6 col-xl-4"
                        >

                            <ProductCard
                                product={product}
                                onEdit={() =>
                                    navigate(`/bakery/products/${product._id}/edit`)
                                }
                                onDelete={() =>
                                    setProductToDelete(product)
                                }
                                onToggleFeatured={() =>
                                    handleToggleFeatured(product)
                                }
                                isFeatureUpdating={
                                    featuredProductId === product._id
                                }
                                onToggleAvailability={() =>
                                    handleToggleAvailability(product)
                                }
                                isAvailabilityUpdating={
                                    availabilityProductId === product._id
                                }
                                onToggleStatus={() =>
                                    handleToggleProductStatus(product)
                                }
                                isStatusUpdating={
                                    statusProductId === product._id
                                }
                            />

                        </div>
                    ))}

                </div>
            )}

            {/* Product delete confirmation */}
            {productToDelete && (
                <div className="bakery-product-delete-modal-backdrop">

                    <div className="bakery-product-delete-modal">

                        {/* Delete confirmation heading */}
                        <h2 className="bakery-product-delete-modal-title">
                            Delete product?
                        </h2>

                        {/* Delete confirmation message */}
                        <p className="bakery-product-delete-modal-description">
                            Delete <strong>"{productToDelete.name}"</strong>?
                            This action cannot be undone.
                        </p>

                        {/* Delete confirmation actions */}
                        <div className="d-flex justify-content-end align-items-center gap-2 mt-4">

                            {/* Cancel Product deletion */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-secondary-button"
                                onClick={() => setProductToDelete(null)}
                                disabled={isProductDeleting}
                            >
                                Cancel
                            </button>

                            {/* Confirm Product deletion */}
                            <button
                                type="button"
                                className="btn bakery-product-delete-confirm-button"
                                onClick={handleDeleteProduct}
                                disabled={isProductDeleting}
                            >
                                {isProductDeleting
                                    ? "Deleting..."
                                    : "Delete product"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}