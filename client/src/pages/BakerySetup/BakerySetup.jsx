//Allows the bakery setup process to manage its steps and form information
import { useState } from "react";

//Import the Bakery Basics step
import BakeryBasicsStep from "../../components/BakeryOwner/bakerySetup/BakeryBasicsStep";

//Import the Location and Contact step
import LocationStep from "../../components/BakeryOwner/bakerySetup/LocationStep";

//Import the Branding step
import BrandingStep from "../../components/BakeryOwner/bakerySetup/BrandingStep";

//Import the Business Settings step
import BusinessSettingsStep from "../../components/BakeryOwner/bakerySetup/BusinessSettingsStep";

//Import the Payments step
import PaymentStep from "../../components/BakeryOwner/bakerySetup/PaymentStep";

//Import the Plan step
import PlanStep from "../../components/BakeryOwner/bakerySetup/PlanStep";

//Import helper used to get the saved authentication token
import { getAuthToken } from "../../utils/authStorage";

//Import the bakery setup page styles
import "./BakerySetup.css";


//Displays the bakery setup page for a new Bakery Owner
export default function BakerySetup() {

    //Keep track of the setup step currently being displayed
    const [currentStep, setCurrentStep] = useState(1);

    //Keep track of the furthest step the Bakery Owner has reached
    const [highestStepReached, setHighestStepReached] = useState(1);

    //Name of each step in the Bakery Owner setup process
    const setupSteps = [
        "Basics",
        "Location",
        "Branding",
        "Settings",
        "Payments",
        "Plan"
    ];

    //Stores the information entered during the bakery setup process
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        bakery_type: "",
        bakery_type_other: "",

        //Location and contact information
        street_address: "",
        city: "",
        province: "",
        postal_code: "",
        contact_email: "",
        contact_phone: "",

        //Branding information
        primary_color: "#C65F3A",
        secondary_color: "#F4E8DF",
        dark_color: "#432C23",

        //Branding images
        logo_image_url: "",
        logo_image_public_id: "",
        bakery_image_url: "",
        bakery_image_public_id: "",

        //Business settings
        minimum_order_notice: 72,
        timezone: "America/Toronto",
        maximum_orders_per_day: 10,
        accepting_orders: true,

        //Payment settings
        payment_rule: "full",
        deposit_percentage: 25,
        allow_manual_payment: false,
    });


    //Updates the matching form field whenever the Bakery Owner enters information
    function handleChange(event) {

        //Get the field information from the form element
        const { name, value, type, checked } = event.target;

        //Update the matching field and use checked for checkbox inputs
        setFormData((previousFormData) => ({
            ...previousFormData,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    //Makes sure the Bakery Owner has a bakery before Step 5 actions continue
    async function ensureBakeryExists() {

        //Get the Bakery Owner's saved authentication token
        const token = getAuthToken();

        //Check whether this Bakery Owner already has a bakery
        const existingBakeryResponse = await fetch(
            "http://localhost:3000/api/bakeries/mine",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        //The bakery already exists, so nothing else needs to be created
        if (existingBakeryResponse.ok) {
            return true;
        }

        //Stop if the request failed for a reason other than the bakery not existing
        if (existingBakeryResponse.status !== 404) {
            return false;
        }

        //Create the bakery using the information collected during setup
        const createBakeryResponse = await fetch(
            "http://localhost:3000/api/bakeries",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone,

                    address: {
                        street: formData.street_address,
                        city: formData.city,
                        province: formData.province,
                        postal_code: formData.postal_code,
                        country: "Canada"
                    },

                    primary_color: formData.primary_color,
                    secondary_color: formData.secondary_color,
                    dark_color: formData.dark_color,

                    logo_image_url: formData.logo_image_url,
                    logo_image_public_id: formData.logo_image_public_id,
                    bakery_image_url: formData.bakery_image_url,
                    bakery_image_public_id: formData.bakery_image_public_id,

                    minimum_order_notice: Number(formData.minimum_order_notice),
                    timezone: formData.timezone,
                    maximum_orders_per_day: Number(formData.maximum_orders_per_day),
                    accepting_orders: formData.accepting_orders,

                    payment_rule: formData.payment_rule,
                    deposit_percentage: Number(formData.deposit_percentage),
                    allow_manual_payment: formData.allow_manual_payment
                })
            }
        );

        //Stop if the bakery could not be created
        if (!createBakeryResponse.ok) {
            return false;
        }

        return true;
    }

    //Moves the Bakery Owner to the next setup step after validation
    async function handleContinue() {

        //Checks the required fields for Step 1
        if (currentStep === 1) {

            if (
                !formData.name.trim() ||
                !formData.description.trim() ||
                !formData.bakery_type
            ) {
                return;
            }

            //Other bakery types require an additional description
            if (
                formData.bakery_type === "other" &&
                !formData.bakery_type_other.trim()
            ) {
                return;
            }
        }

        //Checks the required fields for Step 2
        if (currentStep === 2) {

            if (
                !formData.street_address.trim() ||
                !formData.city.trim() ||
                !formData.province.trim() ||
                !formData.postal_code.trim() ||
                !formData.contact_email.trim() ||
                !formData.contact_phone.trim()
            ) {
                return;
            }
        }

        //Step 3 does not require validation because branding images are optional
        //and theme colors already have default values

        //Checks the required fields for Step 4
        if (currentStep === 4) {

            if (
                Number(formData.minimum_order_notice) < 1 ||
                !formData.timezone ||
                Number(formData.maximum_orders_per_day) < 1
            ) {
                return;
            }
        }

        //Checks the required fields for Step 5
        if (currentStep === 5) {

            //Stop if no payment rule is selected
            if (!formData.payment_rule) {
                return;
            }

            //Validate the deposit percentage when deposit payments are selected
            if (
                formData.payment_rule === "deposit" &&
                (
                    Number(formData.deposit_percentage) < 1 ||
                    Number(formData.deposit_percentage) > 100
                )
            ) {
                return;
            }

            //Make sure the bakery exists before moving to the Plan step
            const bakeryExists = await ensureBakeryExists();

            //Stop if the bakery could not be created or loaded
            if (!bakeryExists) {
                return;
            }

            //Get the Bakery Owner's saved authentication token
            const token = getAuthToken();

            //Save the latest payment settings
            const response = await fetch(
                "http://localhost:3000/api/bakeries/mine/payment-settings",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        payment_rule: formData.payment_rule,
                        deposit_percentage: Number(formData.deposit_percentage),
                        allow_manual_payment: formData.allow_manual_payment
                    })
                }
            );

            //Stop if the payment settings could not be saved
            if (!response.ok) {
                return;
            }

        }

        const nextStep = currentStep + 1;

        setCurrentStep(nextStep);

        //Only increases the furthest step reached when moving forward
        if (nextStep > highestStepReached) {
            setHighestStepReached(nextStep);
        }
    }


    //Moves the Bakery Owner to the previous setup step
    function handleBack() {

        const previousStep = currentStep - 1;

        setCurrentStep(previousStep);
    }

    //Completes the bakery setup process and sends the Bakery Owner to the dashboard
    async function handleFinishSetup() {

        try {

            //Get the Bakery Owner's saved authentication token
            const token = getAuthToken();

            //Mark the bakery setup process as completed
            const response = await fetch(
                "http://localhost:3000/api/bakeries/mine/complete-setup",
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            //Convert the backend response to JavaScript
            const data = await response.json();

            //Stop if the setup process could not be completed
            if (!response.ok) {
                throw new Error(data.message || "Unable to complete bakery setup");
            }

            //Send the Bakery Owner to the dashboard
            window.location.href = "/bakery/dashboard";

        } catch (error) {

            console.error("Bakery setup completion error:", error.message);
        }
    }


    return (
        <main className="bakery-setup-page min-vh-100">

            <div className="container-fluid p-0">

                <div className="row g-0 min-vh-100">

                    {/* Left side displays Bakeau branding and bakery imagery */}
                    <aside className="col-12 col-lg-3 bakery-setup-sidebar">

                        <div className="bakery-setup-sidebar-content d-flex flex-column justify-content-between px-4 px-md-5 py-4 py-lg-5">

                            <a
                                href="/"
                                className="bakery-setup-logo"
                            >
                                Bakeau
                            </a>

                            <div className="bakery-setup-sidebar-text mt-5 mt-lg-0">

                                <h2>
                                    Build your bakery,
                                    <br className="d-none d-sm-block" />
                                    {" "}your way.
                                </h2>

                                <p>
                                    Set up your storefront, customize your brand,
                                    and start accepting orders.
                                </p>

                            </div>

                        </div>

                    </aside>


                    {/* Right side contains the bakery setup process */}
                    <section className="col-12 col-lg-9 bakery-setup-content">

                        <div className="bakery-setup-form-container mx-auto px-3 px-sm-4 px-md-5 py-4 py-lg-5">

                            {/* Shows the owner's progress through the bakery setup process */}
                            <div className="bakery-setup-progress">

                                <p className="bakery-setup-step-number">
                                    Step {currentStep} of {setupSteps.length}
                                </p>

                                <div className="bakery-setup-progress-bars d-flex gap-2 gap-md-3 overflow-auto pb-2">

                                    {setupSteps.map((step, index) => {

                                        //Converts the array index into our 1-6 step numbering
                                        const stepNumber = index + 1;

                                        //A step can only be opened if the owner has already reached it
                                        const canVisitStep =
                                            stepNumber <= highestStepReached;

                                        return (
                                            <button
                                                key={step}
                                                type="button"
                                                className={
                                                    stepNumber === currentStep
                                                        ? "bakery-setup-progress-step active flex-grow-1"
                                                        : "bakery-setup-progress-step flex-grow-1"
                                                }
                                                disabled={!canVisitStep}
                                                onClick={() => setCurrentStep(stepNumber)}
                                            >
                                                <span className="bakery-setup-progress-bar"></span>

                                                <span className="bakery-setup-progress-label">
                                                    {step}
                                                </span>
                                            </button>
                                        );
                                    })}

                                </div>

                            </div>


                            {/* Step 1 - Bakery basics */}
                            {currentStep === 1 && (
                                <BakeryBasicsStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleContinue={handleContinue}
                                />
                            )}


                            {/* Step 2 - Location and contact */}
                            {currentStep === 2 && (
                                <LocationStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleContinue={handleContinue}
                                    handleBack={handleBack}
                                />
                            )}


                            {/* Step 3 - Branding */}
                            {currentStep === 3 && (
                                <BrandingStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleContinue={handleContinue}
                                    handleBack={handleBack}
                                />
                            )}


                            {/* Step 4 - Business settings */}
                            {currentStep === 4 && (
                                <BusinessSettingsStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleContinue={handleContinue}
                                    handleBack={handleBack}
                                />
                            )}

                            {/* Step 5 - Payments */}
                            {currentStep === 5 && (
                                <PaymentStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleContinue={handleContinue}
                                    handleBack={handleBack}
                                    ensureBakeryExists={ensureBakeryExists}
                                />
                            )}

                            {/* Step 6 - Plan */}
                            {currentStep === 6 && (
                                <PlanStep
                                    handleBack={handleBack}
                                    handleFinishSetup={handleFinishSetup}
                                />
                            )}

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}