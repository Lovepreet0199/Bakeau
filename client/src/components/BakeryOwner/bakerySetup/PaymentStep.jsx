import API_URL from "../../../config/api.js";
//Allows the Payments step to track Stripe state and load connection status
import { useEffect, useState } from "react";

//Import helper used to get the saved authentication token
import { getAuthToken } from "../../../utils/authStorage";

//Displays the Payments step of the bakery setup process
export default function PaymentStep({
    formData,
    handleChange,
    handleContinue,
    handleBack,
    ensureBakeryExists
}) {

    //Tracks whether Bakeau is currently creating the Stripe onboarding link
    const [isStripeLoading, setIsStripeLoading] = useState(false);

    //Stores any Stripe connection error shown to the Bakery Owner
    const [stripeError, setStripeError] = useState("");

    //Stores Payment method validation errors
    const [paymentError, setPaymentError] = useState("");

    //Stores the current Stripe connection status for the Bakery Owner
    const [stripeStatus, setStripeStatus] = useState({
        connected: false,
        onboarding_complete: false
    });

    //Loads the Stripe connection status when the Payments step opens
    useEffect(() => {

        async function loadStripeStatus() {

            try {

                //Get the Bakery Owner's saved authentication token
                const token = getAuthToken();

                //Ask the backend for the current Stripe connection status
                const response = await fetch(
                    `${API_URL}/api/bakeries/stripe/status`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                //Convert the backend response to JavaScript
                const data = await response.json();

                //A new Bakery Owner may not have a bakery record yet
                if (response.status === 404) {
                    setStripeStatus({
                        connected: false,
                        onboarding_complete: false
                    });

                    return;
                }

                //Stop if the Stripe status could not be loaded
                if (!response.ok) {
                    throw new Error(data.message || "Unable to get Stripe status");
                }

                //Save the current Stripe connection status
                setStripeStatus(data);

            } catch (error) {

                //Show the Stripe status error to the Bakery Owner
                setStripeError(error.message);
            }
        }

        loadStripeStatus();

        //Refresh Stripe status when the Bakery Owner returns to the Bakeau tab
        function handleWindowFocus() {
            loadStripeStatus();
        }

        window.addEventListener("focus", handleWindowFocus);

        return () => {
            window.removeEventListener("focus", handleWindowFocus);
        };

    }, []);


    //Starts Stripe onboarding for the Bakery Owner
    async function handleConnectStripe() {

        //Clear any previous Stripe connection error
        setStripeError("");

        //Show the loading state while Bakeau prepares the Stripe connection
        setIsStripeLoading(true);

        //Open a new tab immediately so the browser does not block it
        const stripeWindow = window.open("", "_blank");

        //Stop if the browser blocked the new tab
        if (!stripeWindow) {
            setStripeError("Please allow pop-ups to continue with Stripe setup.");
            setIsStripeLoading(false);
            return;
        }

        try {

            //Make sure the bakery exists before starting Stripe onboarding
            const bakeryExists = await ensureBakeryExists();

            //Stop if the bakery could not be created or loaded
            if (!bakeryExists) {
                stripeWindow.close();
                setStripeError("Unable to prepare your bakery for Stripe setup.");
                return;
            }

            //Get the Bakery Owner's saved authentication token
            const token = getAuthToken();

            //Send a request to the backend to create or continue Stripe onboarding
            const response = await fetch(
                `${API_URL}/api/bakeries/stripe/connect`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            //Convert the backend response to JavaScript
            const data = await response.json();

            //Stop if the backend could not create the Stripe onboarding link
            if (!response.ok) {
                throw new Error(data.message || "Unable to connect Stripe");
            }

            //Send the new tab to Stripe's secure onboarding page
            stripeWindow.location.href = data.onboarding_url;

        } catch (error) {

            //Close the empty Stripe tab if the connection fails
            stripeWindow.close();

            //Show the Stripe connection error to the Bakery Owner
            setStripeError(error.message);

        } finally {

            //Remove the loading state after the request finishes
            setIsStripeLoading(false);
        }
    }

    //Opens the Stripe Dashboard for the Bakery Owner
    function handleManageStripe() {
        window.open("https://dashboard.stripe.com/", "_blank");
    }

    //Validates Payment methods before continuing
    async function handlePaymentContinue() {

        //Clear previous Payment errors
        setPaymentError("");


        //At least one Payment method must be selected
        if (
            !formData.allow_manual_payment &&
            !formData.allow_stripe_payment
        ) {

            setPaymentError(
                "Please enable at least one payment method."
            );

            return;
        }


        //Stripe must be connected if it is the only Payment method
        if (
            !formData.allow_manual_payment &&
            formData.allow_stripe_payment &&
            !stripeStatus.onboarding_complete
        ) {

            setPaymentError(
                "Complete Stripe setup or enable Manual payments before continuing."
            );

            return;
        }


        //Continue to the next Bakery Setup step
        await handleContinue();
    }

    return (
        <div className="bakery-setup-step">

            <div className="bakery-setup-step-heading mb-4">

                <h1>Payments</h1>

                <p className="mb-0">
                    Connect Stripe and choose how customers will pay for their orders
                </p>
            </div>

            <form
                className="bakery-setup-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    handlePaymentContinue();
                }}
            >

                {/* Store currency */}
                <div className="mb-4 bakery-currency-section">

                    <label
                        htmlFor="currency"
                        className="form-label"
                    >
                        Store currency
                        <span className="required-field"> *</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        Choose the currency used for all product prices and customer payments.
                    </p>

                    <select
                        id="currency"
                        name="currency"
                        className="form-select bakery-currency-select"
                        value={formData.currency}
                        onChange={handleChange}
                        required
                    >
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="EUR">EUR - Euro</option>
                    </select>

                </div>

                {/* Stripe connection */}
                <div className="bakery-payment-card mb-4">

                    <div className="d-flex flex-column gap-3">

                        <div>
                            <h3 className="mb-1">
                                Stripe
                            </h3>

                            <p className="bakery-setup-field-description mb-0">
                                Secure card payments, deposits, and payouts.
                            </p>
                            {/* Shows when a Stripe account exists but onboarding is not finished */}
                            {stripeStatus.connected && !stripeStatus.onboarding_complete && (
                                <div className="bakery-stripe-status bakery-stripe-status-incomplete">
                                    <strong>Stripe setup incomplete</strong>

                                    <p className="mb-0">
                                        Complete Stripe onboarding to start accepting online payments.
                                    </p>
                                </div>
                            )}

                            {/* Shows when Stripe onboarding is complete */}
                            {stripeStatus.connected && stripeStatus.onboarding_complete && (
                                <div className="bakery-stripe-status bakery-stripe-status-connected">

                                    <strong>Connected ✓</strong>

                                    <p className="mb-0">
                                        Stripe is connected and ready to accept online payments.
                                    </p>

                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn bakery-stripe-button w-100"
                            onClick={
                                stripeStatus.onboarding_complete
                                    ? handleManageStripe
                                    : handleConnectStripe
                            }
                            disabled={isStripeLoading}
                        >
                            {isStripeLoading
                                ? "Connecting to Stripe..."
                                : stripeStatus.onboarding_complete
                                    ? "Manage Stripe"
                                    : stripeStatus.connected
                                        ? "Continue Stripe setup"
                                        : "Connect Stripe"}
                        </button>

                    </div>

                    {stripeError && (
                        <p className="text-danger mt-2 mb-0">
                            {stripeError}
                        </p>
                    )}
                </div>

                {/* Stripe payment option */}
                <div className="bakery-payment-manual mb-4">

                    <div className="d-flex align-items-start justify-content-between gap-3">

                        <div>

                            <label
                                htmlFor="allowStripePayment"
                                className="form-label mb-1"
                            >
                                Stripe payments
                            </label>

                            <p className="bakery-setup-field-description mb-0">
                                Allow customers to pay securely
                                by card through Stripe.
                            </p>

                        </div>


                        <div className="form-check form-switch">

                            <input
                                type="checkbox"
                                id="allowStripePayment"
                                name="allow_stripe_payment"
                                className="form-check-input"
                                checked={
                                    formData.allow_stripe_payment
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

                {/* Payment rule */}
                <div className="mb-4">

                    <label className="form-label">
                        Payment rule
                        <span className="required-field"> *</span>
                    </label>

                    <p className="bakery-setup-field-description">
                        Choose how customers will pay when placing an order.
                    </p>

                </div>

                {/* Full payment option */}
                <div className="form-check bakery-payment-option mb-3">

                    <input
                        type="radio"
                        id="paymentRuleFull"
                        name="payment_rule"
                        value="full"
                        className="form-check-input"
                        checked={formData.payment_rule === "full"}
                        onChange={handleChange}
                    />

                    <label
                        htmlFor="paymentRuleFull"
                        className="form-check-label"
                    >
                        Full payment
                    </label>

                    <p className="bakery-setup-field-description mb-0">
                        Customers pay the full order amount at checkout.
                    </p>

                </div>

                {/* Deposit payment option */}
                <div className="form-check bakery-payment-option mb-3">

                    <input
                        type="radio"
                        id="paymentRuleDeposit"
                        name="payment_rule"
                        value="deposit"
                        className="form-check-input"
                        checked={formData.payment_rule === "deposit"}
                        onChange={handleChange}
                    />

                    <label
                        htmlFor="paymentRuleDeposit"
                        className="form-check-label"
                    >
                        Deposit
                    </label>

                    <p className="bakery-setup-field-description mb-0">
                        Customers pay part of the order at checkout and the remaining balance later.
                    </p>

                </div>
                {/* Deposit percentage */}
                {formData.payment_rule === "deposit" && (
                    <div className="mt-3 bakery-deposit-settings">

                        <label
                            htmlFor="depositPercentage"
                            className="form-label"
                        >
                            Deposit percentage
                            <span className="required-field"> *</span>
                        </label>

                        <p className="bakery-setup-field-description">
                            Choose what percentage of the order customers must pay at checkout.
                        </p>

                        <input
                            type="number"
                            id="depositPercentage"
                            name="deposit_percentage"
                            className="form-control"
                            value={formData.deposit_percentage}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            required
                        />

                    </div>
                )}

                {/* Manual payment option */}
                <div className="bakery-payment-manual mb-4">

                    <div className="d-flex align-items-start justify-content-between gap-3">

                        <div>

                            <label
                                htmlFor="allowManualPayment"
                                className="form-label mb-1"
                            >
                                Manual / pay-at-pickup payments
                            </label>

                            <p className="bakery-setup-field-description mb-0">
                                Allow customers to pay outside Bakeau, such as at pickup.
                            </p>

                        </div>

                        <div className="form-check form-switch">

                            <input
                                type="checkbox"
                                id="allowManualPayment"
                                name="allow_manual_payment"
                                className="form-check-input"
                                checked={formData.allow_manual_payment}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

                {/* Payment method error */}
                {paymentError && (

                    <p className="text-danger mb-3">
                        {paymentError}
                    </p>

                )}

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