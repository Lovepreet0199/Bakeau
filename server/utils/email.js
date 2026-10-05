//Import Resend to send transactional emails from Bakeau
import { Resend } from "resend";

//Create a Resend client using the API key stored in the environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

//Sends an email verification link to a newly registered user
const sendVerificationEmail = async (email, verificationUrl) => {

    //Send the verification email using Resend
    const { error } = await resend.emails.send({
        from: "Bakeau <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Bakeau email",
        html: `
        <h1>Welcome to Bakeau</h1>
        <p>Please verify your email address to continue setting up your bakery.</p>
        <p>
            <a href="${verificationUrl}">Verify email address</a>
        </p>
        <p>This verification link expires in 24 hours.</p>
    `
    });

    if (error) {
        throw new Error(error.message);
    }
};

//Export the email function so it can be used in other server files
export { sendVerificationEmail };