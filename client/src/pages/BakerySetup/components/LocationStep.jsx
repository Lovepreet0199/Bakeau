//Display the Location and Content step of the bakery setup process
export default function LocationStep({
    formData,
    handleChange,
    handleContinue,
    handleBack
}) {
    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading">
                <h1>Location & Contact</h1>

                <p>Add your bakery's pickup location and contact information.</p>
            </div>

            <form
                className="bakery-setup-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleContinue();
                }}
            >

                {/* Street address */}
                <div className="mb-4">
                    <label
                        htmlFor="streetAddress"
                        className="form-label"
                    >
                        Street address
                    </label>

                    <input
                        type="text"
                        id="streetAddress"
                        name="street_address"
                        className="form-control"
                        value={formData.street_address}
                        onChange={handleChange}
                        placeholder="e.g. 225 Lakeshore Rd E"
                        autoComplete="street-address"
                        required
                    />
                </div>

                {/* City and province */}
                <div className="row">

                    <div className="col-md-6 mb-4">
                        <label
                            htmlFor="city"
                            className="form-label"
                        >
                            City
                        </label>

                        <input
                            type="text"
                            id="city"
                            name="city"
                            className="form-control"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Mississauga"
                            autoComplete="address-level2"
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-4">
                        <label
                            htmlFor="province"
                            className="form-label"
                        >
                            Province
                        </label>

                        <input
                            type="text"
                            id="province"
                            name="province"
                            className="form-control"
                            value={formData.province}
                            onChange={handleChange}
                            placeholder="e.g. Ontario"
                            autoComplete="address-level1"
                            required
                        />
                    </div>

                    {/* Postal code */}
                    <div className="mb-4">
                        <label
                            htmlFor="postalCode"
                            className="form-label"
                        >
                            Postal code
                        </label>

                        <input
                            type="text"
                            id="postalCode"
                            name="postal_code"
                            className="form-control"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="e.g. L5A 1B2"
                            autoComplete="postal-code"
                            required
                        />
                    </div>

                    {/* Contact information */}
                    <div className="row">

                        <div className="col-md-6 mb-4">
                            <label
                                htmlFor="contactEmail"
                                className="form-label"
                            >
                                Contact email
                            </label>

                            <input
                                type="email"
                                id="contactEmail"
                                name="contact_email"
                                className="form-control"
                                value={formData.contact_email}
                                onChange={handleChange}
                                placeholder="e.g. hello@sweetcrumbs.ca"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label
                                htmlFor="contactPhone"
                                className="form-label"
                            >
                                Contact phone
                            </label>

                            <input
                                type="tel"
                                id="contactPhone"
                                name="contact_phone"
                                className="form-control"
                                value={formData.contact_phone}
                                onChange={handleChange}
                                placeholder="e.g. 647-555-0123"
                                autoComplete="tel"
                                required
                            />
                        </div>

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