//Allows the bakery setup process to manage its steps and form information
import { useState } from "react";

//Import the Bakery Basics step
import BakeryBasicsStep from "./components/BakeryBasicsStep";

//Import the Location and Contact step
import LocationStep from "./components/LocationStep";

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
        contact_phone: ""
    });


    //Updates the matching form field whenever the Bakery Owner enters information
    function handleChange(event) {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
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

        const nextStep = currentStep + 1;

        setCurrentStep(nextStep);

        //Only increases the furthest step reached when moving forward
        if (nextStep > highestStepReached) {
            setHighestStepReached(nextStep);
        }
    }

    function handleBack() {
        const previousStep = currentStep - 1;
        setCurrentStep(previousStep);
    }


    return (
        <main className="bakery-setup-page min-vh-100">

            <div className="container-fluid p-0">
                <div className="row g-0 min-vh-100">

                    {/* Left side displays Bakeau branding and bakery imagery */}
                    <aside className="col-lg-3 bakery-setup-sidebar">

                        <div className="bakery-setup-sidebar-content">

                            <a
                                href="/"
                                className="bakery-setup-logo"
                            >
                                Bakeau
                            </a>

                            <div className="bakery-setup-sidebar-text">

                                <h2>
                                    Build your bakery,
                                    <br />
                                    your way.
                                </h2>

                                <p>
                                    Set up your storefront, customize your brand,
                                    and start accepting orders.
                                </p>

                            </div>

                        </div>

                    </aside>


                    {/* Right side contains the bakery setup process */}
                    <section className="col-lg-9 bakery-setup-content">

                        <div className="bakery-setup-form-container">

                            {/* Shows the owner's progress through the bakery setup process */}
                            <div className="bakery-setup-progress">

                                <p className="bakery-setup-step-number">
                                    Step {currentStep} of {setupSteps.length}
                                </p>

                                <div className="bakery-setup-progress-bars">

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
                                                        ? "bakery-setup-progress-step active"
                                                        : "bakery-setup-progress-step"
                                                }
                                                disabled={!canVisitStep}
                                                onClick={() =>
                                                    setCurrentStep(stepNumber)
                                                }
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

                        </div>

                    </section>

                </div>
            </div>

        </main>
    );
}