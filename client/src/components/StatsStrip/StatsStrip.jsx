//Import the styles used by the Stats Stripe Component
import "./StatsStrip.css";

//Statistics displayed below the Bakeau Hero section
export default function StatsStrip() {
    return (
        <section className="stats-strip">

            {/* Bootstrap container keeps the statistics aligned */}
            <div className="container-fluid px-4">
                {/* Bootstrap row creates the responsive statistics layout */}
                <div className="row text-center">

                    {/* Number of bakeries using Bakeau */}
                    <div className="col-12 col-sm-6 col-lg-3">
                        <h2 className="stats-number">500+</h2>
                        <p className="stats-label">bakeries onboarded</p>
                    </div>

                    {/* Number of orders processed through Bakeau */}
                    <div className="col-12 col-sm-6 col-lg-3">
                        <h2 className="stats-number">18k+</h2>
                        <p className="stats-label">orders processed</p>
                    </div>

                    {/* Average bakery rating */}
                    <div className="col-12 col-sm-6 col-lg-3">
                        <h2 className="stats-number">4.9★</h2>
                        <p className="stats-label">average bakery rating</p>
                    </div>

                    {/* Total payments made to bakery owners */}
                    <div className="col-12 col-sm-6 col-lg-3">
                        <h2 className="stats-number">$2.4M+</h2>
                        <p className="stats-label">paid to bakery owners</p>
                    </div>

                </div>
            </div>
        </section>
    );
}