//Import the configured Stripe client
import stripe from "../config/stripe.js";

//Import the Bakery model
import Bakery from "../models/Bakery.js";

//Create or continue Stripe onboarding for the authenticated Bakery Owner
const connectStripeAccount = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner has not created a bakery yet
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Create a Stripe connected account if the bakery does not already have one
        if (!bakery.stripe_account_id) {

            const stripeAccount = await stripe.v2.core.accounts.create({

                //Email Stripe can use for the connected bakery account
                contact_email: bakery.contact_email,

                //Name displayed for the connected bakery account
                display_name: bakery.name,

                //Give the Bakery Owner access to the full Stripe Dashboard
                dashboard: "full",

                //Identify the bakery as a Canadian Stripe account
                identity: {
                    country: "ca"
                },

                //Configure the bakery to accept card payments and receive transfers
                configuration: {
                    merchant: {
                        capabilities: {
                            card_payments: {
                                requested: true
                            }
                        }
                    },
                    recipient: {
                        capabilities: {
                            stripe_balance: {
                                stripe_transfers: {
                                    requested: true
                                }
                            }
                        }
                    }
                },

                //Stripe handles processing fees and negative balance responsibility
                defaults: {
                    currency: "cad",
                    responsibilities: {
                        fees_collector: "stripe",
                        losses_collector: "stripe"
                    }
                }
            });

            //Save the Stripe connected account ID to the bakery
            bakery.stripe_account_id = stripeAccount.id;

            await bakery.save();
        }

        //Create a Stripe onboarding link for the Bakery Owner
        const accountLink = await stripe.v2.core.accountLinks.create({
            account: bakery.stripe_account_id,
            use_case: {
                type: "account_onboarding",
                account_onboarding: {
                    refresh_url: `${process.env.CLIENT_URL}/bakery/setup?step=payments`,
                    return_url: `${process.env.CLIENT_URL}/bakery/setup?step=payments`
                }
            }
        });

        //Return the Stripe onboarding URL to the frontend
        return response.status(200).json({
            onboarding_url: accountLink.url
        });

    } catch (error) {

        console.error("Stripe connection error:", error.message);

        return response.status(500).json({
            message: "Unable to connect Stripe account"
        });
    }
};

//Gets the Stripe connection status for the authenticated Bakery Owner
const getStripeStatus = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId = request.user.userId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Stop if the Bakery Owner has not created a bakery yet
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Return not connected when no Stripe account has been created yet
        if (!bakery.stripe_account_id) {
            return response.status(200).json({
                connected: false,
                onboarding_complete: false
            });
        }

        //Get the connected bakery account and include its current Stripe requirements
        const stripeAccount = await stripe.v2.core.accounts.retrieve(
            bakery.stripe_account_id,
            {
                include: [
                    "configuration.merchant",
                    "configuration.recipient",
                    "requirements"
                ]
            }
        );

        //Stripe onboarding is complete when there are no remaining requirements
        const onboardingComplete =
            stripeAccount.requirements?.entries?.length === 0;

        //Return the current Stripe setup state to the frontend
        return response.status(200).json({
            connected: true,
            onboarding_complete: onboardingComplete,
            account_id: stripeAccount.id
        });


    } catch (error) {

        console.error("Stripe status error:", error.message);

        return response.status(500).json({
            message: "Unable to get Stripe status"
        });
    }
};

//Export Stripe controller functions
export {
    connectStripeAccount,
    getStripeStatus
};