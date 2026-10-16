//Import Resend to send transactional emails from Bakeau
import { Resend } from "resend";


//Create a Resend client using the API key stored in the environment variables
const resend = new Resend(
    process.env.RESEND_API_KEY
);


//Bakeau sender email
const fromEmail =
    "Bakeau <hello@mail.bakeau.com>";


//Sends an email verification link to a newly registered user
const sendVerificationEmail = async (
    email,
    verificationUrl
) => {

    //Send the verification email using Resend
    const { error } =
        await resend.emails.send({

            from:
                fromEmail,

            to:
                email,

            subject:
                "Verify your Bakeau email",

            html: `
                <h1>Welcome to Bakeau</h1>

                <p>
                    Please verify your email address to continue.
                </p>

                <p>
                    <a href="${verificationUrl}">
                        Verify email address
                    </a>
                </p>

                <p>
                    This verification link expires in 24 hours.
                </p>
            `
        });


    //Stop if Resend could not send the email
    if (error) {

        throw new Error(
            error.message
        );
    }
};


//Sends a password reset link to a Bakeau user
const sendPasswordResetEmail = async (
    email,
    resetUrl
) => {

    //Send the password reset email using Resend
    const { error } =
        await resend.emails.send({

            from:
                fromEmail,

            to:
                email,

            subject:
                "Reset your Bakeau password",

            html: `
                <h1>
                    Reset your Bakeau password
                </h1>

                <p>
                    We received a request to reset the password
                    for your Bakeau account.
                </p>

                <p>
                    <a href="${resetUrl}">
                        Reset password
                    </a>
                </p>

                <p>
                    This password reset link expires in 1 hour.
                </p>

                <p>
                    If you did not request a password reset,
                    you can ignore this email.
                </p>
            `
        });


    //Stop if Resend could not send the email
    if (error) {

        throw new Error(
            error.message
        );
    }
};


//Sends a new Order email to the Bakery Owner
const sendNewOrderEmail = async (
    email,
    bakeryName,
    order
) => {

    //Create link to the Order inside the Bakery dashboard
    const orderUrl =
        `${process.env.CLIENT_URL}/bakery/orders/${order._id}`;


    //Send the new Order email using Resend
    const { error } =
        await resend.emails.send({

            from:
                fromEmail,

            to:
                email,

            subject:
                `New order ${order.order_number} - ${bakeryName}`,

            html: `
                <h1>
                    New Order Received
                </h1>

                <p>
                    You received a new order for
                    <strong>${bakeryName}</strong>.
                </p>

                <p>
                    <strong>Order:</strong>
                    ${order.order_number}
                </p>

                <p>
                    <strong>Customer:</strong>
                    ${order.contact_first_name}
                    ${order.contact_last_name}
                </p>

                <p>
                    <strong>Total:</strong>
                    $${Number(
                        order.total_price
                    ).toFixed(2)}
                </p>

                <p>
                    <a href="${orderUrl}">
                        View order in Bakeau
                    </a>
                </p>
            `
        });


    //Stop if Resend could not send the email
    if (error) {

        throw new Error(
            error.message
        );
    }
};


//Sends an Order status update email to the Customer
const sendOrderStatusEmail = async (
    email,
    bakeryName,
    bakerySlug,
    order
) => {

    //Readable status text shown in the email
    const statusNames = {

        confirmed:
            "Confirmed",

        preparing:
            "Being Prepared",

        ready:
            "Ready for Pickup",

        completed:
            "Completed",

        cancelled:
            "Cancelled"
    };


    //Get readable Order status
    const statusText =
        statusNames[
            order.status
        ] ||
        order.status;


    //Create Customer Order tracking link
    const orderUrl =
        `${process.env.CLIENT_URL}/${bakerySlug}/orders/${order._id}`;


    //Send status update email
    const { error } =
        await resend.emails.send({

            from:
                fromEmail,

            to:
                email,

            subject:
                `${order.order_number} is now ${statusText}`,

            html: `
                <h1>
                    Order Update
                </h1>

                <p>
                    Your order from
                    <strong>${bakeryName}</strong>
                    has been updated.
                </p>

                <p>
                    <strong>Order:</strong>
                    ${order.order_number}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${statusText}
                </p>

                <p>
                    <a href="${orderUrl}">
                        View your order
                    </a>
                </p>
            `
        });


    //Stop if Resend could not send the email
    if (error) {

        throw new Error(
            error.message
        );
    }
};


//Sends a new Bakery approval request email to the Platform Admin
const sendBakeryApprovalRequestEmail = async (
    bakery
) => {

    //Create link to review this Bakery
    const bakeryAdminUrl =
        `${process.env.CLIENT_URL}/admin/bakeries/${bakery._id}`;


    //Send approval request email
    const { error } =
        await resend.emails.send({

            from:
                fromEmail,

            to:
                process.env.ADMIN_NOTIFICATION_EMAIL,

            subject:
                `New Bakery approval request - ${bakery.name}`,

            html: `
                <h1>
                    New Bakery Approval Request
                </h1>

                <p>
                    A new Bakery has completed setup
                    and is waiting for approval on Bakeau.
                </p>

                <p>
                    <strong>Bakery:</strong>
                    ${bakery.name}
                </p>

                <p>
                    <strong>Contact email:</strong>
                    ${bakery.contact_email}
                </p>

                <p>
                    <strong>Status:</strong>
                    Pending Approval
                </p>

                <p>
                    <a href="${bakeryAdminUrl}">
                        Review Bakery
                    </a>
                </p>
            `
        });


    //Stop if Resend could not send the email
    if (error) {

        throw new Error(
            error.message
        );
    }
};


//Sends a Bakery account status email to the Bakery Owner
const sendBakeryStatusEmail = async (
    email,
    bakery
) => {

    //Create readable message for each Bakery status
    const statusMessages = {

        Approved: {

            subject:
                `${bakery.name} has been approved on Bakeau`,

            heading:
                "Your Bakery Has Been Approved",

            message:
                "Your Bakery has been approved and your storefront can now be accessed by customers."
        },

        Suspended: {

            subject:
                `${bakery.name} has been suspended on Bakeau`,

            heading:
                "Your Bakery Has Been Suspended",

            message:
                "Your Bakery account has been suspended. Your public storefront will not be available while the account is suspended."
        }
    };


    //Get email content for this status
    const statusContent =
        statusMessages[
            bakery.account_status
        ];


    //Stop if this status does not need an email
    if (!statusContent) {

        return;
    }


    //Create Bakery dashboard link
    const dashboardUrl =
        `${process.env.CLIENT_URL}/bakery/dashboard`;


    //Send Bakery status email
    const { error } =
        await resend.emails.send({

            from:
                fromEmail,

            to:
                email,

            subject:
                statusContent.subject,

            html: `
                <h1>
                    ${statusContent.heading}
                </h1>

                <p>
                    ${statusContent.message}
                </p>

                <p>
                    <strong>Bakery:</strong>
                    ${bakery.name}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${bakery.account_status}
                </p>

                <p>
                    <a href="${dashboardUrl}">
                        Open Bakeau
                    </a>
                </p>
            `
        });


    //Stop if Resend could not send the email
    if (error) {

        throw new Error(
            error.message
        );
    }
};


//Export the email functions so they can be used in other server files
export {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendNewOrderEmail,
    sendOrderStatusEmail,
    sendBakeryApprovalRequestEmail,
    sendBakeryStatusEmail
};