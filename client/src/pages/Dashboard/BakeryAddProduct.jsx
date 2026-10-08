//Import React hooks used for the Add Product form
import { useState, useEffect, useCallback } from "react";

//Import the authentication token helper
import { getAuthToken } from "../../utils/authStorage";

//Import Add Product icons
import { ImagePlus } from "lucide-react";

//Import styles
import "./styles/AddProduct.css";

//Displays the Add Product page for Bakery Owners
export default function BakeryAddProduct() {

    //Tracks the current Add Product form step
    const [currentStep, setCurrentStep] = useState(1);

    //Stores the bakery currency used for product prices
    const [bakeryCurrency, setBakeryCurrency] = useState("CAD");

    //Tracks whether the product image is currently uploading
    const [isImageUploading, setIsImageUploading] = useState(false);

    //Stores any Basic Information validation error
    const [formError, setFormError] = useState("");

    //Stores the MongoDB Product ID after the product is first saved
    const [productId, setProductId] = useState(null);

    //Tracks whether the product is currently being saved
    const [isProductSaving, setIsProductSaving] = useState(false);

    //Stores customization groups for the current Product
    const [customizationGroups, setCustomizationGroups] = useState([]);

    //Stores the new customization group name
    const [newGroupName, setNewGroupName] = useState("");

    //Stores whether the new customization group is required
    const [newGroupRequired, setNewGroupRequired] = useState(false);

    ///Stores the Add Product form values
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        base_price: "",
        image_url: "",
        image_public_id: "",
        is_available: false,
        stock_type: "made_to_order",
        inventory_quantity: "",
        low_inventory_threshold: "5",
        minimum_preparation_notice: "24",
        maximum_orders_per_day: "",
        available_pickup_days: [],
        is_featured: false,
        payment_rule: "full_payment",
        deposit_percentage: "",
        cancellation_cutoff_hours: "24"
    });

    //Category options shown in the dropdown
    const categoryOptions = [
        "Cakes",
        "Cupcakes",
        "Cookies",
        "Pastries",
        "Bread",
        "Brownies",
        "Dessert Boxes",
        "Custom Orders"
    ];

    //Pickup day options shown in the Availability step
    const pickupDayOptions = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
    ];

    //Loads the Bakery Owner's currency when the page opens
    useEffect(() => {

        //Gets the Bakery Owner's bakery information
        async function fetchBakery() {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Request the Bakery Owner's bakery
            const response = await fetch(
                "http://localhost:3000/api/bakeries/mine",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            //Convert the response into JavaScript data
            const data = await response.json();

            //Store the bakery currency
            setBakeryCurrency(data.bakery.currency || "CAD");
        }

        //Run the function when the Add Product page loads
        fetchBakery();

    }, []);

    //Uploads the selected product image to Cloudinary
    async function handleImageUpload(event) {

        //Get the selected image file
        const imageFile = event.target.files[0];

        //Stop if no image was selected
        if (!imageFile) {
            return;
        }

        //Show the image upload loading state
        setIsImageUploading(true);

        try {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Create form data used to send the image file
            const imageFormData = new FormData();

            //Add the image using the field name expected by the backend
            imageFormData.append("product_image", imageFile);

            //Send the image to the backend
            const response = await fetch(
                "http://localhost:3000/api/products/uploads/image",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: imageFormData
                }
            );

            //Convert the response into JavaScript data
            const data = await response.json();

            //Stop if the image upload failed
            if (!response.ok) {
                throw new Error(data.message || "Unable to upload product image");
            }

            //Store the Cloudinary image information
            setFormData({
                ...formData,
                image_url: data.image_url,
                image_public_id: data.image_public_id
            });

        } catch (error) {

            console.error("Product image upload error:", error.message);

        } finally {

            //Remove the image upload loading state
            setIsImageUploading(false);
        }

    }

    //Validates Basic Information before moving to Availability
    function handleBasicInfoContinue() {

        //Check that all required Basic Information fields are complete
        if (
            !formData.name.trim() ||
            !formData.category.trim() ||
            !formData.description.trim() ||
            !formData.base_price ||
            !formData.image_url
        ) {
            setFormError("Please complete all required product information.");
            return;
        }

        //Clear any previous validation error
        setFormError("");

        //Move to the Availability step
        setCurrentStep(2);
    }

    //Validates Availability before moving to the next step
    function handleAvailabilityContinue() {

        //Check inventory fields only when inventory tracking is enabled
        if (
            formData.stock_type === "track_inventory" &&
            (
                formData.inventory_quantity === "" ||
                formData.low_inventory_threshold === ""
            )
        ) {
            setFormError("Please complete the inventory information.");
            return;
        }

        //Check that preparation notice has been entered
        if (formData.minimum_preparation_notice === "") {
            setFormError("Please enter the minimum preparation notice.");
            return;
        }

        //Clear any previous validation error
        setFormError("");

        //Move to the Payment step
        setCurrentStep(3);

    }

    //Validates Payment settings before moving to the next step
    async function handlePaymentContinue() {

        //Check deposit percentage only when deposit payment is selected
        if (
            formData.payment_rule === "deposit" &&
            (
                formData.deposit_percentage === "" ||
                Number(formData.deposit_percentage) < 1 ||
                Number(formData.deposit_percentage) > 100
            )
        ) {
            setFormError("Please enter a deposit percentage between 1 and 100.");
            return;
        }

        //Check that the cancellation cutoff has been entered
        if (
            formData.cancellation_cutoff_hours === "" ||
            Number(formData.cancellation_cutoff_hours) < 0
        ) {
            setFormError("Please enter a valid cancellation cutoff.");
            return;
        }

        //Clear any previous validation error
        setFormError("");
        setIsProductSaving(true);

        try {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Prepare the Product information for the backend
            const productData = {
                ...formData,

                //Keep the Product private until the Option step is final
                status: "draft",
                is_available: false,

                //Send null when no daily order limit is selected
                maximum_orders_per_day:
                    formData.maximum_orders_per_day === ""
                        ? null
                        : formData.maximum_orders_per_day,

                //Deposit percentage is only used for deposit payments
                deposit_percentage:
                    formData.payment_rule === "deposit"
                        ? formData.deposit_percentage
                        : null
            };

            let response;

            //Create the Product only if it does not exist yet
            if (!productId) {
                response = await fetch(
                    "http://localhost:3000/api/products",
                    {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(productData)
                    }
                );

            } else {

                //Update the existing draft id the Product was already created
                response = await fetch(
                    `http://localhost:3000/api/products/${productId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(productData)
                    }
                );
            }
            //Convert the response into JavaScript data
            const data = await response.json();

            //Stop if the Product could not be saved
            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.errors?.[0]?.msg ||
                    "Unable to save product"
                );
            }

            //Store the real MongoDB Product ID after the first save
            if (!productId) {
                setProductId(data.product._id);
            }

            //Only open Options after the Product exists in MongoDB
            setCurrentStep(4);

        } catch (error) {

            //Stay on Payment if saving the Product failed
            setFormError(error.message);

        } finally {

            //Remove the loading state
            setIsProductSaving(false);
        }
    }

    //Creates a customization group for the current Product
    async function handleAddCustomizationGroup() {

        //Do not create an empty group
        if (!newGroupName.trim()) {
            setFormError("Please enter an option group name.");
            return;
        }

        try {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Create the customization group using the saved Product ID
            const response = await fetch(
                `http://localhost:3000/api/customizations/products/${productId}/groups`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: newGroupName,
                        is_required: newGroupRequired
                    })
                }
            );

            //Convert the response into JavaScript data
            const data = await response.json();

            //Stop if the group could not be created
            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to create customization group"
                );
            }

            //Clear the input after the group is created
            setNewGroupName("");
            setNewGroupRequired(false);
            setFormError("");


            //Reload the Product's customization groups
            await fetchCustomizationGroups();

        } catch (error) {
            setFormError(error.message);
        }
    }

    //Loads customization groups for the current Product
    const fetchCustomizationGroups = useCallback(async () => {

        try {

            //Get the logged-in user's JWT token
            const token = getAuthToken();

            //Request all customization groups for this Product
            const response = await fetch(
                `http://localhost:3000/api/customizations/products/${productId}/groups`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            //Convert the response into JavaScript data
            const data = await response.json();

            //Stop if the groups could not be loaded
            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load customization groups"
                );
            }

            //Store the real database groups
            setCustomizationGroups(data.customizationGroups);

        } catch (error) {
            setFormError(error.message);
        }

    }, [productId]);

    //Loads customization groups when the Options step opens
    useEffect(() => {

        if (currentStep === 4 && productId) {
            fetchCustomizationGroups();
        }

    }, [currentStep, productId, fetchCustomizationGroups]);

    return (
        <div className="bakery-dashboard-content">

            {/* Add Product breadcrumb */}
            <div className="d-flex align-items-center gap-2 mb-3 bakery-add-product-breadcrumb">
                <span>Products</span>
                <span>/</span>
                <span className="fw-semibold">Add product</span>
            </div>

            {/* Add Product page heading */}
            <div className="mb-4">
                <h1 className="mb-1">Add product</h1>

                <p className="mb-0 bakery-add-product-description">
                    Create a new product for your bakery storefront.
                </p>
            </div>

            {/* Add Product steps */}
            <div className="d-flex align-items-center mb-4 bakery-add-product-steps">

                {/* Basic information step */}
                <div className="d-flex align-items-center gap-2">

                    <span className={`bakery-add-product-step-number ${currentStep === 1 ? "active" : ""}`}>
                        1
                    </span>

                    <span className="bakery-add-product-step-label">
                        Basic info
                    </span>

                </div>

                {/* Step connector */}
                <div className="bakery-add-product-step-line"></div>

                {/* Availability step */}
                <div className="d-flex align-items-center gap-2">

                    <span className={`bakery-add-product-step-number ${currentStep === 2 ? "active" : ""}`}>
                        2
                    </span>

                    <span className="bakery-add-product-step-label">
                        Availability
                    </span>

                </div>

                {/* Step connector */}
                <div className="bakery-add-product-step-line"></div>

                {/* Payment step */}
                <div className="d-flex align-items-center gap-2">
                    <span className={`bakery-add-product-step-number ${currentStep === 3 ? "active" : ""}`}>
                        3
                    </span>

                    <span className="bakery-add-product-step-label">
                        Payment
                    </span>
                </div>

                {/* Step connector */}
                <div className="bakery-add-product-step-line"></div>

                {/* Options step */}
                <div className="d-flex align-items-center gap-2">
                    <span className={`bakery-add-product-step-number ${currentStep === 4 ? "active" : ""}`}>
                        4
                    </span>

                    <span className="bakery-add-product-step-label">
                        Options
                    </span>
                </div>

            </div>

            {currentStep === 1 && (
                <div className="card bakery-add-product-card">
                    <div className="card-body">

                        {/* Product name */}
                        <div className="mb-3">

                            <label
                                htmlFor="productName"
                                className="form-label bakery-add-product-label"
                            >
                                Product name
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <input
                                type="text"
                                id="productName"
                                className="form-control bakery-add-product-input"
                                placeholder="e.g. Chocolate Drip Cake"
                                value={formData.name}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        name: event.target.value
                                    })
                                }
                            />

                        </div>

                        {/* Product category */}
                        <div className="mb-3">
                            <label
                                htmlFor="productCategory"
                                className="form-label bakery-add-product-label"
                            >
                                Category
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <select
                                id="productCategory"
                                className="form-select bakery-add-product-input"
                                value={formData.category}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        category: event.target.value
                                    })
                                }
                            >
                                <option value="">
                                    Select a category
                                </option>

                                {categoryOptions.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product description */}
                        <div className="mb-3">

                            <label
                                htmlFor="productDescription"
                                className="form-label bakery-add-product-label"
                            >
                                Description
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <textarea
                                id="productDescription"
                                className="form-control bakery-add-product-input bakery-add-product-textarea"
                                placeholder="Describe your product, ingredients, and what makes it special..."
                                rows="5"
                                value={formData.description}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        description: event.target.value
                                    })
                                }
                            />

                        </div>

                        {/* Product base price */}
                        <div className="mb-3">

                            <label
                                htmlFor="productPrice"
                                className="form-label bakery-add-product-label"
                            >
                                Base price
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <div className="input-group">

                                {/* Bakery currency */}
                                <span className="input-group-text bakery-add-product-price-symbol">
                                    {bakeryCurrency}
                                </span>

                                {/* Product price */}
                                <input
                                    type="number"
                                    id="productPrice"
                                    className="form-control bakery-add-product-input"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    value={formData.base_price}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            base_price: event.target.value
                                        })
                                    }
                                />

                            </div>

                        </div>

                        {/* Product image */}
                        <div className="mb-3">

                            <label
                                htmlFor="productImage"
                                className="form-label bakery-add-product-label"
                            >
                                Product image
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <div className="bakery-add-product-image-upload text-center">

                                {formData.image_url ? (
                                    <>
                                        {/* Uploaded product image preview */}
                                        <img
                                            src={formData.image_url}
                                            alt="Product preview"
                                            className="bakery-add-product-image-preview"
                                        />

                                        <p className="bakery-add-product-image-success mb-3">
                                            Image uploaded successfully
                                        </p>

                                        {/* Allows the Bakery Owner to replace the image */}
                                        <label
                                            htmlFor="productImage"
                                            className={`btn bakery-add-product-image-button ${isImageUploading ? "uploading" : ""
                                                }`}
                                        >
                                            {isImageUploading ? "Uploading..." : "Change image"}
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus size={28} strokeWidth={1.8} />

                                        <p className="bakery-add-product-image-title mb-1">
                                            Upload product image
                                        </p>

                                        <p className="bakery-add-product-image-description mb-3">
                                            JPG, PNG or WebP
                                        </p>

                                        <label
                                            htmlFor="productImage"
                                            className={`btn bakery-add-product-image-button ${isImageUploading ? "uploading" : ""
                                                }`}
                                        >
                                            {isImageUploading ? "Uploading..." : "Choose image"}
                                        </label>
                                    </>
                                )}

                                <input
                                    type="file"
                                    id="productImage"
                                    className="d-none"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                />

                            </div>

                        </div>


                        {/* Basic Information validation error */}
                        {formError && (
                            <p className="bakery-add-product-error mb-3">
                                {formError}
                            </p>
                        )}

                        {/* Basic Information navigation */}
                        <div className="d-flex justify-content-end mt-4">
                            <button
                                type="button"
                                className="btn bakery-dashboard-primary-button"
                                onClick={handleBasicInfoContinue}
                            >
                                Continue
                            </button>
                        </div>

                    </div>


                </div>
            )}

            {currentStep === 2 && (
                <div className="card bakery-add-product-card">
                    <div className="card-body">

                        {/* Availability heading */}
                        <div className="mb-4">
                            <h2 className="bakery-add-product-section-title mb-1">
                                Availability
                            </h2>

                            <p className="bakery-add-product-field-description mb-0">
                                Control how this product is prepared and available for ordering.
                            </p>
                        </div>

                        {/* Stock type */}
                        <div className="mb-4">
                            <label
                                htmlFor="stockType"
                                className="form-label bakery-add-product-label"
                            >
                                Stock type
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <select
                                id="stockType"
                                className="form-select bakery-add-product-input"
                                value={formData.stock_type}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        stock_type: event.target.value
                                    })
                                }
                            >
                                <option value="made_to_order">
                                    Made to order
                                </option>

                                <option value="track_inventory">
                                    Track inventory
                                </option>
                            </select>

                            <p className="bakery-add-product-field-description mt-2 mb-0">
                                Choose whether this product is prepared after an order or uses tracked inventory.
                            </p>
                        </div>

                        {/* Inventory fields shown only when inventory tracking is enabled */}
                        {formData.stock_type === "track_inventory" && (
                            <div className="row g-3 mb-4">

                                {/* Inventory quantity */}
                                <div className="col-12 col-md-6">
                                    <label
                                        htmlFor="inventoryQuantity"
                                        className="form-label bakery-add-product-label"
                                    >
                                        Inventory quantity
                                        <span className="bakery-required-field"> *</span>
                                    </label>

                                    <input
                                        type="number"
                                        id="inventoryQuantity"
                                        className="form-control bakery-add-product-input"
                                        min="0"
                                        placeholder="0"
                                        value={formData.inventory_quantity}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                inventory_quantity: event.target.value
                                            })
                                        }
                                    />
                                </div>

                                {/* Low inventory threshold */}
                                <div className="col-12 col-md-6">
                                    <label
                                        htmlFor="lowInventoryThreshold"
                                        className="form-label bakery-add-product-label"
                                    >
                                        Low inventory threshold
                                        <span className="bakery-required-field"> *</span>
                                    </label>

                                    <input
                                        type="number"
                                        id="lowInventoryThreshold"
                                        className="form-control bakery-add-product-input"
                                        min="0"
                                        placeholder="5"
                                        value={formData.low_inventory_threshold}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                low_inventory_threshold: event.target.value
                                            })
                                        }
                                    />
                                </div>



                            </div>
                        )}

                        {/* Preparation and daily order limits */}
                        <div className="row g-3 mb-4">

                            {/* Minimum preparation notice */}
                            <div className="col-12 col-md-6">
                                <label
                                    htmlFor="minimumPreparationNotice"
                                    className="form-label bakery-add-product-label"
                                >
                                    Minimum preparation notice
                                    <span className="bakery-required-field"> *</span>
                                </label>

                                <div className="input-group">
                                    <input
                                        type="number"
                                        id="minimumPreparationNotice"
                                        className="form-control bakery-add-product-input"
                                        min="0"
                                        value={formData.minimum_preparation_notice}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                minimum_preparation_notice: event.target.value
                                            })
                                        }
                                    />

                                    <span className="input-group-text bakery-add-product-price-symbol">
                                        hours
                                    </span>
                                </div>

                                <p className="bakery-add-product-field-description mt-2 mb-0">
                                    Minimum time needed before this product can be prepared.
                                </p>
                            </div>

                            {/* Maximum orders per day */}
                            <div className="col-12 col-md-6">
                                <label
                                    htmlFor="maximumOrdersPerDay"
                                    className="form-label bakery-add-product-label"
                                >
                                    Maximum orders per day
                                </label>

                                <input
                                    type="number"
                                    id="maximumOrdersPerDay"
                                    className="form-control bakery-add-product-input"
                                    min="1"
                                    placeholder="No limit"
                                    value={formData.maximum_orders_per_day}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            maximum_orders_per_day: event.target.value
                                        })
                                    }
                                />

                                <p className="bakery-add-product-field-description mt-2 mb-0">
                                    Leave blank if there is no daily limit.
                                </p>
                            </div>

                        </div>

                        {/* Available pickup days */}
                        <div className="mb-4">
                            <label className="form-label bakery-add-product-label">
                                Available pickup days
                            </label>

                            <p className="bakery-add-product-field-description mb-3">
                                Select the days when customers can pick up this product.
                            </p>

                            <div className="d-flex flex-wrap gap-2">
                                {pickupDayOptions.map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`btn bakery-pickup-day-button ${formData.available_pickup_days.includes(day)
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() => {
                                            const isSelected =
                                                formData.available_pickup_days.includes(day);

                                            setFormData({
                                                ...formData,
                                                available_pickup_days: isSelected
                                                    ? formData.available_pickup_days.filter(
                                                        (pickupDay) => pickupDay !== day
                                                    )
                                                    : [...formData.available_pickup_days, day]
                                            });
                                        }}
                                    >
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* Product availability */}
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-4 bakery-availability-setting">

                            <div>
                                <p className="bakery-add-product-label mb-1">
                                    Available for ordering
                                </p>

                                <p className="bakery-add-product-field-description mb-0">
                                    Allow customers to place orders for this product when it is published.
                                </p>
                            </div>

                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input bakery-product-switch"
                                    type="checkbox"
                                    role="switch"
                                    id="productAvailability"
                                    checked={formData.is_available}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            is_available: event.target.checked
                                        })
                                    }
                                />
                            </div>

                        </div>

                        {/* Featured product */}
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-4 bakery-availability-setting">
                            <div>
                                <p className="bakery-add-product-label mb-1">
                                    Featured product
                                </p>

                                <p className="bakery-add-product-field-description mb-0">
                                    Highlight this product in featured sections of your storefront.
                                </p>
                            </div>

                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input bakery-product-switch"
                                    type="checkbox"
                                    role="switch"
                                    id="featuredProduct"
                                    checked={formData.is_featured}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            is_featured: event.target.checked
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Availability validation error */}
                        {formError && (
                            <p className="bakery-add-product-error mb-3">
                                {formError}
                            </p>
                        )}

                        {/* Availability navigation */}
                        <div className="d-flex justify-content-between align-items-center gap-3 mt-4">

                            {/* Return to Basic Information */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-secondary-button"
                                onClick={() => {
                                    setFormError("");
                                    setCurrentStep(1);
                                }}
                            >
                                Back
                            </button>

                            {/* Continue to the next step */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-primary-button"
                                onClick={handleAvailabilityContinue}
                            >
                                Continue
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="card bakery-add-product-card">
                    <div className="card-body">

                        {/* Payment heading */}
                        <div className="mb-4">
                            <h2 className="bakery-add-product-section-title mb-1">
                                Payment
                            </h2>

                            <p className="bakery-add-product-field-description mb-0">
                                Configure how customers will pay for this product.
                            </p>
                        </div>

                        {/* Payment rule */}
                        <div className="mb-4">
                            <label
                                htmlFor="paymentRule"
                                className="form-label bakery-add-product-label"
                            >
                                Payment requirement
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <p className="bakery-add-product-field-description mb-2">
                                Choose how much the customer must pay when placing an order.
                            </p>

                            <select
                                id="paymentRule"
                                className="form-select bakery-add-product-input"
                                value={formData.payment_rule}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        payment_rule: event.target.value
                                    })
                                }
                            >
                                <option value="full_payment">
                                    Full payment — customer pays the full amount
                                </option>

                                <option value="deposit">
                                    Deposit — customer pays a percentage upfront
                                </option>
                            </select>
                        </div>

                        {/* Deposit percentage shown only when deposit payment is selected */}
                        {formData.payment_rule === "deposit" && (
                            <div className="mb-4 bakery-payment-deposit-section">
                                <label
                                    htmlFor="depositPercentage"
                                    className="form-label bakery-add-product-label"
                                >
                                    Deposit percentage (%)
                                    <span className="bakery-required-field"> *</span>
                                </label>

                                <input
                                    type="number"
                                    id="depositPercentage"
                                    className="form-control bakery-add-product-input"
                                    min="1"
                                    max="100"
                                    placeholder="25"
                                    value={formData.deposit_percentage}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            deposit_percentage: event.target.value
                                        })
                                    }
                                />

                                <p className="bakery-add-product-field-description mt-2 mb-0">
                                    Percentage of the total price paid when the order is placed.
                                </p>
                            </div>
                        )}

                        {/* Cancellation cutoff */}
                        <div className="mb-4">
                            <label
                                htmlFor="cancellationCutoff"
                                className="form-label bakery-add-product-label"
                            >
                                Cancellation cutoff (hours before pickup)
                                <span className="bakery-required-field"> *</span>
                            </label>

                            <input
                                type="number"
                                id="cancellationCutoff"
                                className="form-control bakery-add-product-input"
                                min="0"
                                value={formData.cancellation_cutoff_hours}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        cancellation_cutoff_hours: event.target.value
                                    })
                                }
                            />

                            <p className="bakery-add-product-field-description mt-2 mb-0">
                                Customers cannot cancel after this cutoff.
                            </p>
                        </div>

                        {/* Payment validation error */}
                        {formError && (
                            <p className="bakery-add-product-error mb-3">
                                {formError}
                            </p>
                        )}

                        {/* Payment navigation */}
                        <div className="d-flex justify-content-between align-items-center gap-3 mt-4">

                            {/* Return to Availability */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-secondary-button"
                                onClick={() => {
                                    setFormError("");
                                    setCurrentStep(2);
                                }}
                            >
                                Back
                            </button>

                            {/* Continue to the next step */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-primary-button"
                                onClick={handlePaymentContinue}
                                disabled={isProductSaving}
                            >
                                {isProductSaving ? "Saving..." : "Continue"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {currentStep === 4 && productId && (
                <div className="card bakery-add-product-card">
                    <div className="card-body">

                        {/* Options heading */}
                        <div className="mb-4">
                            <h2 className="bakery-add-product-section-title mb-1">
                                Options
                            </h2>

                            <p className="bakery-add-product-field-description mb-0">
                                Add customization choices customers can select when ordering.
                            </p>
                        </div>

                        {/* Existing customization groups */}
                        {customizationGroups.map((group) => (
                            <div
                                key={group._id}
                                className="card bakery-add-product-card mb-3"
                            >
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center gap-3">

                                        <div>
                                            <p className="bakery-add-product-label mb-1">
                                                {group.name}
                                            </p>

                                            <p className="bakery-add-product-field-description mb-0">
                                                {group.is_required
                                                    ? "Required"
                                                    : "Optional"}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        ))}

                        {/* New customization group */}
                        <div className="mb-4">

                            <label
                                htmlFor="customizationGroupName"
                                className="form-label bakery-add-product-label"
                            >
                                Option group name
                            </label>

                            <input
                                type="text"
                                id="customizationGroupName"
                                className="form-control bakery-add-product-input"
                                placeholder="e.g. Cake size"
                                value={newGroupName}
                                onChange={(event) => setNewGroupName(event.target.value)}
                            />

                        </div>

                        {/* Required customization group */}
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-4 bakery-availability-setting">

                            <div>
                                <p className="bakery-add-product-label mb-1">
                                    Required
                                </p>

                                <p className="bakery-add-product-field-description mb-0">
                                    Customers must select an option from this group before ordering.
                                </p>
                            </div>

                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input bakery-product-switch"
                                    type="checkbox"
                                    role="switch"
                                    id="customizationGroupRequired"
                                    checked={newGroupRequired}
                                    onChange={(event) =>
                                        setNewGroupRequired(event.target.checked)
                                    }
                                />
                            </div>

                        </div>

                        {/* Customization group validation error */}
                        {formError && (
                            <p className="bakery-add-product-error mb-3">
                                {formError}
                            </p>
                        )}

                        {/* Options actions */}
                        <div className="d-flex justify-content-between align-items-center gap-3 mt-4">

                            {/* Return to Payment */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-secondary-button"
                                onClick={() => {
                                    setFormError("");
                                    setCurrentStep(3);
                                }}
                            >
                                Back
                            </button>

                            {/* Create customization group */}
                            <button
                                type="button"
                                className="btn bakery-dashboard-primary-button"
                                onClick={handleAddCustomizationGroup}
                            >
                                Add option group
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}