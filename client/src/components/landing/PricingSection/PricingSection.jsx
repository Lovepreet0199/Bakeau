// React state lets us remember which billing option is selected
import { useState } from "react";

// Import the styles for the Pricing section
import "./PricingSection.css";

// Displays Bakeau subscription pricing
export default function PricingSection() {

    // Monthly pricing is selected when the page first loads
    const [billingPeriod, setBillingPeriod] = useState("monthly");

    // Professional is selected by default
    const [selectedPlan, setSelectedPlan] = useState("professional");

    return (
        <section className="pricing-section" id="pricing">

            {/* Bootstrap container keeps the pricing content centered */}
            <div className="container">

                {/* Pricing section heading */}
                <div className="text-center">

                    {/* Small section label */}
                    <p className="pricing-label">
                        PRICING
                    </p>

                    {/* Main pricing heading */}
                    <h2 className="pricing-title">
                        Simple, transparent pricing.
                    </h2>

                    {/* Short explanation underneath the heading */}
                    <p className="pricing-description">
                        Start free for 14 days. No credit card required.
                    </p>

                </div>
                {/* Lets the user switch between monthly and yearly pricing */}
                <div className="pricing-toggle d-flex justify-content-center align-items-center">

                    <button
                        className={`pricing-toggle-btn ${billingPeriod === "monthly" ? "active" : ""
                            }`}
                        onClick={() => setBillingPeriod("monthly")}
                    >
                        Monthly
                    </button>

                    <button
                        className={`pricing-toggle-btn ${billingPeriod === "yearly" ? "active" : ""
                            }`}
                        onClick={() => setBillingPeriod("yearly")}
                    >
                        Yearly
                    </button>

                    {/* Shows the discount available with yearly billing */}
                    <span className="pricing-save">
                        Save 20%
                    </span>

                </div>

                {/* Pricing plans */}
                <div className="row justify-content-center pricing-cards">

                    {/* Starter plan */}
                    <div className="col-lg-5 col-md-6">
                        {/* Clicking the card selects the Starter plan */}
                        <div
                            className={`pricing-card ${selectedPlan === "starter" ? "pricing-card-selected" : ""
                                }`}
                            onClick={() => setSelectedPlan("starter")}
                        >

                            {/* Plan name */}
                            <h3 className="pricing-card-title">
                                Starter
                            </h3>

                            {/* Who this plan is designed for */}
                            <p className="pricing-card-description">
                                Perfect for home bakers and small bakeries just getting started.
                            </p>

                            <div className="pricing-price">
                                <span className="pricing-amount">
                                    ${billingPeriod === "monthly" ? "19" : "15"}
                                </span>

                                <span className="pricing-period">/mo</span>
                            </div>

                            {/* Only shown when yearly billing is selected */}
                            {billingPeriod === "yearly" && (
                                <p className="pricing-billed-yearly">
                                    Billed yearly
                                </p>
                            )}

                            {/* Highlight the button when Starter is selected */}
                            <button
                                className={`pricing-trial-btn ${selectedPlan === "starter" ? "pricing-trial-btn-selected" : ""
                                    }`}
                            >
                                Start free trial
                            </button>

                            {/* Features included with the Starter plan */}
                            <div className="pricing-features">

                                <p><span>✓</span> 1 bakery storefront</p>
                                <p><span>✓</span> Up to 20 products</p>
                                <p><span>✓</span> Stripe payment processing</p>
                                <p><span>✓</span> Order management</p>
                                <p><span>✓</span> Pickup scheduling</p>
                                <p><span>✓</span> Customer profiles</p>
                                <p><span>✓</span> Verified reviews</p>
                                <p><span>✓</span> Email support</p>

                            </div>

                        </div>
                    </div>

                    {/* Professional plan */}
                    <div className="col-lg-5 col-md-6">
                        {/* Professional starts selected, but the user can switch plans */}
                        <div
                            className={`pricing-card ${selectedPlan === "professional" ? "pricing-card-selected" : ""
                                }`}
                            onClick={() => setSelectedPlan("professional")}
                        >

                            {/* Shows that Professional is the recommended plan */}
                            <p className="pricing-popular">
                                MOST POPULAR
                            </p>

                            {/* Plan name */}
                            <h3 className="pricing-card-title">
                                Professional
                            </h3>

                            {/* Who this plan is designed for */}
                            <p className="pricing-card-description">
                                For established bakeries with higher order volume
                                and customization needs.
                            </p>

                            {/* Professional price changes with the selected billing period */}
                            <div className="pricing-price">
                                <span className="pricing-amount">
                                    ${billingPeriod === "monthly" ? "49" : "39"}
                                </span>

                                <span className="pricing-period">
                                    /mo
                                </span>
                            </div>

                            {/* Only shown when yearly billing is selected */}
                            {billingPeriod === "yearly" && (
                                <p className="pricing-billed-yearly">
                                    Billed yearly
                                </p>
                            )}

                            {/* Highlight the button when Professional is selected */}
                            <button
                                className={`pricing-trial-btn ${selectedPlan === "professional" ? "pricing-trial-btn-selected" : ""
                                    }`}
                            >
                                Start free trial
                            </button>

                            {/* Features included with Professional */}
                            <div className="pricing-features">

                                <p><span>✓</span> 1 bakery storefront</p>
                                <p><span>✓</span> Unlimited products</p>
                                <p><span>✓</span> Stripe payment processing</p>
                                <p><span>✓</span> Full order management</p>
                                <p><span>✓</span> Advanced pickup scheduling</p>
                                <p><span>✓</span> Customer profiles + notes</p>
                                <p><span>✓</span> Verified reviews + replies</p>
                                <p><span>✓</span> Inventory management</p>
                                <p><span>✓</span> Sales analytics dashboard</p>
                                <p><span>✓</span> Priority support</p>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </section>
    );
}