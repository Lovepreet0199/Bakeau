//Allows the bakery setup process to manage its steps and form information
import { useState } from "react";

//Import the Bakery Basics step
import BakeryBasicsStep from "./components/BakeryBasicsStep";

//Import the Location and Contact step
import LocationStep from "./components/LocationStep";

//Import the Branding step
import BrandingStep from "./components/BrandingStep";

//Import the Business Settings step
import BusinessSettingsStep from "./components/BusinessSettingsStep";

//Import the Payments step
import PaymentStep from "./components/PaymentStep";

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


    //Moves the Bakery Owner to the next setup step after validation
    function handleContinue() {

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
                                />
                            )}

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
}