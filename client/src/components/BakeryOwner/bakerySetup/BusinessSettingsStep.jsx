//Displays the Business Settings step of the bakery setup process
export default function BusinessSettingsStep({
    formData,
    handleChange,
    handleContinue,
    handleBack
}) {
    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading mb-4">

                <h1>Business settings</h1>

                <p className="mb-0">
                    Set basic order rules for your bakery.
                </p>

            </div>

            <form
                className="bakery-setup-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleContinue();
                }}
            >

                {/* Minimum order notice */}
                <div className="mb-4">

                    <label
                        htmlFor="minimumOrderNotice"
                        className="form-label"
                    >
                        Minimum order notice
                        <span className="required-field"> *</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        Choose how many hours in advance customers must place an order.
                    </p>

                    <input
                        type="number"
                        id="minimumOrderNotice"
                        name="minimum_order_notice"
                        className="form-control"
                        value={formData.minimum_order_notice}
                        onChange={handleChange}
                        min="1"
                        required
                    />

                </div>

                {/* Timezone */}
                <div className="mb-4">

                    <label
                        htmlFor="timezone"
                        className="form-label"
                    >
                        Timezone
                        <span className="required-field"> *</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        This timezone will be used for pickup times and order deadlines.
                    </p>

                    <select
                        id="timezone"
                        name="timezone"
                        className="form-select"
                        value={formData.timezone}
                        onChange={handleChange}
                        required
                    >
                        <option value="America/Toronto">
                            Eastern Time - Toronto
                        </option>

                        <option value="America/Winnipeg">
                            Central Time - Winnipeg
                        </option>

                        <option value="America/Edmonton">
                            Mountain Time - Edmonton
                        </option>

                        <option value="America/Vancouver">
                            Pacific Time - Vancouver
                        </option>

                        <option value="America/Halifax">
                            Atlantic Time - Halifax
                        </option>

                        <option value="America/St_Johns">
                            Newfoundland Time - St. John's
                        </option>
                    </select>

                </div>

                {/* Maximum orders per day */}
                <div className="mb-4">

                    <label
                        htmlFor="maximumOrdersPerDay"
                        className="form-label"
                    >
                        Maximum orders per day
                        <span className="required-field"> *</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        Set the maximum number of customer orders your bakery can accept each day.
                    </p>

                    <input
                        type="number"
                        id="maximumOrdersPerDay"
                        name="maximum_orders_per_day"
                        className="form-control"
                        value={formData.maximum_orders_per_day}
                        onChange={handleChange}
                        min="1"
                        required
                    />

                </div>

                {/* Accepting orders */}
                <div className="mb-4 mt-2">

                    <div className="d-flex align-items-start justify-content-between gap-3 bakery-settings-switch-row">

                        <div>

                            <label
                                htmlFor="acceptingOrders"
                                className="form-label mb-1"
                            >
                                Accepting orders
                            </label>

                            <p className="bakery-setup-field-description mb-0">
                                Allow customers to place new orders from your storefront.
                            </p>

                        </div>

                        <div className="form-check form-switch">

                            <input
                                type="checkbox"
                                id="acceptingOrders"
                                name="accepting_orders"
                                className="form-check-input"
                                checked={formData.accepting_orders}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

                {/* Pickup availability information */}
                <div className="bakery-settings-info-box mb-4">

                    <h3 className="mb-2">
                        Pickup availability
                    </h3>

                    <p className="mb-0">
                        You can set specific pickup dates and time slots from your dashboard after setup.
                    </p>

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