//Import React hooks
import {
    useState
} from "react";

//Import Policy Settings icons
import {
    LoaderCircle,
    Save
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";


//Displays and updates Bakery Policy Settings
export default function PolicySettings({
    bakery,
    setBakery
}) {

    //Stores editable Bakery policies
    const [formData, setFormData] = useState({

        //Cancellation policy
        cancellation_policy:
            bakery.cancellation_policy || "",

        //Pickup instructions
        pickup_instructions:
            bakery.pickup_instructions || "",

        //Custom order policy
        custom_order_policy:
            bakery.custom_order_policy || "",

        //Additional policy information
        additional_policy_information:
            bakery.additional_policy_information || ""
    });


    //Tracks whether Policy Settings are saving
    const [
        isSaving,
        setIsSaving
    ] = useState(false);

    //Stores Policy Settings errors
    const [
        error,
        setError
    ] = useState("");

    //Stores successful save message
    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    //Maximum number of characters allowed for each policy
    const policyCharacterLimit = 1000;


    //Updates a Policy Settings field
    function handleChange(event) {

        //Get the changed field information
        const {
            name,
            value
        } = event.target;


        //Update the matching policy field
        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));


        //Clear previous messages
        setError("");
        setSuccessMessage("");
    }


    //Saves Bakery Policy Settings
    async function savePolicySettings(event) {

        //Stop the browser from refreshing
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


            //Preserve the existing Bakery while changing Policy fields
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
                    formData.pickup_instructions.trim(),

                cancellation_policy:
                    formData.cancellation_policy.trim(),

                custom_order_policy:
                    formData.custom_order_policy.trim(),

                additional_policy_information:
                    formData.additional_policy_information.trim(),

                //Location
                address:
                    bakery.address,

                //Storefront Settings
                storefront_theme:
                    bakery.storefront_theme,

                primary_color:
                    bakery.primary_color || "#C65F3A",

                secondary_color:
                    bakery.secondary_color || "#F4E8DF",

                dark_color:
                    bakery.dark_color || "#432C23",

                logo_image_url:
                    bakery.logo_image_url || "",

                logo_image_public_id:
                    bakery.logo_image_public_id || "",

                bakery_image_url:
                    bakery.bakery_image_url || "",

                bakery_image_public_id:
                    bakery.bakery_image_public_id || "",

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
                "http://localhost:3000/api/bakeries/mine",
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


            //Stop if Policy Settings could not be saved
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update bakery policies"
                );
            }


            //Get the updated Bakery
            const updatedBakery =
                data.bakery || data;


            //Update the Bakery stored by Settings
            setBakery(updatedBakery);


            //Update the form with saved policy values
            setFormData({
                cancellation_policy:
                    updatedBakery.cancellation_policy || "",

                pickup_instructions:
                    updatedBakery.pickup_instructions || "",

                custom_order_policy:
                    updatedBakery.custom_order_policy || "",

                additional_policy_information:
                    updatedBakery.additional_policy_information || ""
            });


            //Display successful save message
            setSuccessMessage(
                "Bakery policies saved successfully."
            );


        } catch (error) {

            //Display the Policy Settings error
            setError(error.message);

        } finally {

            //Stop the save state
            setIsSaving(false);
        }
    }


    return (
        <form
            className="bakery-settings-card"
            onSubmit={savePolicySettings}
        >

            {/* Policy Settings error */}
            {error && (

                <div className="bakery-settings-error">
                    {error}
                </div>

            )}


            {/* Policy Settings success */}
            {successMessage && (

                <div className="bakery-settings-success">
                    {successMessage}
                </div>

            )}


            {/* Bakery policies heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Bakery policies
                </h2>

                <p>
                    Provide customers with clear information
                    about cancellations, pickup and custom orders.
                </p>

            </div>


            {/* Cancellation policy */}
            <div className="bakery-settings-policy-field">

                <div className="bakery-settings-policy-label">

                    <div>

                        <label
                            htmlFor="cancellation_policy"
                            className="form-label"
                        >
                            Cancellation policy
                        </label>

                        <p>
                            Explain when customers can cancel
                            an order and whether refunds apply.
                        </p>

                    </div>


                    {/* Character count */}
                    <span>
                        {formData.cancellation_policy.length}
                        /{policyCharacterLimit}
                    </span>

                </div>


                <textarea
                    id="cancellation_policy"
                    name="cancellation_policy"
                    className="form-control bakery-settings-textarea"
                    maxLength={policyCharacterLimit}
                    rows="5"
                    placeholder="Example: Orders may be cancelled up to 48 hours before the scheduled pickup time..."
                    value={formData.cancellation_policy}
                    onChange={handleChange}
                />

            </div>


            {/* Section divider */}
            <div className="bakery-settings-policy-divider"></div>


            {/* Pickup instructions */}
            <div className="bakery-settings-policy-field">

                <div className="bakery-settings-policy-label">

                    <div>

                        <label
                            htmlFor="pickup_instructions"
                            className="form-label"
                        >
                            Pickup instructions
                        </label>

                        <p>
                            Tell customers where to go and
                            what they should know when picking
                            up their order.
                        </p>

                    </div>


                    {/* Character count */}
                    <span>
                        {formData.pickup_instructions.length}
                        /{policyCharacterLimit}
                    </span>

                </div>


                <textarea
                    id="pickup_instructions"
                    name="pickup_instructions"
                    className="form-control bakery-settings-textarea"
                    maxLength={policyCharacterLimit}
                    rows="5"
                    placeholder="Example: Please arrive during your selected pickup window and have your order number ready..."
                    value={formData.pickup_instructions}
                    onChange={handleChange}
                />

            </div>


            {/* Section divider */}
            <div className="bakery-settings-policy-divider"></div>


            {/* Custom order policy */}
            <div className="bakery-settings-policy-field">

                <div className="bakery-settings-policy-label">

                    <div>

                        <label
                            htmlFor="custom_order_policy"
                            className="form-label"
                        >
                            Custom order policy
                        </label>

                        <p>
                            Explain any requirements for
                            custom cakes, special requests
                            or personalized orders.
                        </p>

                    </div>


                    {/* Character count */}
                    <span>
                        {formData.custom_order_policy.length}
                        /{policyCharacterLimit}
                    </span>

                </div>


                <textarea
                    id="custom_order_policy"
                    name="custom_order_policy"
                    className="form-control bakery-settings-textarea"
                    maxLength={policyCharacterLimit}
                    rows="5"
                    placeholder="Example: Custom cake orders require at least seven days notice..."
                    value={formData.custom_order_policy}
                    onChange={handleChange}
                />

            </div>


            {/* Section divider */}
            <div className="bakery-settings-policy-divider"></div>


            {/* Additional policy information */}
            <div className="bakery-settings-policy-field">

                <div className="bakery-settings-policy-label">

                    <div>

                        <label
                            htmlFor="additional_policy_information"
                            className="form-label"
                        >
                            Additional information
                        </label>

                        <p>
                            Add any other important policy
                            information customers should know.
                        </p>

                    </div>


                    {/* Character count */}
                    <span>
                        {formData.additional_policy_information.length}
                        /{policyCharacterLimit}
                    </span>

                </div>


                <textarea
                    id="additional_policy_information"
                    name="additional_policy_information"
                    className="form-control bakery-settings-textarea"
                    maxLength={policyCharacterLimit}
                    rows="5"
                    placeholder="Add any additional bakery policies or customer information..."
                    value={formData.additional_policy_information}
                    onChange={handleChange}
                />

            </div>


            {/* Policy Settings actions */}
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