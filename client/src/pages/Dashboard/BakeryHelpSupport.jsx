//Import Help & Support icons
import {
    CircleHelp,
    CreditCard,
    ExternalLink,
    Mail,
    Package,
    Store,
    UserRound,
    CalendarDays
} from "lucide-react";

//Import Help & Support styles
import "./styles/HelpSupport.css";


//Displays Help & Support for Bakery Owners
export default function BakeryHelpSupport() {

    //Bakeau support email
    const supportEmail =
        "love@lovesandhu.com";


    return (
        <div className="bakery-help-page">

            {/* Help & Support heading */}
            <div className="bakery-help-heading">

                <h1>
                    Help & Support
                </h1>

                <p>
                    Find answers to common questions or
                    contact Bakeau support if you need help.
                </p>

            </div>


            {/* Support contact card */}
            <div className="bakery-help-contact-card">

                <div className="bakery-help-contact-content">

                    <div className="bakery-help-contact-icon">

                        <CircleHelp
                            size={24}
                            strokeWidth={1.8}
                        />

                    </div>


                    <div>

                        <h2>
                            Need help?
                        </h2>

                        <p>
                            If you cannot find the answer below,
                            contact Bakeau support and we will
                            help you with your account or bakery.
                        </p>

                    </div>

                </div>


                {/* Support email */}
                <div className="bakery-help-contact-action">

                    <div>

                        <span>
                            Support email
                        </span>

                        <strong>
                            {supportEmail}
                        </strong>

                    </div>


                    <a
                        href={`mailto:${supportEmail}?subject=Bakeau Support Request`}
                        className="bakery-help-email-button"
                    >

                        <Mail
                            size={16}
                            strokeWidth={1.8}
                        />

                        Email support

                        <ExternalLink
                            size={14}
                            strokeWidth={1.8}
                        />

                    </a>

                </div>

            </div>


            {/* Frequently asked questions */}
            <div className="bakery-help-faq-section">

                <div className="bakery-help-section-heading">

                    <h2>
                        Frequently asked questions
                    </h2>

                    <p>
                        Quick answers to common questions
                        about managing your Bakeau bakery.
                    </p>

                </div>


                {/* Bakery settings FAQ */}
                <details className="bakery-help-faq">

                    <summary>

                        <span className="bakery-help-faq-icon">

                            <Store
                                size={17}
                                strokeWidth={1.8}
                            />

                        </span>

                        <span>
                            How do I update my bakery information?
                        </span>

                    </summary>


                    <div className="bakery-help-faq-answer">

                        Go to <strong>Settings → General</strong> to
                        update your bakery name, description,
                        contact information and address.

                    </div>

                </details>


                {/* Products FAQ */}
                <details className="bakery-help-faq">

                    <summary>

                        <span className="bakery-help-faq-icon">

                            <Package
                                size={17}
                                strokeWidth={1.8}
                            />

                        </span>

                        <span>
                            How do I add or edit products?
                        </span>

                    </summary>


                    <div className="bakery-help-faq-answer">

                        Open <strong>Products</strong> from the
                        dashboard sidebar. You can create new
                        products, edit existing products,
                        control availability and manage
                        customization options.

                    </div>

                </details>


                {/* Pickup FAQ */}
                <details className="bakery-help-faq">

                    <summary>

                        <span className="bakery-help-faq-icon">

                            <CalendarDays
                                size={17}
                                strokeWidth={1.8}
                            />

                        </span>

                        <span>
                            How do I manage pickup availability?
                        </span>

                    </summary>


                    <div className="bakery-help-faq-answer">

                        Go to <strong>Pickup Schedule</strong> to
                        create pickup dates and times,
                        manage recurring pickup windows and
                        control which pickup slots are available.

                    </div>

                </details>


                {/* Payments FAQ */}
                <details className="bakery-help-faq">

                    <summary>

                        <span className="bakery-help-faq-icon">

                            <CreditCard
                                size={17}
                                strokeWidth={1.8}
                            />

                        </span>

                        <span>
                            How do I connect or manage Stripe?
                        </span>

                    </summary>


                    <div className="bakery-help-faq-answer">

                        Go to <strong>Settings → Payments</strong>.
                        You can connect Stripe, continue an
                        incomplete setup or open Stripe using
                        the Manage Stripe button after your
                        account is connected.

                    </div>

                </details>


                {/* Account FAQ */}
                <details className="bakery-help-faq">

                    <summary>

                        <span className="bakery-help-faq-icon">

                            <UserRound
                                size={17}
                                strokeWidth={1.8}
                            />

                        </span>

                        <span>
                            How do I update my account or password?
                        </span>

                    </summary>


                    <div className="bakery-help-faq-answer">

                        Go to <strong>Settings → Account</strong>.
                        You can update your personal account
                        information or change your password
                        from there.

                    </div>

                </details>

            </div>


            {/* Additional support */}
            <div className="bakery-help-bottom-card">

                <Mail
                    size={19}
                    strokeWidth={1.8}
                />


                <div>

                    <strong>
                        Still need help?
                    </strong>

                    <p>
                        Send us an email at{" "}
                        <a href={`mailto:${supportEmail}`}>
                            {supportEmail}
                        </a>
                        {" "}and include a short description
                        of the issue you are experiencing.
                    </p>

                </div>

            </div>

        </div>
    );
}