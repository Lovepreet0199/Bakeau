//Import styles 
import "./CTASection.css";

export default function CTASection() {
    return (
        // Final call-to-action encourages bakery owners to get started
        <section className="cta-section">
            {/* Keeps the CTA content centered and aligned */}
            <div className="container-fluid px-3 px-md-4">

                {/* Main call-to-action content */}
                <div className="cta-content text-center mx-auto">

                    <h2 className="cta-title">
                        Ready to bring your bakery online?
                    </h2>

                    <p className="cta-description">
                        Bring your storefront, orders, payments, and customers
                        together with Bakeau.
                    </p>

                    {/* Main CTA takes bakery owners toward registration */}
                    <button className="cta-button">
                        Start Your Bakery
                    </button>

                    {/* Reinforces the free-trial details */}
                    <p className="cta-note">
                        14-day free trial · No credit card required · Cancel anytime
                    </p>

                </div>

            </div>
        </section>
    );
}