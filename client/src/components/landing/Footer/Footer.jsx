//Import footer styles
import "./Footer.css";

export default function Footer() {
    return (
        // Footer contains Bakeau information and important navigation links
        <footer className="footer">

            {/* Keeps the footer aligned with the rest of the landing page */}
            <div className="container-fluid px-3 px-md-4">

                {/* Main footer content */}
                <div className="row footer-content">

                    {/* Bakeau brand information */}
                    <div className="col-lg-5 col-md-12 footer-brand">
                        <h3 className="footer-logo">
                            Bakeau
                        </h3>

                        <p className="footer-description">
                            Everything your bakery needs to sell online,
                            manage orders, and grow your business.
                        </p>
                    </div>

                    {/* Product navigation */}
                    <div className="col-lg-2 col-md-4 col-6 footer-column">
                        <h4>PRODUCT</h4>

                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#">For Bakeries</a>
                    </div>

                    {/* Help navigation */}
                    <div className="col-lg-2 col-6 footer-column">
                        <h4>HELP</h4>

                        <a href="#">Help Center</a>
                        <a href="#">Contact</a>
                    </div>

                    {/* Legal navigation */}
                    <div className="col-lg-3 col-md-4 col-6 footer-column">
                        <h4>LEGAL</h4>

                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>

                </div>

                {/* Bottom area of the footer */}
                <div className="footer-bottom">

                    {/* Separates the navigation from the copyright information */}
                    <div className="footer-divider"></div>

                    <p className="footer-copyright">
                        © 2026 Bakeau. All rights reserved.
                    </p>

                    <p className="footer-tagline">
                        Made for independent bakery owners.
                    </p>

                </div>

            </div>

        </footer>
    );
}

