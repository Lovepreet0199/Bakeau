//Import the styles used by the Features section
import "./FeaturesSection.css";

//Import the bakery storefront preview
import storefrontPreview from "../../../assets/img/storefront-preview.png";

//Main Features section for the Bakeau landing page
export default function FeaturesSection() {
    return (
        <section id="features" className="features-section" >

            {/* Responsive horizontal spacing for the Features section */}
            <div className="container-fluid px-3 px-md-4">

                {/* Small label introducing the Features section */}
                <p className="features-label">
                    BUILT FOR BAKERIES
                </p>

                {/* Heading row */}
                <div className="d-flex justify-content-between align-items-end">

                    {/* Main Features heading */}
                    <h2 className="features-title">
                        Powerful features. Real results.
                    </h2>

                </div>

                {/* Feature category buttons */}
                <div className="features-tabs d-flex flex-wrap align-items-center gap-2">

                    {/* Sell Online is the active feature by default */}
                    <button
                        type="button"
                        className="features-tab features-tab--active"
                    >
                        Sell Online
                    </button>

                    {/* Order management feature */}
                    <button
                        type="button"
                        className="features-tab"
                    >
                        Manage Orders
                    </button>

                    {/* Business growth feature */}
                    <button
                        type="button"
                        className="features-tab"
                    >
                        Grow Your Business
                    </button>

                </div>

                {/* Sell Online feature content */}
                <div className="row align-items-center features-content">

                    {/* Storefront preview displayed on the left */}
                    <div className="col-lg-6">

                        <img
                            src={storefrontPreview}
                            alt="Example Bakeau bakery storefront"
                            className="features-storefront-image img-fluid"
                        />

                    </div>

                    {/* Feature information is vertically centered beside the storefront preview */}
                    <div className="col-lg-6 d-flex align-items-center">

                        <div className="features-details">

                            {/* Feature heading */}
                            <h3 className="features-details-title">
                                A storefront as unique as your bakes.
                            </h3>

                            {/* Short explanation of the Bakeau storefront */}
                            <p className="features-details-description">
                                Showcase your products, accept custom orders, and get paid securely
                                — all on a beautiful, mobile-friendly storefront.
                            </p>

                            {/* Main benefits of the Bakeau storefront */}
                            <div className="features-benefits">

                                <p>✓ Branded bakery page (your logo, colors, photos)</p>

                                <p>✓ Custom product options (size, flavour, filling, etc.)</p>

                                <p>✓ Featured products and categories</p>

                                <p>✓ Secure payments with Stripe</p>

                            </div>

                            {/* Link to an example bakery storefront */}
                            <a href="/sweet-crumbs-bakery" className="features-example-btn">
                                See a Storefront Example →
                            </a>

                        </div>

                    </div>

                </div>
            </div>

        </section>
    );
}