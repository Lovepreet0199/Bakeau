//Import the landing page components
import Navbar from "./components/landing/Navbar/Navbar";
import Hero from "./components/landing/Hero/Hero";
import StatsStrip from "./components/landing/StatsStrip/StatsStrip";
import ChallengeSection from "./components/landing/ChallengeSection/ChallengeSection";
import FeaturesSection from "./components/landing/FeaturesSection/FeaturesSection";
import HowItWorks from "./components/landing/HowItWorks/HowItWorks";
import StorefrontSection from "./components/landing/StorefrontSection/StorefrontSection";
import PricingSection from "./components/landing/PricingSection/PricingSection";
import FAQSection from "./components/landing/FAQSection/FAQSection";
import CTASection from "./components/landing/CTASection/CTASection";
import Footer from "./components/landing/Footer/Footer";

export default function App() {
  return (
    <>
      {/* Landing page navigation */}
      <Navbar />

      {/* Landing page hero section */}
      <Hero />

      {/* Statistics displayed below the Hero */}
      <StatsStrip />

      {/* Challenge section displayed below Statistics */}
      <ChallengeSection />

      {/* Bakeau Features section */}
      <FeaturesSection />

      {/* How it works section */}
      <HowItWorks />

      {/* Shows bakery owners what their public storefront can look like */}
      <StorefrontSection />

      {/* Displays Bakeau subscription plans and pricing */}
      <PricingSection />

      {/* Display FAQ section */}
      <FAQSection />

      {/* Final call-to-action section */}
      <CTASection />

      {/* Landing Page Footer */}
      <Footer />
    </>
  );
}