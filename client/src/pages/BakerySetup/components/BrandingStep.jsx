//Displays the Branding step of the bakery setup process
export default function BrandingStep({
    formData,
    handleChange,
    handleContinue,
    handleBack
}) {

    //Preset primary colors the Bakery Owner can quickly choose from
    const primaryColorOptions = [
        "#C65F3A",
        "#8B5E3C",
        "#4F759B",
        "#6D597A",
        "#B56576",
        "#5F7161"
    ];

    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading">
                <h1>Branding</h1>

                <p>Customize how your bakery will appear to customers</p>
            </div>


            <form
                className="bakery-setup-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleContinue();
                }}
            >
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
                                className={
                                    formData.primary_color === color
                                        ? "bakery-brand-color-option selected"
                                        : "bakery-brand-color-option"
                                }
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


                {/* Navigation buttons */}
                <div className="d-flex justify-content-between mt-4">

                    <button
                        type="button"
                        className="btn bakery-setup-back-button"
                        onClick={handleBack}
                    >
                        Back
                    </button>

                    <button
                        type="submit"
                        className="btn bakery-setup-continue-button"
                    >
                        Continue
                    </button>

                </div>
            </form>
        </div>
    );
}