//Displays the Location and Contact step of the bakery setup process
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

                <p>
                    Add your bakery's pickup location and contact information.
                </p>

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
                        <span className="required-field"> *</span>
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
                <div className="row g-3 mb-1">

                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="city"
                            className="form-label"
                        >
                            City
                            <span className="required-field"> *</span>
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


                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="province"
                            className="form-label"
                        >
                            Province
                            <span className="required-field"> *</span>
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

                </div>


                {/* Postal code */}
                <div className="mb-4">

                    <label
                        htmlFor="postalCode"
                        className="form-label"
                    >
                        Postal code
                        <span className="required-field"> *</span>
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
                <div className="row g-3 mb-1">

                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="contactEmail"
                            className="form-label"
                        >
                            Contact email
                            <span className="required-field"> *</span>
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


                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="contactPhone"
                            className="form-label"
                        >
                            Contact phone
                            <span className="required-field"> *</span>
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