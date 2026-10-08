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

    //Loads the bakery products when the Products page opens
    useEffect(() => {

        //Gets the Bakery Owner products from the backend
        async function fetchProducts() {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Request the Bakery Owner's products
            const response = await fetch(
                "http://localhost:3000/api/products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            //Convert the response into JavaScript data
            const data = await response.json();

            //Store the products returned by the backend
            setProducts(data.products);

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

        //Shows only available products
        if (activeFilter === "active") {
            matchesFilter = product.is_available;
        }

        //Shows only unavailable products
        if (activeFilter === "inactive") {
            matchesFilter = !product.is_available;
        }

        //Shows only featured products
        if (activeFilter === "featured") {
            matchesFilter = product.is_featured;
        }

        return matchesSearch && matchesFilter;

    });

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
                        Active
                    </button>

                    <button
                        type="button"
                        className={`btn bakery-product-filter-button ${activeFilter === "inactive" ? "active" : ""}`}
                        onClick={() => setActiveFilter("inactive")}
                    >
                        Inactive
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

            {/* Products grid */}
            <div className="row g-3">

                {filteredProducts.map((product) => {

                    return (
                        /* Product column */
                        <div key={product._id} className="col-12 col-md-6 col-xl-4">

                            <ProductCard product={product} />

                        </div>
                    );
                })}

            </div>
        </div>
    );
}