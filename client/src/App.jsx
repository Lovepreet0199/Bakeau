//Import the navigation bar for the landing page
import Navbar from "./components/Navbar/Navbar";

//Import Hero section component for the landing page
import Hero from "./components/Hero/Hero"

//Import Stats Strip for the landing page
import StatsStrip from "./components/StatsStrip/StatsStrip";

//Import Challenge section for landing page
import ChallengeSection from "./components/ChallengeSection/ChallengeSection";

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
    </>
  );
}