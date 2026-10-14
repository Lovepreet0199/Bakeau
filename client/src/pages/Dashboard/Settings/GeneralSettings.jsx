import API_URL from "../../../config/api.js";
//Import React hooks
import {
    useState
} from "react";

//Import Settings icons
import {
    LoaderCircle,
    Save
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";


//Displays and updates General Bakery settings
export default function GeneralSettings({
    bakery,
    setBakery
}) {

    //Stores editable General Bakery information
    const [formData, setFormData] = useState({
        name: bakery.name || "",

        description:
            bakery.description || "",

        contact_email:
            bakery.contact_email || "",

        contact_phone:
            bakery.contact_phone || "",

        street_address:
            bakery.address?.street || "",

        city:
            bakery.address?.city || "",

        province:
            bakery.address?.province || "",

        postal_code:
            bakery.address?.postal_code || ""
    });

    //Tracks whether the Bakery is being saved
    const [isSaving, setIsSaving] = useState(false);

    //Stores General Settings errors
    const [error, setError] = useState("");

    //Stores successful save message
    const [successMessage, setSuccessMessage] = useState("");


    //Updates the matching General Settings field
    function handleChange(event) {

        const {
            name,
            value
        } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));

        setError("");
        setSuccessMessage("");
    }


    //Saves General Bakery settings
    async function saveGeneralSettings(event) {

        event.preventDefault();

        setError("");
        setSuccessMessage("");


        //Validate required Bakery information
        if (
            !formData.name.trim() ||
            !formData.description.trim() ||
            !formData.contact_email.trim() ||
            !formData.contact_phone.trim() ||
            !formData.street_address.trim() ||
            !formData.city.trim() ||
            !formData.province.trim() ||
            !formData.postal_code.trim()
        ) {

            setError(
                "Please complete all required bakery information."
            );

            return;
        }


        setIsSaving(true);

        try {

            const token = getAuthToken();


            //Preserves the complete Bakery while updating General Settings
            const updatedBakeryData = {

                //General Bakery information
                name:
                    formData.name.trim(),

                description:
                    formData.description.trim(),

                contact_email:
                    formData.contact_email.trim(),

                contact_phone:
                    formData.contact_phone.trim(),


                //Policies
                pickup_instructions:
                    bakery.pickup_instructions || "",

                cancellation_policy:
                    bakery.cancellation_policy || "",

                custom_order_policy:
                    bakery.custom_order_policy || "",

                additional_policy_information:
                    bakery.additional_policy_information || "",


                //Bakery address
                address: {
                    street:
                        formData.street_address.trim(),

                    city:
                        formData.city.trim(),

                    province:
                        formData.province.trim(),

                    postal_code:
                        formData.postal_code.trim(),

                    country:
                        bakery.address?.country ||
                        "Canada"
                },


                //Storefront Settings
                storefront_theme:
                    bakery.storefront_theme,

                primary_color:
                    bakery.primary_color ||
                    "#C65F3A",

                secondary_color:
                    bakery.secondary_color ||
                    "#F4E8DF",

                dark_color:
                    bakery.dark_color ||
                    "#432C23",

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
                    bakery.timezone ||
                    "America/Toronto",

                currency:
                    bakery.currency ||
                    "CAD",

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


            const data =
                await response.json();


            //Stop if the Bakery could not be updated
            if (!response.ok) {

                const validationMessage =
                    data.errors?.[0]?.msg;

                throw new Error(
                    validationMessage ||
                    data.message ||
                    "Unable to update bakery settings"
                );
            }


            const updatedBakery =
                data.bakery || data;


            //Store the latest Bakery
            setBakery(updatedBakery);

            setSuccessMessage(
                "Bakery information saved successfully."
            );


        } catch (error) {

            setError(error.message);

        } finally {

            setIsSaving(false);
        }
    }


    return (
        <form
            className="bakery-settings-card"
            onSubmit={saveGeneralSettings}
        >

            {/* General Settings error */}
            {error && (

                <div className="bakery-settings-error">
                    {error}
                </div>

            )}


            {/* General Settings success */}
            {successMessage && (

                <div className="bakery-settings-success">
                    {successMessage}
                </div>

            )}


            {/* Bakery information */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Bakery information
                </h2>

                <p>
                    Update the information customers
                    see about your bakery.
                </p>

            </div>


            <div className="row g-3">

                {/* Bakery name */}
                <div className="col-12">

                    <label
                        htmlFor="name"
                        className="form-label"
                    >
                        Bakery name
                    </label>

                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Bakery description */}
                <div className="col-12">

                    <label
                        htmlFor="description"
                        className="form-label"
                    >
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        className="form-control bakery-settings-textarea"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Contact email */}
                <div className="col-12 col-md-6">

                    <label
                        htmlFor="contact_email"
                        className="form-label"
                    >
                        Contact email
                    </label>

                    <input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        className="form-control"
                        value={formData.contact_email}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Contact phone */}
                <div className="col-12 col-md-6">

                    <label
                        htmlFor="contact_phone"
                        className="form-label"
                    >
                        Contact phone
                    </label>

                    <input
                        type="tel"
                        id="contact_phone"
                        name="contact_phone"
                        className="form-control"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        required
                    />

                </div>

            </div>


            <div className="bakery-settings-divider"></div>


            {/* Pickup location */}
            <div className="bakery-settings-section-heading">

                <h2>
                    Pickup location
                </h2>

                <p>
                    This address is shown to customers
                    for order pickup.
                </p>

            </div>


            <div className="row g-3">

                {/* Street address */}
                <div className="col-12">

                    <label
                        htmlFor="street_address"
                        className="form-label"
                    >
                        Street address
                    </label>

                    <input
                        type="text"
                        id="street_address"
                        name="street_address"
                        className="form-control"
                        value={formData.street_address}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* City */}
                <div className="col-12 col-md-6">

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
                        required
                    />

                </div>


                {/* Province */}
                <div className="col-12 col-md-3">

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
                        required
                    />

                </div>


                {/* Postal code */}
                <div className="col-12 col-md-3">

                    <label
                        htmlFor="postal_code"
                        className="form-label"
                    >
                        Postal code
                    </label>

                    <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        className="form-control"
                        value={formData.postal_code}
                        onChange={handleChange}
                        required
                    />

                </div>

            </div>


            {/* General Settings actions */}
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