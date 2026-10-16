import API_URL from "../../../config/api.js";
//Import React hooks
import {
    useState
} from "react";

//Import Storefront Settings icons
import {
    Check,
    ImageUp,
    LoaderCircle,
    Save,
    Store
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";


//Displays and updates Bakery Storefront Settings
export default function StorefrontSettings({
    bakery,
    setBakery
}) {


    //Stores editable Storefront information
    const [formData, setFormData] = useState({

        //Selected Storefront theme
        storefront_theme:
            bakery.storefront_theme ||
            "warm",

        //Storefront colors
        primary_color:
            bakery.primary_color || "#C65F3A",

        secondary_color:
            bakery.secondary_color || "#F4E8DF",

        dark_color:
            bakery.dark_color || "#432C23",

        //Bakery logo
        logo_image_url:
            bakery.logo_image_url || "",

        logo_image_public_id:
            bakery.logo_image_public_id || "",

        //Bakery storefront image
        bakery_image_url:
            bakery.bakery_image_url || "",

        bakery_image_public_id:
            bakery.bakery_image_public_id || ""
    });


    //Tracks whether the Bakery logo is uploading
    const [
        isLogoUploading,
        setIsLogoUploading
    ] = useState(false);

    //Tracks whether the Bakery image is uploading
    const [
        isBakeryImageUploading,
        setIsBakeryImageUploading
    ] = useState(false);

    //Tracks whether Storefront Settings are saving
    const [
        isSaving,
        setIsSaving
    ] = useState(false);

    //Stores Storefront Settings errors
    const [
        error,
        setError
    ] = useState("");

    //Stores Storefront Settings success message
    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    //Preset primary colors
    const primaryColorOptions = [
        "#C65F3A",
        "#8B5E3C",
        "#4F759B",
        "#6D597A",
        "#B56576",
        "#5F7161"
    ];

    //Preset secondary colors
    const secondaryColorOptions = [
        "#F4E8DF",
        "#E8DCCF",
        "#DCE7E1",
        "#DDE6EF",
        "#E8DFF0",
        "#F2E1E5"
    ];

    //Preset dark colors
    const darkColorOptions = [
        "#432C23",
        "#2F211B",
        "#3D4A3E",
        "#2F3E4E",
        "#41364D",
        "#3F3035"
    ];

    //Preset Storefront themes
    const storefrontThemeOptions = [

        {
            id: "warm",
            name: "Warm Bakery",
            primary_color: "#C65F3A",
            secondary_color: "#F4E8DF",
            dark_color: "#432C23"
        },

        {
            id: "sage",
            name: "Sage",
            primary_color: "#5F7161",
            secondary_color: "#DCE7E1",
            dark_color: "#3D4A3E"
        },

        {
            id: "blueberry",
            name: "Blueberry",
            primary_color: "#4F759B",
            secondary_color: "#DDE6EF",
            dark_color: "#2F3E4E"
        },

        {
            id: "lavender",
            name: "Lavender",
            primary_color: "#6D597A",
            secondary_color: "#E8DFF0",
            dark_color: "#41364D"
        },

        {
            id: "rose",
            name: "Rose",
            primary_color: "#B56576",
            secondary_color: "#F2E1E5",
            dark_color: "#3F3035"
        }

    ];

    //Creates Bakery initials when no logo is uploaded
    function getBakeryInitials() {

        //Use B if the Bakery does not have a name
        if (!bakery.name?.trim()) {
            return "B";
        }


        //Split the Bakery name into words
        const bakeryNameWords =
            bakery.name
                .trim()
                .split(" ");


        //Use the first letter for a one-word Bakery name
        if (bakeryNameWords.length === 1) {

            return bakeryNameWords[0]
                .charAt(0)
                .toUpperCase();
        }


        //Use the first two initials for longer Bakery names
        return (
            bakeryNameWords[0].charAt(0) +
            bakeryNameWords[1].charAt(0)
        ).toUpperCase();
    }


    //Updates the selected Storefront field
    function updateField(
        fieldName,
        value
    ) {

        //Update the matching Storefront field
        setFormData((currentData) => ({
            ...currentData,
            [fieldName]: value
        }));


        //Clear previous messages after a change
        setError("");
        setSuccessMessage("");
    }

    //Applies a Storefront theme preset
    function applyStorefrontTheme(theme) {

        setFormData(
            (currentData) => ({

                ...currentData,

                //Save selected preset
                storefront_theme:
                    theme.id,

                //Apply preset colors
                primary_color:
                    theme.primary_color,

                secondary_color:
                    theme.secondary_color,

                dark_color:
                    theme.dark_color
            })
        );


        //Clear previous messages after a change
        setError("");

        setSuccessMessage("");
    }

    //Uploads a new Bakery logo
    async function handleLogoUpload(event) {

        //Get the selected logo file
        const selectedFile =
            event.target.files[0];


        //Stop if no file was selected
        if (!selectedFile) {
            return;
        }


        //Start the logo upload state
        setIsLogoUploading(true);


        //Clear previous messages
        setError("");
        setSuccessMessage("");


        try {

            //Get the Bakery Owner's authentication token
            const token =
                getAuthToken();


            //Create form data for the logo upload
            const uploadData =
                new FormData();


            //Add the selected logo to the form data
            uploadData.append(
                "logo",
                selectedFile
            );


            //Upload the Bakery logo
            const response = await fetch(
                `${API_URL}/api/bakeries/uploads/logo`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: uploadData
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if the logo could not be uploaded
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to upload bakery logo"
                );
            }


            //Store the uploaded logo information
            setFormData((currentData) => ({
                ...currentData,

                logo_image_url:
                    data.logo_image_url,

                logo_image_public_id:
                    data.logo_image_public_id
            }));


        } catch (error) {

            //Display the logo upload error
            setError(error.message);

        } finally {

            //Stop the logo upload state
            setIsLogoUploading(false);


            //Allow the same image to be selected again
            event.target.value = "";
        }
    }


    //Uploads a new Bakery storefront image
    async function handleBakeryImageUpload(event) {

        //Get the selected Bakery image
        const selectedFile =
            event.target.files[0];


        //Stop if no file was selected
        if (!selectedFile) {
            return;
        }


        //Start the Bakery image upload state
        setIsBakeryImageUploading(true);


        //Clear previous messages
        setError("");
        setSuccessMessage("");


        try {

            //Get the Bakery Owner's authentication token
            const token =
                getAuthToken();


            //Create form data for the Bakery image upload
            const uploadData =
                new FormData();


            //Add the selected Bakery image to the form data
            uploadData.append(
                "bakery_image",
                selectedFile
            );


            //Upload the Bakery image
            const response = await fetch(
                `${API_URL}/api/bakeries/uploads/bakery-image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: uploadData
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if the image could not be uploaded
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to upload bakery image"
                );
            }


            //Store the uploaded Bakery image information
            setFormData((currentData) => ({
                ...currentData,

                bakery_image_url:
                    data.bakery_image_url,

                bakery_image_public_id:
                    data.bakery_image_public_id
            }));


        } catch (error) {

            //Display the Bakery image upload error
            setError(error.message);

        } finally {

            //Stop the Bakery image upload state
            setIsBakeryImageUploading(false);


            //Allow the same image to be selected again
            event.target.value = "";
        }
    }


    //Saves the Storefront Settings
    async function saveStorefrontSettings(event) {

        //Stop the browser from refreshing the page
        event.preventDefault();


        //Start the save state
        setIsSaving(true);


        //Clear previous messages
        setError("");
        setSuccessMessage("");


        try {

            //Get the Bakery Owner's authentication token
            const token =
                getAuthToken();


            //Preserve the existing Bakery while changing Storefront fields
            const updatedBakeryData = {

                //General Bakery information
                name:
                    bakery.name,

                contact_email:
                    bakery.contact_email,

                contact_phone:
                    bakery.contact_phone,

                description:
                    bakery.description,

                //Policies
                pickup_instructions:
                    bakery.pickup_instructions || "",

                cancellation_policy:
                    bakery.cancellation_policy || "",

                custom_order_policy:
                    bakery.custom_order_policy || "",

                additional_policy_information:
                    bakery.additional_policy_information || "",

                //Location
                address:
                    bakery.address,

                //Storefront Settings
                storefront_theme:
                    formData.storefront_theme,

                primary_color:
                    formData.primary_color,

                secondary_color:
                    formData.secondary_color,

                dark_color:
                    formData.dark_color,

                logo_image_url:
                    formData.logo_image_url,

                logo_image_public_id:
                    formData.logo_image_public_id,

                bakery_image_url:
                    formData.bakery_image_url,

                bakery_image_public_id:
                    formData.bakery_image_public_id,

                //Business Settings
                minimum_order_notice:
                    bakery.minimum_order_notice ?? 72,

                timezone:
                    bakery.timezone || "America/Toronto",

                currency:
                    bakery.currency || "CAD",

                maximum_orders_per_day:
                    bakery.maximum_orders_per_day ?? 10,

                accepting_orders:
                    bakery.accepting_orders ?? true,

                //Payment Settings
                payment_rule:
                    bakery.payment_rule || "full",

                deposit_percentage:
                    bakery.deposit_percentage ?? 25,

                allow_manual_payment:
                    bakery.allow_manual_payment ?? false
            };


            //Update the Bakery
            const response = await fetch(
                `${API_URL}/api/bakeries/mine`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        updatedBakeryData
                    )
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if the Storefront Settings could not be saved
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update storefront settings"
                );
            }


            //Get the latest Bakery returned by the backend
            const updatedBakery =
                data.bakery || data;


            //Update the Bakery stored by the Settings page
            setBakery(updatedBakery);


            //Display successful save message
            setSuccessMessage(
                "Storefront settings saved successfully."
            );


        } catch (error) {

            //Display the Storefront Settings error
            setError(error.message);

        } finally {

            //Stop the save state
            setIsSaving(false);
        }
    }


    return (
        <form
            className="bakery-settings-card"
            onSubmit={saveStorefrontSettings}
        >

            {/* Storefront Settings error */}
            {error && (

                <div className="bakery-settings-error">
                    {error}
                </div>

            )}


            {/* Storefront Settings success */}
            {successMessage && (

                <div className="bakery-settings-success">
                    {successMessage}
                </div>

            )}


            {/* Storefront media heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Storefront media
                </h2>

                <p>
                    Manage the images customers see
                    throughout your bakery storefront.
                </p>

            </div>


            {/* Storefront media */}
            <div className="bakery-settings-media-section">

                {/* Bakery logo */}
                <div className="bakery-settings-upload-section">

                    <label className="form-label">
                        Bakery logo
                    </label>

                    <p className="bakery-settings-field-help">
                        Upload a logo to display in your
                        bakery storefront navigation.
                    </p>


                    {/* Bakery logo upload area */}
                    <label
                        htmlFor="bakerySettingsLogo"
                        className={
                            isLogoUploading
                                ? "bakery-settings-upload-area disabled"
                                : "bakery-settings-upload-area"
                        }
                    >

                        {/* Current Bakery logo */}
                        {formData.logo_image_url ? (

                            <div className="bakery-settings-upload-preview-logo">

                                <img
                                    src={formData.logo_image_url}
                                    alt={`${bakery.name} logo`}
                                />

                            </div>

                        ) : (

                            <div
                                className="bakery-settings-upload-preview-initials"
                                style={{
                                    backgroundColor:
                                        formData.secondary_color,
                                    color:
                                        formData.dark_color
                                }}
                            >
                                {getBakeryInitials()}
                            </div>

                        )}


                        {/* Bakery logo upload information */}
                        <div className="bakery-settings-upload-area-content">

                            {isLogoUploading ? (

                                <LoaderCircle
                                    size={21}
                                    strokeWidth={1.8}
                                    className="bakery-settings-spinner"
                                />

                            ) : (

                                <ImageUp
                                    size={21}
                                    strokeWidth={1.7}
                                />

                            )}


                            <strong>
                                {isLogoUploading
                                    ? "Uploading logo..."
                                    : formData.logo_image_url
                                        ? "Change bakery logo"
                                        : "Upload bakery logo"
                                }
                            </strong>

                            <span>
                                PNG, JPG or WEBP · square image recommended
                            </span>

                        </div>

                    </label>


                    {/* Hidden Bakery logo input */}
                    <input
                        type="file"
                        id="bakerySettingsLogo"
                        className="bakery-settings-file-input"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isLogoUploading}
                        onChange={handleLogoUpload}
                    />

                </div>


                {/* Bakery image */}
                <div className="bakery-settings-upload-section">

                    <label className="form-label">
                        Bakery image
                    </label>

                    <p className="bakery-settings-field-help">
                        Upload an image to represent your
                        bakery on the storefront.
                    </p>


                    {/* Bakery image upload area */}
                    <label
                        htmlFor="bakerySettingsImage"
                        className={
                            isBakeryImageUploading
                                ? "bakery-settings-upload-area bakery-settings-upload-area-image disabled"
                                : "bakery-settings-upload-area bakery-settings-upload-area-image"
                        }
                    >

                        {/* Current Bakery image */}
                        {formData.bakery_image_url ? (

                            <img
                                className="bakery-settings-upload-preview-image"
                                src={formData.bakery_image_url}
                                alt={`${bakery.name} storefront`}
                            />

                        ) : (

                            <div className="bakery-settings-upload-placeholder">

                                <Store
                                    size={27}
                                    strokeWidth={1.5}
                                />

                            </div>

                        )}


                        {/* Bakery image upload information */}
                        <div className="bakery-settings-upload-area-content">

                            {isBakeryImageUploading ? (

                                <LoaderCircle
                                    size={21}
                                    strokeWidth={1.8}
                                    className="bakery-settings-spinner"
                                />

                            ) : (

                                <ImageUp
                                    size={21}
                                    strokeWidth={1.7}
                                />

                            )}


                            <strong>
                                {isBakeryImageUploading
                                    ? "Uploading image..."
                                    : formData.bakery_image_url
                                        ? "Change bakery image"
                                        : "Upload bakery image"
                                }
                            </strong>

                            <span>
                                PNG, JPG or WEBP · landscape image recommended
                            </span>

                        </div>

                    </label>


                    {/* Hidden Bakery image input */}
                    <input
                        type="file"
                        id="bakerySettingsImage"
                        className="bakery-settings-file-input"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isBakeryImageUploading}
                        onChange={handleBakeryImageUpload}
                    />

                </div>

            </div>


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Storefront colors heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Storefront colors
                </h2>

                <p>
                    Choose the colors that represent your
                    bakery throughout the storefront.
                </p>

            </div>

            {/* Storefront theme presets */}
            <div className="mb-4">

                <strong className="d-block mb-1">
                    Theme presets
                </strong>

                <p className="text-secondary mb-3">
                    Choose a preset or customize the colors below.
                </p>


                <div className="row g-3">

                    {storefrontThemeOptions.map(
                        (theme) => (

                            <div
                                className="col-12 col-sm-6 col-lg-4"
                                key={theme.id}
                            >

                                <button
                                    type="button"
                                    className={
                                        `w-100 text-start border rounded-3 p-3 bg-white ${formData.storefront_theme ===
                                            theme.id
                                            ? "border-dark border-2"
                                            : ""
                                        }`
                                    }
                                    onClick={() =>
                                        applyStorefrontTheme(
                                            theme
                                        )
                                    }
                                >

                                    <span className="fw-semibold d-block mb-3">
                                        {theme.name}
                                    </span>


                                    {/* Theme colors preview */}
                                    <span className="d-flex align-items-center gap-2">

                                        <span
                                            className="rounded-circle d-inline-block"
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor:
                                                    theme.primary_color
                                            }}
                                        />

                                        <span
                                            className="rounded-circle d-inline-block"
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor:
                                                    theme.secondary_color
                                            }}
                                        />

                                        <span
                                            className="rounded-circle d-inline-block"
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor:
                                                    theme.dark_color
                                            }}
                                        />

                                    </span>

                                </button>

                            </div>
                        )
                    )}

                </div>

            </div>

            {/* Primary colors */}
            <div className="bakery-settings-color-section">

                <div className="bakery-settings-color-heading">

                    <div>

                        <strong>
                            Primary colors
                        </strong>

                        <span>
                            Used for buttons and important accents.
                        </span>

                    </div>


                    <span className="bakery-settings-color-code">
                        {formData.primary_color}
                    </span>

                </div>


                <div className="bakery-settings-color-options">

                    {/* Primary colors presets */}
                    {primaryColorOptions.map((color) => (

                        <button
                            key={color}
                            type="button"
                            className={
                                formData.primary_color === color
                                    ? "bakery-settings-color-option active"
                                    : "bakery-settings-color-option"
                            }
                            style={{
                                backgroundColor: color
                            }}
                            aria-label={`Select ${color}`}
                            onClick={() =>
                                updateField(
                                    "primary_color",
                                    color
                                )
                            }
                        >

                            {formData.primary_color === color && (

                                <Check
                                    size={16}
                                    strokeWidth={2.5}
                                />

                            )}

                        </button>

                    ))}


                    {/* Custom primary colors */}
                    <label className="bakery-settings-custom-color">

                        <input
                            type="color"
                            value={formData.primary_color}
                            aria-label="Choose custom primary colors"
                            onChange={(event) =>
                                updateField(
                                    "primary_color",
                                    event.target.value
                                )
                            }
                        />

                        <span>
                            Custom
                        </span>

                    </label>

                </div>

            </div>


            {/* Secondary colors */}
            <div className="bakery-settings-color-section">

                <div className="bakery-settings-color-heading">

                    <div>

                        <strong>
                            Secondary colors
                        </strong>

                        <span>
                            Used for soft backgrounds and highlights.
                        </span>

                    </div>


                    <span className="bakery-settings-color-code">
                        {formData.secondary_color}
                    </span>

                </div>


                <div className="bakery-settings-color-options">

                    {/* Secondary colors presets */}
                    {secondaryColorOptions.map((color) => (

                        <button
                            key={color}
                            type="button"
                            className={
                                formData.secondary_color === color
                                    ? "bakery-settings-color-option active"
                                    : "bakery-settings-color-option"
                            }
                            style={{
                                backgroundColor: color
                            }}
                            aria-label={`Select ${color}`}
                            onClick={() =>
                                updateField(
                                    "secondary_color",
                                    color
                                )
                            }
                        >

                            {formData.secondary_color === color && (

                                <Check
                                    size={16}
                                    strokeWidth={2.5}
                                />

                            )}

                        </button>

                    ))}


                    {/* Custom secondary colors */}
                    <label className="bakery-settings-custom-color">

                        <input
                            type="color"
                            value={formData.secondary_color}
                            aria-label="Choose custom secondary colors"
                            onChange={(event) =>
                                updateField(
                                    "secondary_color",
                                    event.target.value
                                )
                            }
                        />

                        <span>
                            Custom
                        </span>

                    </label>

                </div>

            </div>


            {/* Dark colors */}
            <div className="bakery-settings-color-section">

                <div className="bakery-settings-color-heading">

                    <div>

                        <strong>
                            Dark colors
                        </strong>

                        <span>
                            Used for headings, navigation and dark areas.
                        </span>

                    </div>


                    <span className="bakery-settings-color-code">
                        {formData.dark_color}
                    </span>

                </div>


                <div className="bakery-settings-color-options">

                    {/* Dark colors presets */}
                    {darkColorOptions.map((color) => (

                        <button
                            key={color}
                            type="button"
                            className={
                                formData.dark_color === color
                                    ? "bakery-settings-color-option active"
                                    : "bakery-settings-color-option"
                            }
                            style={{
                                backgroundColor: color
                            }}
                            aria-label={`Select ${color}`}
                            onClick={() =>
                                updateField(
                                    "dark_color",
                                    color
                                )
                            }
                        >

                            {formData.dark_color === color && (

                                <Check
                                    size={16}
                                    strokeWidth={2.5}
                                />

                            )}

                        </button>

                    ))}


                    {/* Custom dark colors */}
                    <label className="bakery-settings-custom-color">

                        <input
                            type="color"
                            value={formData.dark_color}
                            aria-label="Choose custom dark colors"
                            onChange={(event) =>
                                updateField(
                                    "dark_color",
                                    event.target.value
                                )
                            }
                        />

                        <span>
                            Custom
                        </span>

                    </label>

                </div>

            </div>


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Storefront preview heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Storefront preview
                </h2>

                <p>
                    Preview how your bakery branding
                    works together.
                </p>

            </div>


            {/* Live Storefront preview */}
            <div
                className="bakery-settings-storefront-preview"
                style={{
                    backgroundColor:
                        formData.secondary_color
                }}
            >

                {/* Preview navigation */}
                <div
                    className="bakery-settings-preview-header"
                    style={{
                        backgroundColor:
                            formData.dark_color
                    }}
                >

                    {/* Preview Bakery branding */}
                    <div className="bakery-settings-preview-brand">

                        {/* Preview Bakery logo */}
                        {formData.logo_image_url ? (

                            <img
                                src={formData.logo_image_url}
                                alt={`${bakery.name} logo preview`}
                            />

                        ) : (

                            <span
                                style={{
                                    backgroundColor:
                                        formData.primary_color
                                }}
                            >
                                {getBakeryInitials()}
                            </span>

                        )}


                        {/* Preview Bakery name */}
                        <strong>
                            {bakery.name}
                        </strong>

                    </div>


                    {/* Preview navigation links */}
                    <div className="bakery-settings-preview-navigation">

                        <span>
                            Home
                        </span>

                        <span>
                            Products
                        </span>

                        <span>
                            About
                        </span>

                    </div>

                </div>


                {/* Preview content */}
                <div className="bakery-settings-preview-content">

                    {/* Preview text content */}
                    <div>

                        <span
                            className="bakery-settings-preview-label"
                            style={{
                                color:
                                    formData.primary_color
                            }}
                        >
                            Freshly made
                        </span>


                        <h3
                            style={{
                                color:
                                    formData.dark_color
                            }}
                        >
                            {bakery.name}
                        </h3>


                        <p
                            style={{
                                color:
                                    formData.dark_color
                            }}
                        >
                            Freshly made treats,
                            prepared with care.
                        </p>


                        <button
                            type="button"
                            style={{
                                backgroundColor:
                                    formData.primary_color
                            }}
                        >
                            Shop products
                        </button>

                    </div>


                    {/* Preview Bakery image */}
                    {formData.bakery_image_url && (

                        <img
                            className="bakery-settings-preview-image"
                            src={formData.bakery_image_url}
                            alt={`${bakery.name} storefront preview`}
                        />

                    )}

                </div>

            </div>


            {/* Storefront Settings actions */}
            <div className="bakery-settings-actions">

                <button
                    type="submit"
                    className="bakery-settings-save-button"
                    disabled={
                        isSaving ||
                        isLogoUploading ||
                        isBakeryImageUploading
                    }
                >

                    {isSaving ? (

                        <LoaderCircle
                            size={16}
                            strokeWidth={1.8}
                            className="bakery-settings-spinner"
                        />

                    ) : (

                        <Save
                            size={16}
                            strokeWidth={1.8}
                        />

                    )}


                    {isSaving
                        ? "Saving..."
                        : "Save changes"
                    }

                </button>

            </div>

        </form>
    );
}