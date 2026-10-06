// React Router components used to define the application's pages
import { Routes, Route } from "react-router-dom";

// Bakeau pages
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./pages/Register/Register";

//Import the email verification instruction page
import CheckEmail from "./pages/CheckEmail/CheckEmail";

//Import the email verification page
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";

//Import the Bakeau login page
import Login from "./pages/Login/Login";

//Import the bakery setup page
import BakerySetup from "./pages/BakerySetup/BakerySetup";

export default function App() {
  return (
    <>
      {/* Routes checks the current URL and displays the matching page */}
      <Routes>
        {/* Public bakery landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Bakery owner registration page */}
        <Route path="/register" element={<Register />} />

        {/* Shows instructions after account registration */}
        <Route
          path="/check-email"
          element={<CheckEmail />}
        />

        {/* Verifies the email token sent to the user's inbox */}
        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/login"
          element={<Login />} />

        {/* Bakery setup page for new Bakery Owners */}
        <Route
          path="/bakery-setup"
          element={<BakerySetup />}
        />

      </Routes>
    </>
  );
}