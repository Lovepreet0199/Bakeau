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

//Bakery settings page
import BakerySettings from "./pages/Dashboard/Settings/BakerySettings.jsx";

//Import Bakery Help & Support page
import BakeryHelpSupport from "./pages/Dashboard/BakeryHelpSupport.jsx";

//Import Bakery Inventory page
import BakeryInventory from "./pages/Dashboard/BakeryInventory.jsx";

//Import the public Bakery customer Storefront
import BakeryStorefront from "./pages/Storefront/BakeryStorefront";

//Import public Storefront Product page
import StorefrontProduct from "./pages/Storefront/StorefrontProduct.jsx"

//Import Customer Cart Provider
import CartProvider from "./context/CartProvider";

//Import public Storefront Cart page
import StorefrontCart from "./pages/Storefront/StorefrontCart.jsx";

//Import Customer registration
import CustomerRegister from "./pages/Storefront/CustomerRegister";

//Import Customer Storefront Login
import CustomerLogin from "./pages/Storefront/CustomerLogin";

//Import Customer Account page
import CustomerAccount from "./pages/Storefront/CustomerAccount";

//Import Storefront Checkout
import StorefrontCheckout from "./pages/Storefront/StorefrontCheckout";

//Import Checkout Contact Details
import StorefrontCheckoutDetails from "./pages/Storefront/StorefrontCheckoutDetails";

//Import Storefront Payment page
import StorefrontCheckoutPayment from "./pages/Storefront/StorefrontCheckoutPayment";

//Import Storefront Order Confirmation page
import StorefrontOrderConfirmation from "./pages/Storefront/StorefrontOrderConfirmation";

//Import Storefront Order Tracking page
import StorefrontOrderTracking from "./pages/Storefront/StorefrontOrderTracking";

//Import Customer My Orders page
import StorefrontMyOrders from "./pages/Storefront/StorefrontMyOrders";

//Import Bakery Owner Customers page
import BakeryCustomers from "./pages/Dashboard/BakeryCustomers.jsx";

//Import Storefront Leave Review page
import StorefrontLeaveReview from "./pages/Storefront/StorefrontLeaveReview.jsx";

//Displays the Bakeau application routes
export default function App() {

  return (
    //Make the Customer Cart available throughout Bakeau
    <CartProvider>
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

        {/* Bakery Customer registration page */}
        <Route
          path="/store/:slug/register"
          element={<CustomerRegister />}
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

        {/* Customer login page */}
        <Route
          path="/store/:slug/login"
          element={<CustomerLogin />}
        />

        {/* Customer Account Page */}
        <Route
          path="/store/:slug/account"
          element={<CustomerAccount />}
        />

        {/* Bakery setup page for new Bakery Owners */}
        <Route
          path="/bakery-setup"
          element={<BakerySetup />}
        />

        {/* Public customer Bakery Storefront */}
        <Route
          path="/store/:slug"
          element={<BakeryStorefront />}
        />

        {/* Public Storefront Product */}
        <Route
          path="/store/:slug/product/:productId"
          element={<StorefrontProduct />}
        />

        {/* Public Storefront Cart */}
        <Route
          path="/store/:slug/cart"
          element={<StorefrontCart />}
        />

        {/* Checkout page for storefront */}
        <Route
          path="/store/:slug/checkout"
          element={<StorefrontCheckout />}
        />

        {/* Checkout details route for storefront */}
        <Route
          path="/store/:slug/checkout/details"
          element={<StorefrontCheckoutDetails />}
        />

        {/* Payment Route for Customer storefront */}
        <Route
          path="/store/:slug/checkout/payment"
          element={<StorefrontCheckoutPayment />}
        />

        {/* Order confirmation for Customer storefront */}
        <Route
          path="/store/:slug/order/:orderId/confirmed"
          element={<StorefrontOrderConfirmation />}
        />

        {/* Order tracking for Customer storefront */}
        <Route
          path="/store/:slug/orders/:orderId"
          element={<StorefrontOrderTracking />}
        />
        {/* Customer orders route */}
        <Route
          path="/store/:slug/orders"
          element={<StorefrontMyOrders />}
        />

        {/* Customer Review route */}
        <Route
          path="/store/:slug/orders/:orderId/review"
          element={<StorefrontLeaveReview />}
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

          <Route
            path="settings"
            element={<BakerySettings />}
          />

          <Route
            path="help"
            element={<BakeryHelpSupport />}
          />

          <Route
            path="inventory"
            element={<BakeryInventory />}
          />

          {/* Bakery Owner Customers page */}
          <Route
            path="customers"
            element={<BakeryCustomers />}
          />

        </Route>

      </Routes>
    </CartProvider>
  );
}