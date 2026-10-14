import API_URL from "../../../config/api.js";
//Import React hooks
import {
    useState
} from "react";

//Import Business Settings icons
import {
    Clock3,
    Info,
    LoaderCircle,
    Save
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";


//Displays and updates Bakery Business Settings
export default function BusinessSettings({
    bakery,
    setBakery
}) {

    //Stores editable Business Settings
    const [formData, setFormData] = useState({

        //Order notice
        minimum_order_notice:
            bakery.minimum_order_notice ?? 72,

        //Bakery timezone
        timezone:
            bakery.timezone || "America/Toronto",

        //Daily order limit
        maximum_orders_per_day:
            bakery.maximum_orders_per_day ?? 10,

        //Bakery availability
        accepting_orders:
            bakery.accepting_orders ?? true
    });


    //Tracks whether Business Settings are saving
    const [
        isSaving,
        setIsSaving
    ] = useState(false);

    //Stores Business Settings errors
    const [
        error,
        setError
    ] = useState("");

    //Stores successful save message
    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    //Available Canadian timezones
    const timezoneOptions = [
        {
            value: "America/Toronto",
            label: "Eastern Time - Toronto"
        },
        {
            value: "America/Winnipeg",
            label: "Central Time - Winnipeg"
        },
        {
            value: "America/Edmonton",
            label: "Mountain Time - Edmonton"
        },
        {
            value: "America/Vancouver",
            label: "Pacific Time - Vancouver"
        },
        {
            value: "America/Halifax",
            label: "Atlantic Time - Halifax"
        },
        {
            value: "America/St_Johns",
            label: "Newfoundland Time - St. John's"
        }
    ];


    //Updates a Business Settings field
    function handleChange(event) {

        //Get the changed field information
        const {
            name,
            value,
            type,
            checked
        } = event.target;


        //Update the matching Business Settings field
        setFormData((currentData) => ({
            ...currentData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));


        //Clear previous messages after a change
        setError("");
        setSuccessMessage("");
    }


    //Saves Business Settings
    async function saveBusinessSettings(event) {

        //Stop the browser from refreshing
        event.preventDefault();


        //Convert numeric values before validation
        const minimumOrderNotice =
            Number(formData.minimum_order_notice);

        const maximumOrdersPerDay =
            Number(formData.maximum_orders_per_day);


        //Validate minimum order notice
        if (
            !minimumOrderNotice ||
            minimumOrderNotice < 1
        ) {

            setError(
                "Minimum order notice must be at least 1 hour."
            );

            return;
        }


        //Validate maximum orders per day
        if (
            !maximumOrdersPerDay ||
            maximumOrdersPerDay < 1
        ) {

            setError(
                "Maximum orders per day must be at least 1."
            );

            return;
        }


        //Validate timezone
        if (!formData.timezone) {

            setError(
                "Please select a timezone."
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


            //Preserve the existing Bakery while changing Business fields
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
                    bakery.pickup_instructions || "",

                cancellation_policy:
                    bakery.cancellation_policy || "",

                custom_order_policy:
                    bakery.custom_order_policy || "",

                additional_policy_information:
                    bakery.additional_policy_information || "",

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
                    minimumOrderNotice,

                timezone:
                    formData.timezone,

                currency:
                    bakery.currency || "CAD",

                maximum_orders_per_day:
                    maximumOrdersPerDay,

                accepting_orders:
                    formData.accepting_orders,

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
                `${API_URL}/api/bakeries/mine`,
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


            //Stop if Business Settings could not be saved
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update business settings"
                );
            }


            //Get the updated Bakery
            const updatedBakery =
                data.bakery || data;


            //Update the Bakery stored by the Settings page
            setBakery(updatedBakery);


            //Display successful save message
            setSuccessMessage(
                "Business settings saved successfully."
            );


        } catch (error) {

            //Display the Business Settings error
            setError(error.message);

        } finally {

            //Stop the save state
            setIsSaving(false);
        }
    }


    return (
        <form
            className="bakery-settings-card"
            onSubmit={saveBusinessSettings}
        >

            {/* Business Settings error */}
            {error && (

                <div className="bakery-settings-error">
                    {error}
                </div>

            )}


            {/* Business Settings success */}
            {successMessage && (

                <div className="bakery-settings-success">
                    {successMessage}
                </div>

            )}


            {/* Order Settings heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Order settings
                </h2>

                <p>
                    Control when customers can place
                    orders and how many orders your
                    bakery can accept each day.
                </p>

            </div>


            <div className="row g-3">

                {/* Minimum order notice */}
                <div className="col-12 col-md-6">

                    <label
                        htmlFor="minimum_order_notice"
                        className="form-label"
                    >
                        Minimum order notice
                    </label>

                    <div className="bakery-settings-input-unit">

                        <input
                            type="number"
                            id="minimum_order_notice"
                            name="minimum_order_notice"
                            className="form-control"
                            min="1"
                            value={formData.minimum_order_notice}
                            onChange={handleChange}
                            required
                        />

                        <span>
                            hours
                        </span>

                    </div>

                    <p className="bakery-settings-field-help bakery-settings-field-help-bottom">
                        Customers must order at least this
                        many hours before pickup.
                    </p>

                </div>


                {/* Maximum orders per day */}
                <div className="col-12 col-md-6">

                    <label
                        htmlFor="maximum_orders_per_day"
                        className="form-label"
                    >
                        Maximum orders per day
                    </label>

                    <input
                        type="number"
                        id="maximum_orders_per_day"
                        name="maximum_orders_per_day"
                        className="form-control"
                        min="1"
                        value={formData.maximum_orders_per_day}
                        onChange={handleChange}
                        required
                    />

                    <p className="bakery-settings-field-help bakery-settings-field-help-bottom">
                        Sets the maximum number of orders
                        your bakery can accept each day.
                    </p>

                </div>


                {/* Timezone */}
                <div className="col-12">

                    <label
                        htmlFor="timezone"
                        className="form-label"
                    >
                        Timezone
                    </label>

                    <select
                        id="timezone"
                        name="timezone"
                        className="form-select"
                        value={formData.timezone}
                        onChange={handleChange}
                        required
                    >

                        {timezoneOptions.map((timezone) => (

                            <option
                                key={timezone.value}
                                value={timezone.value}
                            >
                                {timezone.label}
                            </option>

                        ))}

                    </select>

                    <p className="bakery-settings-field-help bakery-settings-field-help-bottom">
                        Used for order deadlines,
                        pickup times and other bakery
                        scheduling.
                    </p>

                </div>

            </div>


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Order availability heading */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Order availability
                </h2>

                <p>
                    Temporarily control whether customers
                    can place new orders.
                </p>

            </div>


            {/* Accepting orders */}
            <div className="bakery-settings-business-toggle">

                <div>

                    <strong>
                        Accepting orders
                    </strong>

                    <p>
                        When turned off, customers can
                        still view your storefront but
                        cannot place new orders.
                    </p>

                </div>


                {/* Accepting orders switch */}
                <label className="bakery-settings-switch">

                    <input
                        type="checkbox"
                        name="accepting_orders"
                        checked={formData.accepting_orders}
                        onChange={handleChange}
                    />

                    <span className="bakery-settings-switch-slider"></span>

                </label>

            </div>


            {/* Order availability status */}
            <div
                className={
                    formData.accepting_orders
                        ? "bakery-settings-order-status accepting"
                        : "bakery-settings-order-status paused"
                }
            >

                <span className="bakery-settings-order-status-dot"></span>

                <div>

                    <strong>
                        {formData.accepting_orders
                            ? "Your bakery is accepting orders"
                            : "New orders are paused"
                        }
                    </strong>

                    <p>
                        {formData.accepting_orders
                            ? "Customers can currently place new orders through your storefront."
                            : "Customers cannot place new orders until you turn order acceptance back on."
                        }
                    </p>

                </div>

            </div>


            {/* Section divider */}
            <div className="bakery-settings-divider"></div>


            {/* Pickup Scheduling information */}
            <div className="bakery-settings-business-info">

                <div className="bakery-settings-business-info-icon">

                    <Clock3
                        size={18}
                        strokeWidth={1.8}
                    />

                </div>

                <div>

                    <strong>
                        Pickup availability
                    </strong>

                    <p>
                        Your available pickup dates and
                        time windows are managed separately
                        from Business Settings in the
                        Pickup Schedule page.
                    </p>

                </div>

                <Info
                    size={17}
                    strokeWidth={1.8}
                    className="bakery-settings-business-info-secondary-icon"
                />

            </div>


            {/* Business Settings actions */}
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