// Import the styles for the storefront section
import "./StorefrontSection.css";

// Import the bakery storefront preview image
import storefrontPreview from "../../../assets/img/storefront-summary.png";

// Shows bakery owners what their public Bakeau storefront can look like
export default function StorefrontSection() {
    return (
        <section className="storefront-section">

            {/* Bootstrap container keeps the section aligned with the page */}
            <div className="container storefront-container">

                {/* Two-column layout: information on the left, preview on the right */}
                <div className="row align-items-center storefront-content">

                    {/* Left side */}
                    <div className="col-lg-6">

                        {/* Small section label */}
                        <p className="storefront-label">
                            YOUR STOREFRONT
                        </p>

                        {/* Main section heading */}
                        <h2 className="storefront-title">
                            A beautiful bakery page, ready to share.
                        </h2>

                        {/* Short explanation of the Bakeau storefront */}
                        <p className="storefront-description">
                            Every Bakeau bakery gets a branded storefront customers can browse
                            on any device. Feature your best products, collect orders, and
                            accept secure payments — all without social media.
                        </p>

                        {/* Main features included with each bakery storefront */}
                        <div className="storefront-benefits">

                            <p>
                                <span className="storefront-check">✓</span>
                                Your logo, colours, and cover image
                            </p>

                            <p>
                                <span className="storefront-check">✓</span>
                                Featured product carousel
                            </p>

                            <p>
                                <span className="storefront-check">✓</span>
                                Category browsing
                            </p>

                            <p>
                                <span className="storefront-check">✓</span>
                                Product customization
                            </p>

                            <p>
                                <span className="storefront-check">✓</span>
                                Verified customer reviews
                            </p>

                            <p>
                                <span className="storefront-check">✓</span>
                                Pickup scheduling at checkout
                            </p>

                        </div>

                        {/* Opens an example of a Bakeau bakery storefront */}
                        <button className="storefront-example-btn">
                            See example storefront →
                        </button>

                    </div>

                    {/* Right side - example of a bakery's public storefront */}
                    <div className="col-lg-6 d-flex justify-content-center">
                        <img
                            src={storefrontPreview}
                            alt="Sweet Crumbs bakery storefront example"
                            className="storefront-preview img-fluid"
                        />
                    </div>

                </div>

            </div>

        </section>
    );
}