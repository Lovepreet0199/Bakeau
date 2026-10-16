//Import Resend to send transactional emails from Bakeau
import { Resend } from "resend";

//Create a Resend client using the API key stored in the environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

//Bakeau sender email
const fromEmail = "Bakeau <hello@mail.bakeau.com>";

//Sends an email verification link to a newly registered user
const sendVerificationEmail = async (email, verificationUrl) => {

    //Send the verification email using Resend
    const { error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Verify your Bakeau email",
        html: `
            <h1>Welcome to Bakeau</h1>

            <p>Please verify your email address to continue.</p>

            <p>
                <a href="${verificationUrl}">
                    Verify email address
                </a>
            </p>

            <p>This verification link expires in 24 hours.</p>
        `
    });

    //Stop if Resend could not send the email
    if (error) {
        throw new Error(error.message);
    }
};

//Sends a password reset link to a Bakeau user
const sendPasswordResetEmail = async (
    email,
    resetUrl
) => {

    //Send the password reset email using Resend
    const { error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Reset your Bakeau password",
        html: `
            <h1>Reset your Bakeau password</h1>

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
        throw new Error(error.message);
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
                <h1>New Order Received</h1>

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
                    $${Number(order.total_price).toFixed(2)}
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

//Export the email functions so they can be used in other server files
export {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendNewOrderEmail
};