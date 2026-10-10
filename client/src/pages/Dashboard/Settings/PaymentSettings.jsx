//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import Payment Settings icons
import {
    Banknote,
    CheckCircle2,
    CreditCard,
    ExternalLink,
    LoaderCircle,
    Save,
    WalletCards
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";


//Displays and updates Bakery Payment Settings
export default function PaymentSettings({
    bakery,
    setBakery
}) {

    //Stores editable Payment Settings
    const [formData, setFormData] = useState({

        //Payment requirement
        payment_rule:
            bakery.payment_rule || "full",

        //Deposit amount required
        deposit_percentage:
            bakery.deposit_percentage ?? 25,

        //Manual payment option
        allow_manual_payment:
            bakery.allow_manual_payment ?? false
    });


    //Tracks whether Stripe is loading
    const [
        isStripeLoading,
        setIsStripeLoading
    ] = useState(false);

    //Stores Stripe connection status
    const [
        stripeStatus,
        setStripeStatus
    ] = useState({
        connected: false,
        onboarding_complete: false
    });

    //Stores Stripe errors
    const [
        stripeError,
        setStripeError
    ] = useState("");

    //Tracks whether Payment Settings are saving
    const [
        isSaving,
        setIsSaving
    ] = useState(false);

    //Stores Payment Settings errors
    const [
        error,
        setError
    ] = useState("");

    //Stores successful save message
    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    //Loads the Bakery Owner's Stripe connection status
    useEffect(() => {

        //Loads Stripe status from the backend
        async function loadStripeStatus() {

            try {

                //Get the Bakery Owner's authentication token
                const token =
                    getAuthToken();


                //Get the Bakery Owner's Stripe status
                const response = await fetch(
                    "http://localhost:3000/api/bakeries/stripe/status",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                //Convert the backend response into JavaScript
                const data =
                    await response.json();


                //Stop if Stripe status could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to get Stripe status"
                    );
                }


                //Store the current Stripe connection status
                setStripeStatus(data);


                //Clear previous Stripe errors
                setStripeError("");


            } catch (error) {

                //Display the Stripe status error
                setStripeError(error.message);
            }
        }


        //Load Stripe status when Payment Settings open
        loadStripeStatus();


        //Refresh Stripe status when the Owner returns from Stripe
        function handleWindowFocus() {
            loadStripeStatus();
        }


        //Listen for the Owner returning to Bakeau
        window.addEventListener(
            "focus",
            handleWindowFocus
        );


        //Remove the browser event listener
        return () => {

            window.removeEventListener(
                "focus",
                handleWindowFocus
            );
        };

    }, []);


    //Updates a Payment Settings field
    function handleChange(event) {

        //Get the changed field information
        const {
            name,
            value,
            type,
            checked
        } = event.target;


        //Update the matching Payment Settings field
        setFormData((currentData) => ({
            ...currentData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));


        //Clear previous messages
        setError("");
        setSuccessMessage("");
    }


    //Selects the payment requirement
    function selectPaymentRule(paymentRule) {

        //Update the selected payment rule
        setFormData((currentData) => ({
            ...currentData,
            payment_rule: paymentRule
        }));


        //Clear previous messages
        setError("");
        setSuccessMessage("");
    }


    //Starts or continues Stripe onboarding
    async function handleConnectStripe() {

        //Clear previous Stripe errors
        setStripeError("");


        //Start the Stripe loading state
        setIsStripeLoading(true);


        //Open a new tab immediately to avoid popup blocking
        const stripeWindow =
            window.open("", "_blank");


        //Stop if the browser blocked the Stripe tab
        if (!stripeWindow) {

            setStripeError(
                "Please allow pop-ups to continue with Stripe setup."
            );

            setIsStripeLoading(false);

            return;
        }


        try {

            //Get the Bakery Owner's authentication token
            const token =
                getAuthToken();


            //Create or continue Stripe onboarding
            const response = await fetch(
                "http://localhost:3000/api/bakeries/stripe/connect",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if Stripe onboarding could not start
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to connect Stripe"
                );
            }


            //Send the opened tab to Stripe onboarding
            stripeWindow.location.href =
                data.onboarding_url;


        } catch (error) {

            //Close the empty Stripe tab
            stripeWindow.close();


            //Display the Stripe connection error
            setStripeError(error.message);

        } finally {

            //Stop the Stripe loading state
            setIsStripeLoading(false);
        }
    }


    //Opens the Stripe Dashboard
    function handleManageStripe() {

        window.open(
            "https://dashboard.stripe.com/",
            "_blank"
        );
    }


    //Saves Payment Settings
    async function savePaymentSettings(event) {

        //Stop the browser from refreshing
        event.preventDefault();


        //Convert deposit percentage into a number
        const depositPercentage =
            Number(formData.deposit_percentage);


        //Validate deposit percentage
        if (
            formData.payment_rule === "deposit" &&
            (
                !depositPercentage ||
                depositPercentage < 1 ||
                depositPercentage > 100
            )
        ) {

            setError(
                "Deposit percentage must be between 1 and 100."
            );

            return;
        }


        //Start the save state
        setIsSaving(true);


        //Clear previous messages
        setError("");
        setSuccessMessage("");


        try {

            //Get the Bakery Owner's authentication token
            const token =
                getAuthToken();


            //Create the Payment Settings update
            const paymentSettingsData = {

                payment_rule:
                    formData.payment_rule,

                deposit_percentage:
                    depositPercentage,

                allow_manual_payment:
                    formData.allow_manual_payment
            };


            //Update the Bakery Payment Settings
            const response = await fetch(
                "http://localhost:3000/api/bakeries/mine/payment-settings",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        paymentSettingsData
                    )
                }
            );


            //Convert the backend response into JavaScript
            const data =
                await response.json();


            //Stop if Payment Settings could not be saved
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update payment settings"
                );
            }


            //Get the updated Bakery
            const updatedBakery =
                data.bakery || data;


            //Update the Bakery stored by Settings
            setBakery(updatedBakery);


            //Display successful save message
            setSuccessMessage(
                "Payment settings saved successfully."
            );


        } catch (error) {

            //Display the Payment Settings error
            setError(error.message);

        } finally {

            //Stop the save state
            setIsSaving(false);
        }
    }


    return (
        <form
            className="bakery-settings-card"
            onSubmit={savePaymentSettings}
        >

            {/* Payment Settings error */}
            {error && (

                <div className="bakery-settings-error">
                    {error}
                </div>

            )}


            {/* Payment Settings success */}
            {successMessage && (

                <div className="bakery-settings-success">
                    {successMessage}
                </div>

            )}


            {/* Online payments heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Online payments
                </h2>

                <p>
                    Connect Stripe to securely accept
                    online payments through your storefront.
                </p>

            </div>


            {/* Stripe connection card */}
            <div className="bakery-settings-stripe-card">

                <div className="bakery-settings-stripe-header">

                    {/* Stripe branding */}
                    <div className="bakery-settings-stripe-brand">

                        <div className="bakery-settings-stripe-logo">
                            S
                        </div>

                        <div>

                            <strong>
                                Stripe
                            </strong>

                            <p>
                                Secure card payments,
                                deposits and payouts.
                            </p>

                        </div>

                    </div>


                    {/* Stripe connection status */}
                    {stripeStatus.onboarding_complete ? (

                        <span className="bakery-settings-stripe-badge connected">

                            <CheckCircle2
                                size={14}
                                strokeWidth={2}
                            />

                            Connected

                        </span>

                    ) : stripeStatus.connected ? (

                        <span className="bakery-settings-stripe-badge incomplete">
                            Setup incomplete
                        </span>

                    ) : (

                        <span className="bakery-settings-stripe-badge not-connected">
                            Not connected
                        </span>

                    )}

                </div>


                {/* Connected Stripe message */}
                {stripeStatus.onboarding_complete && (

                    <div className="bakery-settings-stripe-status connected">

                        <strong>
                            Stripe is ready
                        </strong>

                        <p>
                            Your bakery is ready to accept
                            online payments through Stripe.
                        </p>

                    </div>

                )}


                {/* Incomplete Stripe message */}
                {stripeStatus.connected &&
                    !stripeStatus.onboarding_complete && (

                        <div className="bakery-settings-stripe-status incomplete">

                            <strong>
                                Stripe setup incomplete
                            </strong>

                            <p>
                                Complete Stripe onboarding to
                                start accepting online payments.
                            </p>

                        </div>

                    )}


                {/* Stripe error */}
                {stripeError && (

                    <div className="bakery-settings-stripe-error">
                        {stripeError}
                    </div>

                )}


                {/* Stripe action button */}
                <button
                    type="button"
                    className="bakery-settings-stripe-button"
                    onClick={
                        stripeStatus.onboarding_complete
                            ? handleManageStripe
                            : handleConnectStripe
                    }
                    disabled={isStripeLoading}
                >

                    {isStripeLoading ? (

                        <LoaderCircle
                            size={17}
                            strokeWidth={1.8}
                            className="bakery-settings-spinner"
                        />

                    ) : stripeStatus.onboarding_complete ? (

                        <ExternalLink
                            size={17}
                            strokeWidth={1.8}
                        />

                    ) : (

                        <CreditCard
                            size={17}
                            strokeWidth={1.8}
                        />

                    )}


                    {isStripeLoading
                        ? "Connecting to Stripe..."
                        : stripeStatus.onboarding_complete
                            ? "Manage Stripe"
                            : stripeStatus.connected
                                ? "Continue Stripe setup"
                                : "Connect Stripe"
                    }

                </button>

            </div>


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Payment requirement heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Payment requirement
                </h2>

                <p>
                    Choose how much customers must pay
                    when placing an order.
                </p>

            </div>


            {/* Payment requirement options */}
            <div className="row g-3">

                {/* Full payment */}
                <div className="col-12 col-md-6">

                    <button
                        type="button"
                        className={
                            formData.payment_rule === "full"
                                ? "bakery-settings-payment-option active"
                                : "bakery-settings-payment-option"
                        }
                        onClick={() =>
                            selectPaymentRule("full")
                        }
                    >

                        <div className="bakery-settings-payment-option-icon">

                            <CreditCard
                                size={20}
                                strokeWidth={1.8}
                            />

                        </div>


                        <div>

                            <strong>
                                Full payment
                            </strong>

                            <p>
                                Customers pay the full
                                order amount at checkout.
                            </p>

                        </div>


                        <span className="bakery-settings-payment-radio">

                            {formData.payment_rule === "full" && (
                                <span></span>
                            )}

                        </span>

                    </button>

                </div>


                {/* Deposit payment */}
                <div className="col-12 col-md-6">

                    <button
                        type="button"
                        className={
                            formData.payment_rule === "deposit"
                                ? "bakery-settings-payment-option active"
                                : "bakery-settings-payment-option"
                        }
                        onClick={() =>
                            selectPaymentRule("deposit")
                        }
                    >

                        <div className="bakery-settings-payment-option-icon">

                            <WalletCards
                                size={20}
                                strokeWidth={1.8}
                            />

                        </div>


                        <div>

                            <strong>
                                Deposit
                            </strong>

                            <p>
                                Customers pay part of the
                                order at checkout and the
                                remaining balance later.
                            </p>

                        </div>


                        <span className="bakery-settings-payment-radio">

                            {formData.payment_rule === "deposit" && (
                                <span></span>
                            )}

                        </span>

                    </button>

                </div>

            </div>


            {/* Deposit percentage */}
            {formData.payment_rule === "deposit" && (

                <div className="bakery-settings-deposit-section">

                    <label
                        htmlFor="deposit_percentage"
                        className="form-label"
                    >
                        Deposit percentage
                    </label>


                    <div className="bakery-settings-input-unit">

                        <input
                            type="number"
                            id="deposit_percentage"
                            name="deposit_percentage"
                            className="form-control"
                            min="1"
                            max="100"
                            value={formData.deposit_percentage}
                            onChange={handleChange}
                            required
                        />

                        <span>
                            %
                        </span>

                    </div>


                    <p className="bakery-settings-field-help bakery-settings-field-help-bottom">
                        Customers will pay this percentage
                        when placing their order.
                    </p>

                </div>

            )}


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Manual payments heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Manual payments
                </h2>

                <p>
                    Choose whether customers can pay
                    outside Bakeau.
                </p>

            </div>


            {/* Manual payment toggle */}
            <div className="bakery-settings-business-toggle">

                <div>

                    <strong>
                        Manual / pay-at-pickup payments
                    </strong>

                    <p>
                        Allow customers to pay outside
                        Bakeau, such as at pickup.
                    </p>

                </div>


                <label className="bakery-settings-switch">

                    <input
                        type="checkbox"
                        name="allow_manual_payment"
                        checked={
                            formData.allow_manual_payment
                        }
                        onChange={handleChange}
                    />

                    <span className="bakery-settings-switch-slider"></span>

                </label>

            </div>


            {/* Manual payment information */}
            {formData.allow_manual_payment && (

                <div className="bakery-settings-payment-info">

                    <div className="bakery-settings-payment-info-icon">

                        <Banknote
                            size={18}
                            strokeWidth={1.8}
                        />

                    </div>


                    <div>

                        <strong>
                            Manual payments enabled
                        </strong>

                        <p>
                            Customers can arrange payment
                            outside the online Stripe
                            checkout process.
                        </p>

                    </div>

                </div>

            )}


            {/* Payment Settings actions */}
            <div className="bakery-settings-actions">

                <button
                    type="submit"
                    className="bakery-settings-save-button"
                    disabled={isSaving}
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