//Displays the Bakery Basics step of the bakery setup process
export default function BakeryBasicsStep({
    formData,
    handleChange,
    handleContinue
}) {

    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading">
                <h1>Bakery basics</h1>

                <p>
                    Tell us a little about your bakery.
                </p>
            </div>

            <form
                className="bakery-setup-form"
                onSubmit={(event) => {
                    //Prevents the browser from refreshing the page
                    event.preventDefault();

                    //Runs the setup navigation and validation
                    handleContinue();
                }}
            >

                {/* Bakery name */}
                <div className="mb-4">
                    <label
                        htmlFor="bakeryName"
                        className="form-label"
                    >
                        Bakery name
                    </label>

                    <input
                        type="text"
                        id="bakeryName"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Sweet Crumbs Bakery"
                        autoComplete="organization"
                        required
                    />
                </div>

                {/* Bakery description */}
                <div className="mb-4">
                    <label
                        htmlFor="bakeryDescription"
                        className="form-label"
                    >
                        Bakery description
                    </label>

                    <textarea
                        id="bakeryDescription"
                        name="description"
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell customers a little about your bakery and what you make."
                        required
                    ></textarea>
                </div>

                {/* Bakery type */}
                <div className="mb-4">
                    <label
                        htmlFor="bakeryType"
                        className="form-label"
                    >
                        Bakery type
                    </label>

                    <select
                        id="bakeryType"
                        name="bakery_type"
                        className="form-select"
                        value={formData.bakery_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select your bakery type
                        </option>

                        <option value="homeBakery">
                            Home Bakery
                        </option>

                        <option value="retailBakery">
                            Retail Bakery
                        </option>

                        <option value="commercialBakery">
                            Commercial Bakery
                        </option>

                        <option value="customCakeBusiness">
                            Custom Cake Business
                        </option>

                        <option value="other">
                            Other
                        </option>
                    </select>

                    {/* Shows an additional field when the Bakery Owner selects Other */}
                    {formData.bakery_type === "other" && (
                        <div className="mt-3">
                            <label
                                htmlFor="otherBakeryType"
                                className="form-label"
                            >
                                Please specify your bakery type
                            </label>

                            <input
                                type="text"
                                id="otherBakeryType"
                                name="bakery_type_other"
                                className="form-control"
                                value={formData.bakery_type_other}
                                onChange={handleChange}
                                placeholder="e.g. Dessert studio"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Continue to the next setup step */}
                <div className="d-flex justify-content-end mt-4">
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