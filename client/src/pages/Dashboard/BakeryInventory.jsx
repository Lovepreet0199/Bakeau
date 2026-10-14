import API_URL from "../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import Inventory icons
import {
    AlertTriangle,
    Boxes,
    CircleCheck,
    CircleOff,
    LoaderCircle,
    Package,
    Pencil,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Inventory styles
import "./styles/Inventory.css";


//Returns a tracked inventory status using quantity and threshold
function getTrackedInventoryStatus(
    quantity,
    lowStockThreshold
) {

    const currentQuantity =
        Number(quantity ?? 0);

    const threshold =
        Number(lowStockThreshold ?? 0);


    //No stock remaining
    if (currentQuantity <= 0) {
        return "out_of_stock";
    }


    //Stock has reached the warning threshold
    if (currentQuantity <= threshold) {
        return "low_stock";
    }


    //Enough stock is available
    return "in_stock";
}


//Returns the Product inventory status
function getProductInventoryStatus(product) {

    //Made-to-order Products do not use quantity tracking
    if (
        product.stock_type === "made_to_order"
    ) {
        return "made_to_order";
    }


    //Return tracked Product inventory status
    return getTrackedInventoryStatus(
        product.inventory_quantity,
        product.low_inventory_threshold
    );
}


//Returns the Ingredient inventory status
function getIngredientStatus(ingredient) {

    return getTrackedInventoryStatus(
        ingredient.quantity,
        ingredient.low_stock_threshold
    );
}


//Returns the text shown for an inventory status
function getStatusLabel(status) {

    if (status === "made_to_order") {
        return "Made to Order";
    }


    if (status === "out_of_stock") {
        return "Out of Stock";
    }


    if (status === "low_stock") {
        return "Low Stock";
    }


    return "In Stock";
}


//Sorts Ingredients alphabetically
function sortIngredients(ingredients) {

    return [...ingredients].sort(
        (firstIngredient, secondIngredient) =>
            firstIngredient.name.localeCompare(
                secondIngredient.name
            )
    );
}


//Displays and manages Bakery inventory
export default function BakeryInventory() {

    //Tracks the selected Inventory tab
    const [activeTab, setActiveTab] =
        useState("products");

    //Stores Bakery Products
    const [products, setProducts] =
        useState([]);

    //Stores Bakery Ingredients
    const [ingredients, setIngredients] =
        useState([]);

    //Tracks Inventory loading
    const [isLoading, setIsLoading] =
        useState(true);

    //Stores Inventory errors
    const [error, setError] =
        useState("");

    //Stores search text
    const [searchTerm, setSearchTerm] =
        useState("");


    //Stores the Product being adjusted
    const [adjustingProduct, setAdjustingProduct] =
        useState(null);

    //Stores Product inventory values
    const [
        productInventoryForm,
        setProductInventoryForm
    ] = useState({
        inventory_quantity: "",
        low_inventory_threshold: ""
    });

    //Tracks Product inventory saving
    const [
        isSavingProductInventory,
        setIsSavingProductInventory
    ] = useState(false);


    //Tracks whether the Ingredient form is open
    const [
        isIngredientFormOpen,
        setIsIngredientFormOpen
    ] = useState(false);

    //Stores the Ingredient being edited
    const [
        editingIngredient,
        setEditingIngredient
    ] = useState(null);

    //Tracks Ingredient saving
    const [
        isSavingIngredient,
        setIsSavingIngredient
    ] = useState(false);

    //Tracks Ingredient deletion
    const [
        deletingIngredientId,
        setDeletingIngredientId
    ] = useState(null);

    //Stores Ingredient form values
    const [
        ingredientForm,
        setIngredientForm
    ] = useState({
        name: "",
        unit: "",
        quantity: "",
        low_stock_threshold: ""
    });


    //Load Product and Ingredient inventory
    useEffect(() => {

        let isCancelled = false;


        async function loadInventory() {

            setIsLoading(true);
            setError("");


            try {

                //Get the logged-in Bakery Owner token
                const token = getAuthToken();


                //Load Products and Ingredients together
                const [
                    productsResponse,
                    ingredientsResponse
                ] = await Promise.all([

                    fetch(
                        `${API_URL}/api/products`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    ),

                    fetch(
                        `${API_URL}/api/ingredients`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )

                ]);


                //Convert API responses
                const productsData =
                    await productsResponse.json();

                const ingredientsData =
                    await ingredientsResponse.json();


                //Stop if Products could not be loaded
                if (!productsResponse.ok) {

                    throw new Error(
                        productsData.errors?.[0]?.msg ||
                        productsData.message ||
                        "Unable to load products"
                    );
                }


                //Stop if Ingredients could not be loaded
                if (!ingredientsResponse.ok) {

                    throw new Error(
                        ingredientsData.errors?.[0]?.msg ||
                        ingredientsData.message ||
                        "Unable to load ingredients"
                    );
                }


                //Store loaded Inventory data
                if (!isCancelled) {

                    setProducts(
                        productsData.products || []
                    );

                    setIngredients(
                        sortIngredients(
                            ingredientsData.ingredients || []
                        )
                    );
                }


            } catch (error) {

                if (!isCancelled) {
                    setError(error.message);
                }


            } finally {

                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }


        loadInventory();


        //Stops state changes if the page closes
        return () => {
            isCancelled = true;
        };

    }, []);


    //Opens the Product inventory adjustment form
    function openProductInventory(product) {

        //Only tracked Products can have quantity adjusted here
        if (
            product.stock_type === "made_to_order"
        ) {
            return;
        }


        setAdjustingProduct(product);

        setProductInventoryForm({
            inventory_quantity:
                product.inventory_quantity ?? 0,

            low_inventory_threshold:
                product.low_inventory_threshold ?? 0
        });

        setError("");
    }


    //Closes the Product inventory adjustment form
    function closeProductInventory() {

        setAdjustingProduct(null);

        setProductInventoryForm({
            inventory_quantity: "",
            low_inventory_threshold: ""
        });

        setError("");
    }


    //Updates Product inventory form values
    function handleProductInventoryChange(event) {

        const {
            name,
            value
        } = event.target;


        setProductInventoryForm(
            (currentForm) => ({
                ...currentForm,
                [name]: value
            })
        );
    }


    //Updates Product inventory
    async function saveProductInventory(event) {

        event.preventDefault();


        //Stop if there is no Product selected
        if (!adjustingProduct) {
            return;
        }


        setIsSavingProductInventory(true);
        setError("");


        try {

            //Get the logged-in Bakery Owner token
            const token = getAuthToken();


            //Update only the Product inventory values
            const response = await fetch(
                `${API_URL}/api/products/${adjustingProduct._id}/inventory`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        inventory_quantity:
                            Number(
                                productInventoryForm
                                    .inventory_quantity
                            ),

                        low_inventory_threshold:
                            Number(
                                productInventoryForm
                                    .low_inventory_threshold
                            )
                    })
                }
            );


            const data =
                await response.json();


            //Stop if Product inventory could not be updated
            if (!response.ok) {

                throw new Error(
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to update product inventory"
                );
            }


            //Replace the Product with the updated Product
            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (product) =>
                            product._id ===
                                adjustingProduct._id
                                ? data.product
                                : product
                    )
            );


            //Close the Product inventory form
            closeProductInventory();


        } catch (error) {

            setError(error.message);


        } finally {

            setIsSavingProductInventory(false);
        }
    }


    //Opens the Add Ingredient form
    function openAddIngredient() {

        setEditingIngredient(null);

        setIngredientForm({
            name: "",
            unit: "",
            quantity: "",
            low_stock_threshold: ""
        });

        setError("");

        setIsIngredientFormOpen(true);
    }


    //Opens the Edit Ingredient form
    function openEditIngredient(ingredient) {

        setEditingIngredient(ingredient);

        setIngredientForm({
            name:
                ingredient.name || "",

            unit:
                ingredient.unit || "",

            quantity:
                ingredient.quantity ?? "",

            low_stock_threshold:
                ingredient.low_stock_threshold ?? ""
        });

        setError("");

        setIsIngredientFormOpen(true);
    }


    //Closes the Ingredient form
    function closeIngredientForm() {

        setEditingIngredient(null);

        setIngredientForm({
            name: "",
            unit: "",
            quantity: "",
            low_stock_threshold: ""
        });

        setError("");

        setIsIngredientFormOpen(false);
    }


    //Updates Ingredient form values
    function handleIngredientChange(event) {

        const {
            name,
            value
        } = event.target;


        setIngredientForm(
            (currentForm) => ({
                ...currentForm,
                [name]: value
            })
        );
    }


    //Creates or updates an Ingredient
    async function saveIngredient(event) {

        event.preventDefault();

        setIsSavingIngredient(true);
        setError("");


        try {

            //Get the logged-in Bakery Owner token
            const token = getAuthToken();


            //Determine whether this is create or update
            const url = editingIngredient
                ? `${API_URL}/api/ingredients/${editingIngredient._id}`
                : `${API_URL}/api/ingredients`;


            const method = editingIngredient
                ? "PATCH"
                : "POST";


            //Save the Ingredient
            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        name:
                            ingredientForm.name.trim(),

                        unit:
                            ingredientForm.unit.trim(),

                        quantity:
                            Number(
                                ingredientForm.quantity
                            ),

                        low_stock_threshold:
                            Number(
                                ingredientForm
                                    .low_stock_threshold
                            )
                    })
                }
            );


            const data =
                await response.json();


            //Stop if the Ingredient could not be saved
            if (!response.ok) {

                throw new Error(
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to save ingredient"
                );
            }


            //Update an existing Ingredient
            if (editingIngredient) {

                setIngredients(
                    (currentIngredients) =>
                        sortIngredients(
                            currentIngredients.map(
                                (ingredient) =>
                                    ingredient._id ===
                                        editingIngredient._id
                                        ? data.ingredient
                                        : ingredient
                            )
                        )
                );

            } else {

                //Add the newly created Ingredient
                setIngredients(
                    (currentIngredients) =>
                        sortIngredients([
                            ...currentIngredients,
                            data.ingredient
                        ])
                );
            }


            //Close the Ingredient form
            closeIngredientForm();


        } catch (error) {

            setError(error.message);


        } finally {

            setIsSavingIngredient(false);
        }
    }


    //Deletes an Ingredient
    async function deleteIngredient(ingredient) {

        const confirmed =
            window.confirm(
                `Delete "${ingredient.name}" from inventory?`
            );


        if (!confirmed) {
            return;
        }


        setDeletingIngredientId(
            ingredient._id
        );

        setError("");


        try {

            //Get the logged-in Bakery Owner token
            const token = getAuthToken();


            //Delete the Ingredient
            const response = await fetch(
                `${API_URL}/api/ingredients/${ingredient._id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            //Stop if deletion failed
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete ingredient"
                );
            }


            //Remove the Ingredient from the page
            setIngredients(
                (currentIngredients) =>
                    currentIngredients.filter(
                        (currentIngredient) =>
                            currentIngredient._id !==
                            ingredient._id
                    )
            );


        } catch (error) {

            setError(error.message);


        } finally {

            setDeletingIngredientId(null);
        }
    }


    //Filter Products using search
    const filteredProducts =
        products.filter((product) =>
            product.name
                ?.toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
        );


    //Filter Ingredients using search
    const filteredIngredients =
        ingredients.filter((ingredient) =>
            ingredient.name
                ?.toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
        );


    //Find Products currently low or out of stock
    const lowStockProducts =
        products.filter((product) => {

            const status =
                getProductInventoryStatus(
                    product
                );


            return (
                status === "low_stock" ||
                status === "out_of_stock"
            );
        });


    //Find Ingredients currently low or out of stock
    const lowStockIngredients =
        ingredients.filter((ingredient) => {

            const status =
                getIngredientStatus(
                    ingredient
                );


            return (
                status === "low_stock" ||
                status === "out_of_stock"
            );
        });


    //Preview Product status using entered inventory values
    const productInventoryPreviewStatus =
        getTrackedInventoryStatus(
            productInventoryForm.inventory_quantity,
            productInventoryForm.low_inventory_threshold
        );


    return (
        <div className="bakery-inventory-page">

            {/* Inventory heading */}
            <div className="bakery-inventory-heading">

                <div>

                    <h1>
                        Inventory
                    </h1>

                    <p>
                        Track product availability and
                        ingredient stock for your bakery.
                    </p>

                </div>


                {/* Add Ingredient button */}
                {activeTab === "ingredients" && (

                    <button
                        type="button"
                        className="bakery-inventory-primary-button"
                        onClick={openAddIngredient}
                    >
                        <Plus
                            size={17}
                            strokeWidth={2}
                        />

                        Add ingredient
                    </button>

                )}

            </div>


            {/* Inventory tabs */}
            <div className="bakery-inventory-tabs">

                {/* Product Availability tab */}
                <button
                    type="button"
                    className={`bakery-inventory-tab ${
                        activeTab === "products"
                            ? "active"
                            : ""
                    }`}
                    onClick={() => {

                        setActiveTab("products");
                        setSearchTerm("");
                        setError("");

                    }}
                >
                    <Package
                        size={16}
                        strokeWidth={1.8}
                    />

                    Product Availability

                    <span className="bakery-inventory-tab-count">
                        {products.length}
                    </span>
                </button>


                {/* Ingredients tab */}
                <button
                    type="button"
                    className={`bakery-inventory-tab ${
                        activeTab === "ingredients"
                            ? "active"
                            : ""
                    }`}
                    onClick={() => {

                        setActiveTab("ingredients");
                        setSearchTerm("");
                        setError("");

                    }}
                >
                    <Boxes
                        size={16}
                        strokeWidth={1.8}
                    />

                    Ingredients

                    <span className="bakery-inventory-tab-count">
                        {ingredients.length}
                    </span>
                </button>

            </div>


            {/* Error message */}
            {error &&
                !adjustingProduct &&
                !isIngredientFormOpen && (

                    <div className="bakery-inventory-error">
                        {error}
                    </div>

                )}


            {/* Loading state */}
            {isLoading && (

                <div className="bakery-inventory-loading">

                    <LoaderCircle
                        size={26}
                        strokeWidth={1.8}
                    />

                    <div>

                        <strong>
                            Loading inventory
                        </strong>

                        <span>
                            Getting your latest stock information...
                        </span>

                    </div>

                </div>

            )}


            {!isLoading && (
                <>

                    {/* Product low stock warning */}
                    {activeTab === "products" &&
                        lowStockProducts.length > 0 && (

                            <div className="bakery-inventory-warning">

                                <AlertTriangle
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <div>

                                    <strong>
                                        Product stock needs attention
                                    </strong>

                                    <p>
                                        {lowStockProducts.length}{" "}
                                        product
                                        {lowStockProducts.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                        are low or out of stock.
                                    </p>

                                </div>

                            </div>

                        )}


                    {/* Ingredient low stock warning */}
                    {activeTab === "ingredients" &&
                        lowStockIngredients.length > 0 && (

                            <div className="bakery-inventory-warning">

                                <AlertTriangle
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <div>

                                    <strong>
                                        Ingredient stock needs attention
                                    </strong>

                                    <p>
                                        {lowStockIngredients.length}{" "}
                                        ingredient
                                        {lowStockIngredients.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                        are low or out of stock.
                                    </p>

                                </div>

                            </div>

                        )}


                    {/* Inventory search */}
                    <div className="bakery-inventory-toolbar">

                        <div className="bakery-inventory-search">

                            <Search
                                size={17}
                                strokeWidth={1.8}
                            />

                            <input
                                type="search"
                                className="form-control"
                                placeholder={
                                    activeTab === "products"
                                        ? "Search products"
                                        : "Search ingredients"
                                }
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* Product Availability */}
                    {activeTab === "products" && (

                        <div className="bakery-inventory-card">

                            <div className="bakery-inventory-card-heading">

                                <div>

                                    <h2>
                                        Product availability
                                    </h2>

                                    <p>
                                        Monitor stock levels for
                                        products in your storefront.
                                    </p>

                                </div>

                            </div>


                            <div className="table-responsive">

                                <table className="table bakery-inventory-table">

                                    <thead>

                                        <tr>
                                            <th>Product</th>
                                            <th>Available</th>
                                            <th>Low stock at</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredProducts.map(
                                            (product) => {

                                                const status =
                                                    getProductInventoryStatus(
                                                        product
                                                    );


                                                return (

                                                    <tr key={product._id}>

                                                        {/* Product */}
                                                        <td>

                                                            <div className="bakery-inventory-product">

                                                                <div className="bakery-inventory-product-image">

                                                                    {product.image_url ? (

                                                                        <img
                                                                            src={product.image_url}
                                                                            alt={product.name}
                                                                        />

                                                                    ) : (

                                                                        <Package
                                                                            size={18}
                                                                            strokeWidth={1.8}
                                                                        />

                                                                    )}

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {product.name}
                                                                    </strong>

                                                                    <span>

                                                                        {product.stock_type ===
                                                                        "made_to_order"
                                                                            ? "Made to order"
                                                                            : "Tracked inventory"}

                                                                        {!product.is_available &&
                                                                            " · Ordering paused"}

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* Available quantity */}
                                                        <td>

                                                            {product.stock_type ===
                                                            "made_to_order"
                                                                ? "—"
                                                                : product.inventory_quantity ?? 0}

                                                        </td>


                                                        {/* Low stock threshold */}
                                                        <td>

                                                            {product.stock_type ===
                                                            "made_to_order"
                                                                ? "—"
                                                                : product.low_inventory_threshold ?? 0}

                                                        </td>


                                                        {/* Inventory status */}
                                                        <td>

                                                            <span
                                                                className={`bakery-inventory-status ${status}`}
                                                            >

                                                                {status ===
                                                                    "in_stock" && (
                                                                    <CircleCheck
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {status ===
                                                                    "out_of_stock" && (
                                                                    <CircleOff
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {status ===
                                                                    "low_stock" && (
                                                                    <AlertTriangle
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {status ===
                                                                    "made_to_order" && (
                                                                    <Package
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {getStatusLabel(
                                                                    status
                                                                )}

                                                            </span>

                                                        </td>


                                                        {/* Product actions */}
                                                        <td className="text-end">

                                                            {product.stock_type ===
                                                            "made_to_order" ? (

                                                                <span className="text-muted small">
                                                                    Not tracked
                                                                </span>

                                                            ) : (

                                                                <button
                                                                    type="button"
                                                                    className="bakery-inventory-adjust-button"
                                                                    onClick={() =>
                                                                        openProductInventory(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil
                                                                        size={14}
                                                                        strokeWidth={1.8}
                                                                    />

                                                                    Adjust
                                                                </button>

                                                            )}

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* Empty Product state */}
                            {filteredProducts.length === 0 && (

                                <div className="bakery-inventory-empty">

                                    <Package
                                        size={29}
                                        strokeWidth={1.6}
                                    />

                                    <h3>
                                        {searchTerm
                                            ? "No matching products"
                                            : "No products found"}
                                    </h3>

                                    <p>

                                        {searchTerm
                                            ? "Try searching for a different product."
                                            : "Products added to your bakery will appear here."}

                                    </p>

                                </div>

                            )}

                        </div>

                    )}


                    {/* Ingredient Inventory */}
                    {activeTab === "ingredients" && (

                        <div className="bakery-inventory-card">

                            <div className="bakery-inventory-card-heading">

                                <div>

                                    <h2>
                                        Ingredients
                                    </h2>

                                    <p>
                                        Track ingredient quantities and
                                        receive low stock warnings.
                                    </p>

                                </div>

                            </div>


                            <div className="table-responsive">

                                <table className="table bakery-inventory-table">

                                    <thead>

                                        <tr>
                                            <th>Ingredient</th>
                                            <th>Unit</th>
                                            <th>Remaining</th>
                                            <th>Low stock at</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredIngredients.map(
                                            (ingredient) => {

                                                const status =
                                                    getIngredientStatus(
                                                        ingredient
                                                    );


                                                return (

                                                    <tr key={ingredient._id}>

                                                        {/* Ingredient name */}
                                                        <td>

                                                            <strong>
                                                                {ingredient.name}
                                                            </strong>

                                                        </td>


                                                        {/* Ingredient unit */}
                                                        <td>
                                                            {ingredient.unit}
                                                        </td>


                                                        {/* Remaining quantity */}
                                                        <td>
                                                            {ingredient.quantity}
                                                        </td>


                                                        {/* Low stock threshold */}
                                                        <td>
                                                            {ingredient.low_stock_threshold}
                                                        </td>


                                                        {/* Ingredient status */}
                                                        <td>

                                                            <span
                                                                className={`bakery-inventory-status ${status}`}
                                                            >

                                                                {status ===
                                                                    "in_stock" && (
                                                                    <CircleCheck
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {status ===
                                                                    "low_stock" && (
                                                                    <AlertTriangle
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {status ===
                                                                    "out_of_stock" && (
                                                                    <CircleOff
                                                                        size={13}
                                                                    />
                                                                )}


                                                                {getStatusLabel(
                                                                    status
                                                                )}

                                                            </span>

                                                        </td>


                                                        {/* Ingredient actions */}
                                                        <td>

                                                            <div className="bakery-inventory-row-actions">

                                                                <button
                                                                    type="button"
                                                                    className="bakery-inventory-icon-button"
                                                                    aria-label={`Edit ${ingredient.name}`}
                                                                    onClick={() =>
                                                                        openEditIngredient(
                                                                            ingredient
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil
                                                                        size={15}
                                                                        strokeWidth={1.8}
                                                                    />
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="bakery-inventory-icon-button danger"
                                                                    aria-label={`Delete ${ingredient.name}`}
                                                                    disabled={
                                                                        deletingIngredientId ===
                                                                        ingredient._id
                                                                    }
                                                                    onClick={() =>
                                                                        deleteIngredient(
                                                                            ingredient
                                                                        )
                                                                    }
                                                                >

                                                                    {deletingIngredientId ===
                                                                    ingredient._id ? (

                                                                        <LoaderCircle
                                                                            size={15}
                                                                            className="bakery-inventory-small-spinner"
                                                                        />

                                                                    ) : (

                                                                        <Trash2
                                                                            size={15}
                                                                            strokeWidth={1.8}
                                                                        />

                                                                    )}

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* Empty Ingredient state */}
                            {filteredIngredients.length === 0 && (

                                <div className="bakery-inventory-empty">

                                    <Boxes
                                        size={29}
                                        strokeWidth={1.6}
                                    />

                                    <h3>

                                        {searchTerm
                                            ? "No matching ingredients"
                                            : "No ingredients yet"}

                                    </h3>

                                    <p>

                                        {searchTerm
                                            ? "Try searching for a different ingredient."
                                            : "Add ingredients to start tracking your bakery stock."}

                                    </p>


                                    {!searchTerm && (

                                        <button
                                            type="button"
                                            className="bakery-inventory-primary-button"
                                            onClick={openAddIngredient}
                                        >
                                            <Plus
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            Add ingredient
                                        </button>

                                    )}

                                </div>

                            )}

                        </div>

                    )}

                </>
            )}


            {/* Product inventory adjustment modal */}
            {adjustingProduct && (

                <div className="bakery-inventory-modal-backdrop">

                    <div className="bakery-inventory-modal">

                        {/* Modal heading */}
                        <div className="bakery-inventory-modal-heading">

                            <div>

                                <h2>
                                    Adjust inventory
                                </h2>

                                <p>
                                    Update stock information for{" "}
                                    <strong>
                                        {adjustingProduct.name}
                                    </strong>.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="bakery-inventory-modal-close"
                                aria-label="Close"
                                onClick={closeProductInventory}
                                disabled={
                                    isSavingProductInventory
                                }
                            >
                                <X
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </button>

                        </div>


                        {/* Product inventory error */}
                        {error && (

                            <div className="bakery-inventory-error">
                                {error}
                            </div>

                        )}


                        {/* Product inventory form */}
                        <form
                            onSubmit={saveProductInventory}
                        >

                            <div className="row g-3">

                                {/* Available quantity */}
                                <div className="col-12 col-md-6">

                                    <label
                                        htmlFor="productInventoryQuantity"
                                        className="form-label"
                                    >
                                        Available quantity
                                    </label>

                                    <input
                                        type="number"
                                        id="productInventoryQuantity"
                                        name="inventory_quantity"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={
                                            productInventoryForm
                                                .inventory_quantity
                                        }
                                        onChange={
                                            handleProductInventoryChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Low stock warning */}
                                <div className="col-12 col-md-6">

                                    <label
                                        htmlFor="productInventoryThreshold"
                                        className="form-label"
                                    >
                                        Low stock warning
                                    </label>

                                    <input
                                        type="number"
                                        id="productInventoryThreshold"
                                        name="low_inventory_threshold"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={
                                            productInventoryForm
                                                .low_inventory_threshold
                                        }
                                        onChange={
                                            handleProductInventoryChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Low stock helper */}
                                <div className="col-12">

                                    <span className="bakery-inventory-field-note">
                                        Bakeau will show a low stock warning
                                        when the available quantity reaches
                                        this amount.
                                    </span>

                                </div>

                            </div>


                            {/* Inventory status preview */}
                            <div className="d-flex align-items-center justify-content-between gap-3 mt-4 p-3 border rounded">

                                <span className="bakery-inventory-field-note m-0">
                                    Status after saving
                                </span>


                                <span
                                    className={`bakery-inventory-status ${productInventoryPreviewStatus}`}
                                >

                                    {productInventoryPreviewStatus ===
                                        "in_stock" && (
                                        <CircleCheck
                                            size={13}
                                        />
                                    )}


                                    {productInventoryPreviewStatus ===
                                        "low_stock" && (
                                        <AlertTriangle
                                            size={13}
                                        />
                                    )}


                                    {productInventoryPreviewStatus ===
                                        "out_of_stock" && (
                                        <CircleOff
                                            size={13}
                                        />
                                    )}


                                    {getStatusLabel(
                                        productInventoryPreviewStatus
                                    )}

                                </span>

                            </div>


                            {/* Modal actions */}
                            <div className="bakery-inventory-modal-actions">

                                <button
                                    type="button"
                                    className="bakery-inventory-secondary-button"
                                    onClick={closeProductInventory}
                                    disabled={
                                        isSavingProductInventory
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="bakery-inventory-primary-button"
                                    disabled={
                                        isSavingProductInventory
                                    }
                                >

                                    {isSavingProductInventory && (

                                        <LoaderCircle
                                            size={15}
                                            className="bakery-inventory-small-spinner"
                                        />

                                    )}


                                    {isSavingProductInventory
                                        ? "Saving..."
                                        : "Save changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* Add or Edit Ingredient modal */}
            {isIngredientFormOpen && (

                <div className="bakery-inventory-modal-backdrop">

                    <div className="bakery-inventory-modal">

                        {/* Modal heading */}
                        <div className="bakery-inventory-modal-heading">

                            <div>

                                <h2>

                                    {editingIngredient
                                        ? "Adjust ingredient"
                                        : "Add ingredient"}

                                </h2>

                                <p>

                                    {editingIngredient
                                        ? "Update this ingredient's stock information."
                                        : "Add an ingredient to your bakery inventory."}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="bakery-inventory-modal-close"
                                aria-label="Close"
                                onClick={closeIngredientForm}
                                disabled={
                                    isSavingIngredient
                                }
                            >
                                <X
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </button>

                        </div>


                        {/* Ingredient error */}
                        {error && (

                            <div className="bakery-inventory-error">
                                {error}
                            </div>

                        )}


                        {/* Ingredient form */}
                        <form
                            onSubmit={saveIngredient}
                        >

                            <div className="row g-3">

                                {/* Ingredient name */}
                                <div className="col-12">

                                    <label
                                        htmlFor="ingredientName"
                                        className="form-label"
                                    >
                                        Ingredient name
                                    </label>

                                    <input
                                        type="text"
                                        id="ingredientName"
                                        name="name"
                                        className="form-control"
                                        placeholder="e.g. Vanilla Buttercream"
                                        value={
                                            ingredientForm.name
                                        }
                                        onChange={
                                            handleIngredientChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Ingredient unit */}
                                <div className="col-12 col-md-6">

                                    <label
                                        htmlFor="ingredientUnit"
                                        className="form-label"
                                    >
                                        Unit
                                    </label>

                                    <input
                                        type="text"
                                        id="ingredientUnit"
                                        name="unit"
                                        className="form-control"
                                        placeholder="e.g. kg, bags, batches"
                                        value={
                                            ingredientForm.unit
                                        }
                                        onChange={
                                            handleIngredientChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Quantity */}
                                <div className="col-12 col-md-6">

                                    <label
                                        htmlFor="ingredientQuantity"
                                        className="form-label"
                                    >
                                        Current quantity
                                    </label>

                                    <input
                                        type="number"
                                        id="ingredientQuantity"
                                        name="quantity"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={
                                            ingredientForm.quantity
                                        }
                                        onChange={
                                            handleIngredientChange
                                        }
                                        required
                                    />

                                </div>


                                {/* Low stock threshold */}
                                <div className="col-12">

                                    <label
                                        htmlFor="ingredientThreshold"
                                        className="form-label"
                                    >
                                        Low stock threshold
                                    </label>

                                    <input
                                        type="number"
                                        id="ingredientThreshold"
                                        name="low_stock_threshold"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={
                                            ingredientForm
                                                .low_stock_threshold
                                        }
                                        onChange={
                                            handleIngredientChange
                                        }
                                        required
                                    />

                                    <span className="bakery-inventory-field-note">
                                        Bakeau will show a warning when
                                        the quantity reaches this amount.
                                    </span>

                                </div>

                            </div>


                            {/* Ingredient status preview */}
                            <div className="d-flex align-items-center justify-content-between gap-3 mt-4 p-3 border rounded">

                                <span className="bakery-inventory-field-note m-0">
                                    Status after saving
                                </span>


                                <span
                                    className={`bakery-inventory-status ${
                                        getTrackedInventoryStatus(
                                            ingredientForm.quantity,
                                            ingredientForm.low_stock_threshold
                                        )
                                    }`}
                                >

                                    {getTrackedInventoryStatus(
                                        ingredientForm.quantity,
                                        ingredientForm.low_stock_threshold
                                    ) === "in_stock" && (

                                        <CircleCheck
                                            size={13}
                                        />

                                    )}


                                    {getTrackedInventoryStatus(
                                        ingredientForm.quantity,
                                        ingredientForm.low_stock_threshold
                                    ) === "low_stock" && (

                                        <AlertTriangle
                                            size={13}
                                        />

                                    )}


                                    {getTrackedInventoryStatus(
                                        ingredientForm.quantity,
                                        ingredientForm.low_stock_threshold
                                    ) === "out_of_stock" && (

                                        <CircleOff
                                            size={13}
                                        />

                                    )}


                                    {getStatusLabel(
                                        getTrackedInventoryStatus(
                                            ingredientForm.quantity,
                                            ingredientForm.low_stock_threshold
                                        )
                                    )}

                                </span>

                            </div>


                            {/* Modal actions */}
                            <div className="bakery-inventory-modal-actions">

                                <button
                                    type="button"
                                    className="bakery-inventory-secondary-button"
                                    onClick={closeIngredientForm}
                                    disabled={
                                        isSavingIngredient
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="bakery-inventory-primary-button"
                                    disabled={
                                        isSavingIngredient
                                    }
                                >

                                    {isSavingIngredient && (

                                        <LoaderCircle
                                            size={15}
                                            className="bakery-inventory-small-spinner"
                                        />

                                    )}


                                    {isSavingIngredient
                                        ? "Saving..."
                                        : editingIngredient
                                            ? "Save changes"
                                            : "Add ingredient"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}