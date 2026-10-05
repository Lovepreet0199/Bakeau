// React Router components used to define the application's pages
import { Routes, Route } from "react-router-dom";

// Bakeau pages
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./pages/Register/Register";

//Import the email verification instruction page
import CheckEmail from "./pages/CheckEmail/CheckEmail";

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
      </Routes>
    </>
  );
}