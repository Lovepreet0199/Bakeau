// Landing page sections
import Navbar from "../../components/landing/Navbar/Navbar";
import Hero from "../../components/landing/Hero/Hero";
import StatsStrip from "../../components/landing/StatsStrip/StatsStrip";
import ChallengeSection from "../../components/landing/ChallengeSection/ChallengeSection";
import FeaturesSection from "../../components/landing/FeaturesSection/FeaturesSection";
import HowItWorks from "../../components/landing/HowItWorks/HowItWorks";
import StorefrontSection from "../../components/landing/StorefrontSection/StorefrontSection";
import PricingSection from "../../components/landing/PricingSection/PricingSection";
import FAQSection from "../../components/landing/FAQSection/FAQSection";
import CTASection from "../../components/landing/CTASection/CTASection";
import Footer from "../../components/landing/Footer/Footer";

// Combines all sections that make up the public Bakeau landing page
export default function LandingPage() {
    return (
        <>
            {/* Landing page navigation */}
            <Navbar />

            {/* Main hero section */}
            <Hero />

            {/* Quick Bakeau statistics */}
            <StatsStrip />

            {/* Shows the problems Bakeau helps bakery owners solve */}
            <ChallengeSection />

            {/* Highlights Bakeau's main features */}
            <FeaturesSection />

            {/* Explains how bakery owners get started with Bakeau */}
            <HowItWorks />

            {/* Shows an example of a bakery's public storefront */}
            <StorefrontSection />

            {/* Displays Bakeau subscription plans */}
            <PricingSection />

            {/* Answers common questions about Bakeau */}
            <FAQSection />

            {/* Final call-to-action */}
            <CTASection />

            {/* Landing page footer */}
            <Footer />
        </>
    );
}

