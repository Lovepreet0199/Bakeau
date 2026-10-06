//Import Stripe to connect Bakeau to the Stripe API
import Stripe from "stripe";

//Create the Stripe client using the secret key from the environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Export the Stripe client so it can be used in payment Controllers
export default stripe;