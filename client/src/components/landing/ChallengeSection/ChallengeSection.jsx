//Import the styles used by the Challenge Section
import "./ChallengeSection.css";

//Import the icons used for the scattered order examples
import { FaInstagram, FaWhatsapp, FaPhone } from "react-icons/fa";
import { MdEmail, MdCalendarMonth } from "react-icons/md";
import { SiGooglesheets } from "react-icons/si";



//Section showing how Bakeau simplifies bakery order management
export default function ChallengeSection() {
    return (
        <section className="challenge-section">

            {/* Bootstrap container keeps the section content aligned */}
            <div className="container-fluid px-4">

                {/* Section heading */}
                <div className="text-center">

                    {/* Small label introducing the problem */}
                    <p className="challenge-label">
                        THE CHALLENGE
                    </p>

                    {/* Main Challenge section heading */}
                    <h2 className="challenge-title">
                        Orders shouldn't be this complicated.
                    </h2>

                </div>

                {/* Comparison between managing orders without and with Bakeau */}
                <div className="row g-4 challenge-comparison">

                    {/* Left side shows the scattered order management problem */}
                    <div className="col-lg-6">

                        {/* Label for the problem side */}
                        <p className="challenge-side-label challenge-side-label--without">
                            WITHOUT BAKEAU — THE DAILY JUGGLE
                        </p>

                        {/* Instagram order message */}
                        <div className="challenge-message-card d-flex align-items-center">

                            {/* Instagram icon */}
                            <div className="challenge-message-icon challenge-message-icon--instagram">
                                <FaInstagram />
                            </div>

                            {/* Message information */}
                            <div className="challenge-message-content flex-grow-1">

                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="challenge-message-title">
                                        Instagram DM
                                    </h3>

                                    <span className="challenge-message-time">
                                        2:14 PM
                                    </span>
                                </div>

                                <p className="challenge-message-text">
                                    Hi! Can I order a vanilla cake for Saturday? 3 tiers,
                                    buttercream, with roses please 🌹
                                </p>

                            </div>

                        </div>

                        {/* WhatsApp order message */}
                        <div className="challenge-message-card d-flex align-items-center">

                            {/* WhatsApp icon */}
                            <div className="challenge-message-icon challenge-message-icon--whatsapp">
                                <FaWhatsapp />
                            </div>

                            {/* Message information */}
                            <div className="challenge-message-content flex-grow-1">

                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="challenge-message-title">
                                        WhatsApp
                                    </h3>

                                    <span className="challenge-message-time">
                                        3:02 PM
                                    </span>
                                </div>

                                <p className="challenge-message-text">
                                    Hey, can you add 2 dozen cupcakes to my order? Chocolate &amp; vanilla.
                                </p>

                            </div>

                        </div>

                        {/* Email order message */}
                        <div className="challenge-message-card d-flex align-items-center">

                            {/* Email icon */}
                            <div className="challenge-message-icon challenge-message-icon--email">
                                <MdEmail />
                            </div>

                            {/* Message information */}
                            <div className="challenge-message-content flex-grow-1">

                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="challenge-message-title">
                                        Email
                                    </h3>

                                    <span className="challenge-message-time">
                                        4:18 PM
                                    </span>
                                </div>

                                <p className="challenge-message-text">
                                    Order request: 1 sourdough loaf + 6 croissants for Friday morning pickup.
                                </p>

                            </div>

                        </div>

                        {/* Spreadsheet order tracking */}
                        <div className="challenge-message-card d-flex align-items-center">

                            {/* Google Sheets icon */}
                            <div className="challenge-message-icon challenge-message-icon--spreadsheet">
                                <SiGooglesheets />
                            </div>

                            {/* Spreadsheet information */}
                            <div className="challenge-message-content flex-grow-1">

                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="challenge-message-title">
                                        Spreadsheet
                                    </h3>

                                    <span className="challenge-message-time">
                                        5:30 PM
                                    </span>
                                </div>

                                <p className="challenge-message-text">
                                    Update Saturday orders, deposits, pickup times, and customer notes.
                                </p>

                            </div>

                        </div>

                        {/* Phone order */}
                        <div className="challenge-message-card d-flex align-items-center">

                            {/* Phone icon */}
                            <div className="challenge-message-icon challenge-message-icon--phone">
                                <FaPhone />
                            </div>

                            {/* Phone order information */}
                            <div className="challenge-message-content flex-grow-1">

                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="challenge-message-title">
                                        Phone call
                                    </h3>

                                    <span className="challenge-message-time">
                                        6:05 PM
                                    </span>
                                </div>

                                <p className="challenge-message-text">
                                    Customer called to change their pickup time and cake message.
                                </p>

                            </div>

                        </div>
                    </div>

                    {/* Right side shows the organized Bakeau solution */}
                    <div className="col-lg-6">

                        {/* Label for the Bakeau solution side */}
                        <p className="challenge-side-label challenge-side-label--with">
                            WITH BAKEAU — EVERYTHING IN ONE PLACE.
                        </p>

                        {/* Organized Bakeau order card */}
                        <div className="bakeau-order-card">

                            {/* Order header */}
                            <div className="d-flex justify-content-between align-items-center bakeau-order-header">

                                <div>
                                    {/* Bakeau order number */}
                                    <p className="bakeau-order-number">
                                        ORDER #SC-1048
                                    </p>

                                    {/* Product ordered by the customer */}
                                    <h3 className="bakeau-order-product-title">
                                        Custom Birthday Cake
                                    </h3>
                                </div>

                                {/* Current order status */}
                                <span className="bakeau-order-status">
                                    Confirmed
                                </span>

                            </div>

                            {/* Customer information */}
                            <div className="bakeau-order-customer-row">

                                {/* Customer name */}
                                <h4 className="bakeau-order-customer-name">
                                    Priya Sharma
                                </h4>

                                {/* Customer contact information */}
                                <p className="bakeau-order-contact">
                                    priya@example.com · (416) 555-0182
                                </p>

                            </div>

                            {/* Pickup information */}
                            <div className="bakeau-order-pickup-row d-flex align-items-center">

                                {/* Calendar icon */}
                                <div className="bakeau-order-pickup-icon">
                                    <MdCalendarMonth />
                                </div>

                                {/* Pickup date and bakery location */}
                                <div>
                                    <p className="bakeau-order-pickup-date">
                                        Pickup: Monday, March 17 at 2:00 PM
                                    </p>

                                    <p className="bakeau-order-pickup-location">
                                        Sweet Crumbs Bakery · Mississauga, ON
                                    </p>
                                </div>

                            </div>

                            {/* Order customization details */}
                            <div className="bakeau-order-customizations">

                                {/* Customizations section heading */}
                                <h4 className="bakeau-order-section-title">
                                    CUSTOMIZATIONS
                                </h4>

                                {/* Bootstrap grid separates the customization details into two columns */}
                                <div className="row g-3">

                                    {/* Left customization column */}
                                    <div className="col-6">

                                        <p className="bakeau-customization-label">
                                            SIZE
                                        </p>
                                        <p className="bakeau-customization-value">
                                            8-inch (serves 16–20)
                                        </p>

                                        <p className="bakeau-customization-label">
                                            FILLING
                                        </p>
                                        <p className="bakeau-customization-value">
                                            Strawberry cream (+$5)
                                        </p>

                                        <p className="bakeau-customization-label">
                                            THEME
                                        </p>
                                        <p className="bakeau-customization-value">
                                            Floral
                                        </p>

                                    </div>

                                    {/* Right customization column */}
                                    <div className="col-6">

                                        <p className="bakeau-customization-label">
                                            FLAVOUR
                                        </p>
                                        <p className="bakeau-customization-value">
                                            Vanilla
                                        </p>

                                        <p className="bakeau-customization-label">
                                            DIETARY
                                        </p>
                                        <p className="bakeau-customization-value">
                                            Eggless (+$8)
                                        </p>

                                        <p className="bakeau-customization-label">
                                            MESSAGE
                                        </p>
                                        <p className="bakeau-customization-value">
                                            "Happy 21st, Maya!"
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* Payment summary for the order */}
                            <div className="bakeau-order-payment">

                                {/* Payment section heading */}
                                <h4 className="bakeau-order-section-title">
                                    PAYMENT
                                </h4>

                                {/* Order subtotal */}
                                <div className="d-flex justify-content-between bakeau-payment-row">
                                    <span>Subtotal</span>
                                    <span>$72.00</span>
                                </div>

                                {/* Additional customization charges */}
                                <div className="d-flex justify-content-between bakeau-payment-row">
                                    <span>Upgrades</span>
                                    <span>$13.00</span>
                                </div>

                                {/* Final order total */}
                                <div className="d-flex justify-content-between bakeau-payment-total">
                                    <strong>Total</strong>
                                    <strong>$85.00</strong>
                                </div>

                                {/* Deposit already paid by the customer */}
                                <div className="d-flex justify-content-between bakeau-payment-paid">
                                    <span>Deposit paid</span>
                                    <span>−$42.50</span>
                                </div>

                                {/* Remaining amount due when the customer picks up the order */}
                                <div className="d-flex justify-content-between bakeau-payment-due">
                                    <strong>Due at pickup</strong>
                                    <strong>$42.50</strong>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </section>
    );
}