//Import the landing page components
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import StatsStrip from "./components/StatsStrip/StatsStrip";
import ChallengeSection from "./components/ChallengeSection/ChallengeSection";
import FeaturesSection from "./components/FeaturesSection/FeaturesSection";

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
    </>
  );
}