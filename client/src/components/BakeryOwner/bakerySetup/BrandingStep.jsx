//Import useState to manage temporary upload states
import { useState } from "react";


//Displays the Branding step of the bakery setup process
export default function BrandingStep({
    formData,
    handleChange,
    handleContinue,
    handleBack
}) {

    //Tracks whether the bakery logo is currently being uploaded
    const [isLogoUploading, setIsLogoUploading] = useState(false);

    //Tracks whether the bakery image is currently being uploaded
    const [isBakeryImageUploading, setIsBakeryImageUploading] = useState(false);


    //Preset primary colors the Bakery Owner can quickly choose from
    const primaryColorOptions = [
        "#C65F3A",
        "#8B5E3C",
        "#4F759B",
        "#6D597A",
        "#B56576",
        "#5F7161"
    ];


    //Preset secondary colors the Bakery Owner can quickly choose from
    const secondaryColorOptions = [
        "#F4E8DF",
        "#E8DCCF",
        "#DCE7E1",
        "#DDE6EF",
        "#E8DFF0",
        "#F2E1E5"
    ];


    //Preset dark colors the Bakery Owner can quickly choose from
    const darkColorOptions = [
        "#432C23",
        "#2F211B",
        "#3D4A3E",
        "#2F3E4E",
        "#41364D",
        "#3F3035"
    ];


    //Uploads the selected bakery logo to Cloudinary through the Bakeau backend
    async function handleLogoUpload(event) {

        const selectedFile = event.target.files[0];

        //Stop if the Bakery Owner did not select a file
        if (!selectedFile) {
            return;
        }

        //Create form data so the image file can be sent to the backend
        const uploadData = new FormData();

        uploadData.append("logo", selectedFile);

        //Show that the logo upload has started
        setIsLogoUploading(true);

        //Send the selected logo to the Bakeau backend
        const response = await fetch(
            "http://localhost:3000/api/bakeries/uploads/logo",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: uploadData
            }
        );

        //Hide the upload status after the request finishes
        setIsLogoUploading(false);

        //Convert the backend response into JavaScript
        const data = await response.json();

        //Save the uploaded logo information in the bakery setup form
        if (response.ok) {

            handleChange({
                target: {
                    name: "logo_image_url",
                    value: data.logo_image_url
                }
            });

            handleChange({
                target: {
                    name: "logo_image_public_id",
                    value: data.logo_image_public_id
                }
            });
        }
    }


    //Uploads the selected bakery image to Cloudinary through the Bakeau backend
    async function handleBakeryImageUpload(event) {

        const selectedFile = event.target.files[0];

        //Stop if the Bakery Owner did not select a file
        if (!selectedFile) {
            return;
        }

        //Create form data so the image file can be sent to the backend
        const uploadData = new FormData();

        uploadData.append("bakery_image", selectedFile);

        //Show that the bakery image upload has started
        setIsBakeryImageUploading(true);

        //Send the selected bakery image to the Bakeau backend
        const response = await fetch(
            "http://localhost:3000/api/bakeries/uploads/bakery-image",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: uploadData
            }
        );

        //Hide the upload status after the request finishes
        setIsBakeryImageUploading(false);

        //Convert the backend response into JavaScript
        const data = await response.json();

        //Save the uploaded bakery image information in the bakery setup form
        if (response.ok) {

            handleChange({
                target: {
                    name: "bakery_image_url",
                    value: data.bakery_image_url
                }
            });

            handleChange({
                target: {
                    name: "bakery_image_public_id",
                    value: data.bakery_image_public_id
                }
            });
        }
    }


    //Creates bakery initials for the storefront preview when no logo is uploaded
    function getBakeryInitials() {

        if (!formData.name.trim()) {
            return "B";
        }

        const bakeryNameWords = formData.name
            .trim()
            .split(" ");

        if (bakeryNameWords.length === 1) {
            return bakeryNameWords[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            bakeryNameWords[0].charAt(0) +
            bakeryNameWords[1].charAt(0)
        ).toUpperCase();
    }


    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading">

                <h1>Branding</h1>

                <p>
                    Customize how your bakery will appear to customers.
                </p>

            </div>


            <form
                className="bakery-setup-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleContinue();
                }}
            >

                {/* Bakery logo */}
                <div className="mb-4">

                    <label
                        htmlFor="bakeryLogo"
                        className="form-label"
                    >
                        Bakery logo
                        <span className="optional-field"> (optional)</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        Upload a logo to display in your bakery storefront navigation.
                    </p>

                    <p className="bakery-setup-helper-text">
                        If you do not upload a logo, Bakeau will automatically create initials from your bakery name.
                    </p>

                    {/* Custom bakery logo upload area */}
                    <label
                        htmlFor="bakeryLogo"
                        className={isLogoUploading ? "bakery-image-upload disabled" : "bakery-image-upload"}
                    >
                        <span className="bakery-image-upload-icon">
                            🖼️
                        </span>

                        <span className="bakery-image-upload-title">
                            {isLogoUploading ? "Uploading logo..." : "Upload bakery logo"}
                        </span>

                        <span className="bakery-image-upload-description">
                            PNG or JPG · recommended square image
                        </span>

                        <input
                            type="file"
                            id="bakeryLogo"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isLogoUploading}
                        />
                    </label>

                    {/* Shows the uploaded bakery logo */}
                    {formData.logo_image_url && (
                        <div className="mt-3">

                            <img
                                src={formData.logo_image_url}
                                alt="Bakery logo preview"
                                className="bakery-logo-preview"
                            />

                        </div>
                    )}

                </div>


                {/* Bakery image */}
                <div className="mb-4">

                    <label
                        htmlFor="bakeryImage"
                        className="form-label"
                    >
                        Bakery image
                        <span className="optional-field"> (optional)</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        Upload an image of your bakery to display in the About section of your storefront.
                    </p>

                    {/* Custom bakery image upload area */}
                    <label
                        htmlFor="bakeryImage"
                        className={isBakeryImageUploading ? "bakery-image-upload disabled" : "bakery-image-upload"}
                    >
                        <span className="bakery-image-upload-icon">
                            🖼️
                        </span>

                        <span className="bakery-image-upload-title">
                            {isBakeryImageUploading ? "Uploading bakery image..." : "Upload bakery image"}
                        </span>

                        <span className="bakery-image-upload-description">
                            PNG or JPG · recommended landscape image
                        </span>

                        <input
                            type="file"
                            id="bakeryImage"
                            accept="image/*"
                            onChange={handleBakeryImageUpload}
                            disabled={isBakeryImageUploading}
                        />
                    </label>

                    {/* Shows the uploaded bakery image */}
                    {formData.bakery_image_url && (
                        <div className="mt-3">

                            <img
                                src={formData.bakery_image_url}
                                alt="Bakery preview"
                                className="bakery-image-preview"
                            />

                        </div>
                    )}

                </div>


                {/* Primary brand color */}
                <div className="mb-4">

                    <label className="form-label">
                        Primary color
                    </label>

                    <p className="bakery-setup-field-description">
                        Choose the main color for buttons, links, and important storefront accents.
                    </p>

                    <div className="d-flex align-items-center gap-3 flex-wrap">

                        {primaryColorOptions.map((color) => (

                            <button
                                key={color}
                                type="button"
                                className={formData.primary_color === color ? "bakery-brand-color-option selected" : "bakery-brand-color-option"}
                                style={{
                                    backgroundColor: color
                                }}
                                onClick={() => {
                                    handleChange({
                                        target: {
                                            name: "primary_color",
                                            value: color
                                        }
                                    });
                                }}
                                aria-label={`Select ${color} as primary color`}
                            >
                            </button>

                        ))}

                        {/* Allows the Bakery Owner to choose a custom primary color */}
                        <label
                            htmlFor="primaryColor"
                            className="bakery-brand-custom-color"
                            title="Choose a custom color"
                        >
                            <span>+</span>

                            <input
                                type="color"
                                id="primaryColor"
                                name="primary_color"
                                value={formData.primary_color}
                                onChange={handleChange}
                            />

                        </label>

                    </div>

                </div>


                {/* Secondary brand color */}
                <div className="mb-4">

                    <label className="form-label">
                        Secondary color
                    </label>

                    <p className="bakery-setup-field-description">
                        Choose a softer color for backgrounds, cards, and secondary storefront accents.
                    </p>

                    <div className="d-flex align-items-center gap-3 flex-wrap">

                        {secondaryColorOptions.map((color) => (

                            <button
                                key={color}
                                type="button"
                                className={formData.secondary_color === color ? "bakery-brand-color-option selected" : "bakery-brand-color-option"}
                                style={{
                                    backgroundColor: color
                                }}
                                onClick={() => {
                                    handleChange({
                                        target: {
                                            name: "secondary_color",
                                            value: color
                                        }
                                    });
                                }}
                                aria-label={`Select ${color} as secondary color`}
                            >
                            </button>

                        ))}

                        {/* Allows the Bakery Owner to choose a custom secondary color */}
                        <label
                            htmlFor="secondaryColor"
                            className="bakery-brand-custom-color"
                            title="Choose a custom color"
                        >
                            <span>+</span>

                            <input
                                type="color"
                                id="secondaryColor"
                                name="secondary_color"
                                value={formData.secondary_color}
                                onChange={handleChange}
                            />

                        </label>

                    </div>

                </div>


                {/* Dark brand color */}
                <div className="mb-4">

                    <label className="form-label">
                        Dark color
                    </label>

                    <p className="bakery-setup-field-description">
                        Choose a darker color for the footer, announcement bar, and strong storefront sections.
                    </p>

                    <div className="d-flex align-items-center gap-3 flex-wrap">

                        {darkColorOptions.map((color) => (

                            <button
                                key={color}
                                type="button"
                                className={formData.dark_color === color ? "bakery-brand-color-option selected" : "bakery-brand-color-option"}
                                style={{
                                    backgroundColor: color
                                }}
                                onClick={() => {
                                    handleChange({
                                        target: {
                                            name: "dark_color",
                                            value: color
                                        }
                                    });
                                }}
                                aria-label={`Select ${color} as dark color`}
                            >
                            </button>

                        ))}

                        {/* Allows the Bakery Owner to choose a custom dark color */}
                        <label
                            htmlFor="darkColor"
                            className="bakery-brand-custom-color"
                            title="Choose a custom color"
                        >
                            <span>+</span>

                            <input
                                type="color"
                                id="darkColor"
                                name="dark_color"
                                value={formData.dark_color}
                                onChange={handleChange}
                            />

                        </label>

                    </div>

                </div>


                {/* Storefront theme preview */}
                <div className="bakery-brand-preview">

                    <div className="bakery-brand-preview-header">
                        Storefront preview
                    </div>

                    <div className="bakery-brand-preview-window">

                        {/* Preview navigation */}
                        <div
                            className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 px-3 py-2 bakery-brand-preview-navbar"
                            style={{
                                backgroundColor: formData.dark_color
                            }}
                        >

                            <div className="d-flex align-items-center gap-2 bakery-brand-preview-brand">

                                {/* Displays uploaded logo or bakery initials */}
                                {formData.logo_image_url ? (

                                    <img
                                        src={formData.logo_image_url}
                                        alt="Bakery logo preview"
                                        className="bakery-brand-preview-logo"
                                    />

                                ) : (

                                    <div
                                        className="d-flex align-items-center justify-content-center bakery-brand-preview-logo-fallback"
                                        style={{
                                            backgroundColor: formData.primary_color
                                        }}
                                    >
                                        {getBakeryInitials()}
                                    </div>

                                )}

                                <span>
                                    {formData.name || "Your Bakery"}
                                </span>

                            </div>

                            <div className="d-flex align-items-center gap-3 bakery-brand-preview-nav-links">

                                <span>Menu</span>

                                <span>About</span>

                            </div>

                        </div>


                        {/* Preview product area */}
                        <div
                            className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 m-3 p-3 bakery-brand-preview-product"
                            style={{
                                backgroundColor: formData.secondary_color
                            }}
                        >

                            <div className="bakery-brand-preview-product-image">
                            </div>

                            <div className="flex-grow-1">

                                <span
                                    className="d-block mb-1 bakery-brand-preview-category"
                                    style={{
                                        color: formData.primary_color
                                    }}
                                >
                                    CUSTOM CAKES
                                </span>

                                <h4 className="mb-2">
                                    Celebration Cake
                                </h4>

                                <button
                                    type="button"
                                    className="btn bakery-brand-preview-button"
                                    style={{
                                        backgroundColor: formData.primary_color
                                    }}
                                >
                                    Customize
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Navigation buttons */}
                <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mt-4">

                    <button
                        type="button"
                        className="btn bakery-setup-back-button order-2 order-sm-1"
                        onClick={handleBack}
                    >
                        Back
                    </button>

                    <button
                        type="submit"
                        className="btn bakery-setup-continue-button order-1 order-sm-2"
                    >
                        Continue
                    </button>

                </div>

            </form>

        </div>
    );
}