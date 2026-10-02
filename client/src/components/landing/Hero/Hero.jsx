//Import the styles used by the Hero component
import "./Hero.css";

//Import the dashboard preview image used in the Hero section
import dashboardPreview from "../../../assets/img/bakeau-dashboard-preview.png";

//Main Hero section for the Bakeau landing page
export default function Hero() {
    return (
        <section className="hero-section">

            {/* Keep the Hero content responsive with Bootstrap spacing */}
            <div className="container-fluid px-4">

                {/* Bootstrap row creates the two-column Hero layout */}
                <div className="row align-items-center">

                    {/* Left side of the Hero for the main marketing content */}
                    <div className="col-lg-6 text-center text-lg-start">

                        {/* Small label introducing who Bakeau is built for */}
                        <p className="hero-label">
                            FOR INDEPENDENT BAKERIES
                        </p>

                        {/* Main headline explaining Bakeau's value */}
                        <h1 className="hero-title">
                            Turn your passion into a thriving bakery.
                        </h1>

                        {/* Short description explaining what Bakeau provides */}
                        <p className="hero-description">
                            Bakeau gives independent bakeries a beautiful online storefront,
                            effortless order management, and secure payments — so you can
                            focus on what you love.
                        </p>

                        {/* Main Hero action buttons */}
                        <div className="hero-actions d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start align-items-stretch align-items-sm-center gap-3">

                            {/* Main call-to-action for bakery owners */}
                            <a href="/register" className="hero-primary-btn text-center">
                                Start Your Bakery
                            </a>

                            {/* Secondary action for viewing an example Bakeau storefront */}
                            <a href="#storefront" className="hero-secondary-btn text-center">
                                See a Live Example
                            </a>

                        </div>

                        {/* Benefits included with the Bakeau trial */}
                        <div className="hero-benefits d-flex flex-wrap justify-content-center justify-content-lg-start align-items-center gap-3">

                            {/* Highlights the free trial offered by Bakeau */}
                            <span>✓ 14-day free trial</span>

                            {/* Lets users know they can start without payment details */}
                            <span>✓ No credit card required</span>

                            {/* Lets bakery owners know they are not locked into the service */}
                            <span>✓ Cancel anytime</span>

                        </div>

                    </div>

                    {/* Right side of the Hero for the Bakeau dashboard preview */}
                    <div className="col-lg-6 d-flex justify-content-center">

                        {/* Dashboard preview image */}
                        <img
                            src={dashboardPreview}
                            alt="Bakeau bakery management dashboard preview"
                            className="hero-dashboard-image img-fluid"
                        />

                    </div>

                </div>

            </div>
        </section>
    );
}