//React Router components used to define the application's pages
import { Routes, Route } from "react-router-dom";

//Import the public Bakeau landing page
import LandingPage from "./pages/LandingPage/LandingPage";

//Import the Bakery Owner registration page
import Register from "./pages/Register/Register";

//Import the email verification instruction page
import CheckEmail from "./pages/CheckEmail/CheckEmail";

//Import the email verification page
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";

//Import the Bakeau login page
import Login from "./pages/Login/Login";

//Import the bakery setup page
import BakerySetup from "./pages/BakerySetup/BakerySetup";

//Import the shared Bakery Owner dashboard layout
import BakeryDashboardLayout from "./pages/Dashboard/BakeryDashboardLayout";

//Import Bakery Owner dashboard pages
import BakeryDashboard from "./pages/Dashboard/BakeryDashboard";

//Import the Bakery Owner products page
import BakeryProducts from "./pages/Dashboard/BakeryProducts";

//Import the Bakery Owner Add Product page
import BakeryAddProduct from "./pages/Dashboard/BakeryAddProduct";

//Import Bakery Orders pages
import BakeryOrders from "./pages/Dashboard/BakeryOrders.jsx";
import BakeryOrderDetails from "./pages/Dashboard/BakeryOrderDetails.jsx";

//Bakery Pickup SLots page
import BakeryPickupSlots from "./pages/Dashboard/BakeryPickupSlots.jsx";

//Displays the Bakeau application routes
export default function App() {

  return (
    <Routes>

      {/* Public Bakeau landing page */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* Bakery Owner registration page */}
      <Route
        path="/register"
        element={<Register />}
      />

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

      {/* Bakeau login page */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Bakery setup page for new Bakery Owners */}
      <Route
        path="/bakery-setup"
        element={<BakerySetup />}
      />

      {/* Shared layout for all Bakery Owner dashboard pages */}
      <Route
        path="/bakery"
        element={<BakeryDashboardLayout />}
      >

        {/* Bakery Owner dashboard overview */}
        <Route
          path="dashboard"
          element={<BakeryDashboard />}
        />

        {/* Bakery Owner products page */}
        <Route
          path="products"
          element={<BakeryProducts />}
        />

        {/* Bakery Owner Add Product page */}
        <Route
          path="products/new"
          element={<BakeryAddProduct />}
        />

        {/* Bakery Owner Edit Product page */}
        <Route
          path="products/:id/edit"
          element={<BakeryAddProduct />} />

        {/* Bakery Owner Orders page */}
        <Route
          path="orders"
          element={<BakeryOrders />} />

        {/* Bakery Owner Order Details page */}
        <Route
          path="orders/:id"
          element={<BakeryOrderDetails />} />

        <Route
          path="pickup-slots"
          element={<BakeryPickupSlots />}
        />

      </Route>

    </Routes>
  );
}