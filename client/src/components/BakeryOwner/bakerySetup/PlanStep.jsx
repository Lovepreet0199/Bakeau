//Displays the final Plan step of the bakery setup process
export default function PlanStep({
    handleBack,
    handleFinishSetup
}) {
    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading mb-4">
                <h1>Choose your plan</h1>

                <p className="mb-0">
                    Bakeau is currently free during the demo period.
                </p>
            </div>

            {/* Free demo plan */}
            <div className="bakery-plan-card">

                <div className="mb-3">
                    <span className="bakery-plan-badge">
                        Current Plan
                    </span>
                </div>

                <h2>Free Demo</h2>

                <div className="bakery-plan-price mb-3">
                    <span className="bakery-plan-price-amount">$0</span>
                    <span className="bakery-plan-price-period"> / month</span>
                </div>

                <p className="bakery-setup-field-description">
                    Everything you need to create and manage your bakery storefront.
                </p>

                <ul className="bakery-plan-features mb-0">
                    <li>Online bakery storefront</li>
                    <li>Product and customization management</li>
                    <li>Customer order management</li>
                    <li>Stripe payment connection</li>
                    <li>Bakery branding and business settings</li>
                </ul>

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
                    type="button"
                    className="btn bakery-setup-continue-button order-1 order-sm-2"
                    onClick={handleFinishSetup}
                >
                    Finish Setup
                </button>

            </div>

        </div>
    );
}