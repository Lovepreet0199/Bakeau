//Import the styles used by the How It Works section
import "./HowItWorks.css";

//Explains the main steps for getting started with Bakeau
export default function HowItWorks() {
    return (
        <section className="how-it-works-section" id="how-it-works">

            {/* Bootstrap container keeps the content aligned with the landing page */}
            <div className="container-fluid px-3 px-md-4">

                {/* Section heading */}
                <div className="text-center">

                    {/* Small section label */}
                    <p className="how-it-works-label">
                        HOW BAKEAU WORKS
                    </p>

                    {/* Main section heading */}
                    <h2 className="how-it-works-title">
                        From sign-up to first order in minutes.
                    </h2>

                </div>

                {/* Steps showing how a bakery gets started with Bakeau */}
                <div className="row how-it-works-steps">

                    {/* Step 1 */}
                    <div className="col-12 col-md-6 col-lg text-center how-it-works-step">
                        <div className="how-it-works-number">
                            1
                        </div>

                        <h3 className="how-it-works-step-title">
                            Create your bakery
                        </h3>

                        <p className="how-it-works-step-description">
                            Sign up, name your bakery, and fill in your basics.
                            Takes less than 5 minutes.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="col-12 col-md-6 col-lg text-center how-it-works-step">
                        <div className="how-it-works-number">
                            2
                        </div>

                        <h3 className="how-it-works-step-title">
                            Add products
                        </h3>

                        <p className="how-it-works-step-description">
                            Upload photos, set prices, and define customization options.
                            Publish when you're ready.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="col-12 col-md-6 col-lg text-center how-it-works-step">
                        <div className="how-it-works-number">
                            3
                        </div>

                        <h3 className="how-it-works-step-title">
                            Publish your storefront
                        </h3>

                        <p className="how-it-works-step-description">
                            Share your unique Bakeau URL and start taking orders right away.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="col-12 col-md-6 col-lg text-center how-it-works-step">
                        <div className="how-it-works-number">
                            4
                        </div>

                        <h3 className="how-it-works-step-title">
                            Customers order and pay
                        </h3>

                        <p className="how-it-works-step-description">
                            Customers browse, customize, and pay securely with Stripe —
                            without you lifting a finger.
                        </p>
                    </div>

                    {/* Step 5 */}
                    {/* Final step is centered when it is alone on the tablet layout */}
                    <div className="col-12 col-md-6 offset-md-3 col-lg offset-lg-0 text-center how-it-works-step">
                        <div className="how-it-works-number">
                            5
                        </div>

                        <h3 className="how-it-works-step-title">
                            Manage from your dashboard
                        </h3>

                        <p className="how-it-works-step-description">
                            Confirm orders, track payments, manage pickup, and reply to
                            reviews — all from one place.
                        </p>
                    </div>

                </div>

                {/* Call to action after explaining the five steps */}
                <div className="text-center how-it-works-action">
                    <button className="how-it-works-btn">
                        Start Your Bakery
                    </button>
                </div>
            </div>

        </section>
    );
}