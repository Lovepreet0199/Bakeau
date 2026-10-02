// useState remembers which FAQ question is currently open
import { useState } from "react";

//Import stylesheet for FAQ Component
import "./FAQSection.css";

export default function FAQSection() {

    // Stores the number of the FAQ question that is currently open
    // null means that all questions are closed
    const [openQuestion, setOpenQuestion] = useState(null);

    return (
        // FAQ section answers common questions about Bakeau
        <section className="faq-section">

            {/* Keeps the FAQ content aligned with the rest of the landing page */}
            <div className="container-fluid px-3 px-md-4">

                {/* FAQ section heading */}
                <div className="faq-heading text-center">

                    <p className="faq-label">
                        FAQ
                    </p>

                    <h2 className="faq-title">
                        Common questions
                    </h2>

                </div>

                {/* Container for all FAQ questions */}
                <div className="faq-list mx-auto">

                    {/* First FAQ question */}
                    <div className="faq-item">

                        {/* Clicking the question opens or closes its answer */}
                        <button
                            className="faq-question d-flex justify-content-between align-items-center"
                            onClick={() =>
                                setOpenQuestion(openQuestion === 1 ? null : 1)
                            }
                        >
                            <span>Can I use Bakeau for a home bakery?</span>

                            {/* Change the symbol depending on whether the question is open */}
                            <span className="faq-icon">
                                {openQuestion === 1 ? "−" : "+"}
                            </span>
                        </button>

                        {/* Only display the answer when question 1 is open */}
                        {openQuestion === 1 && (
                            <div className="faq-answer">
                                <p>
                                    Yes. Bakeau is designed for both home bakers and established
                                    bakeries. You can create your storefront, add products, manage
                                    orders, and organize customer pickups from one place.
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Second FAQ question */}
                    <div className="faq-item">
                        <button
                            className="faq-question d-flex justify-content-between align-items-center"
                            onClick={() =>
                                setOpenQuestion(openQuestion === 2 ? null : 2)
                            }
                        >
                            <span>Can customers customize their products?</span>

                            {/* Show minus when open and plus when closed */}
                            <span className="faq-icon">
                                {openQuestion === 2 ? "−" : "+"}
                            </span>
                        </button>

                        {/* Only show this answer when question 2 is open */}
                        {openQuestion === 2 && (
                            <div className="faq-answer">
                                <p>
                                    Yes. You can add customization options such as size, flavour,
                                    filling, dietary requirements, themes, and personalized messages
                                    to your products.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Third FAQ question */}
                    <div className="faq-item">
                        <button
                            className="faq-question d-flex justify-content-between align-items-center"
                            onClick={() =>
                                setOpenQuestion(openQuestion === 3 ? null : 3)
                            }
                        >
                            <span>How do payments work?</span>

                            {/* Show minus when open and plus when closed */}
                            <span className="faq-icon">
                                {openQuestion === 3 ? "−" : "+"}
                            </span>
                        </button>

                        {/* Only show this answer when question 3 is open */}
                        {openQuestion === 3 && (
                            <div className="faq-answer">
                                <p>
                                    Customers can securely pay online through Stripe. Bakeau keeps
                                    the payment information connected to the order so bakery owners
                                    can easily track payment status.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Fourth FAQ question */}
                    <div className="faq-item">
                        <button
                            className="faq-question d-flex justify-content-between align-items-center"
                            onClick={() =>
                                setOpenQuestion(openQuestion === 4 ? null : 4)
                            }
                        >
                            <span>Can I manage pickup times?</span>

                            {/* Show minus when open and plus when closed */}
                            <span className="faq-icon">
                                {openQuestion === 4 ? "−" : "+"}
                            </span>
                        </button>

                        {/* Only show this answer when question 4 is open */}
                        {openQuestion === 4 && (
                            <div className="faq-answer">
                                <p>
                                    Yes. You can create available pickup slots for your bakery, and
                                    customers can choose an available date and time when placing
                                    their order.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Fifth FAQ question */}
                    <div className="faq-item">
                        <button
                            className="faq-question d-flex justify-content-between align-items-center"
                            onClick={() =>
                                setOpenQuestion(openQuestion === 5 ? null : 5)
                            }
                        >
                            <span>Can I change my storefront appearance?</span>

                            {/* Show minus when open and plus when closed */}
                            <span className="faq-icon">
                                {openQuestion === 5 ? "−" : "+"}
                            </span>
                        </button>

                        {/* Only show this answer when question 5 is open */}
                        {openQuestion === 5 && (
                            <div className="faq-answer">
                                <p>
                                    Yes. You can personalize your storefront with your bakery name,
                                    logo, colors, photos, and other bakery information to match
                                    your brand.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Sixth FAQ question */}
                    <div className="faq-item">
                        <button
                            className="faq-question d-flex justify-content-between align-items-center"
                            onClick={() =>
                                setOpenQuestion(openQuestion === 6 ? null : 6)
                            }
                        >
                            <span>Can I cancel my subscription?</span>

                            {/* Show minus when open and plus when closed */}
                            <span className="faq-icon">
                                {openQuestion === 6 ? "−" : "+"}
                            </span>
                        </button>

                        {/* Only show this answer when question 6 is open */}
                        {openQuestion === 6 && (
                            <div className="faq-answer">
                                <p>
                                    Yes. You can cancel your Bakeau subscription when you no longer
                                    want to continue with a paid plan.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </section>
    );
}
