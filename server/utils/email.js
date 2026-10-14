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

//Export the email functions so they can be used in other server files
export {
    sendVerificationEmail,
    sendPasswordResetEmail
};