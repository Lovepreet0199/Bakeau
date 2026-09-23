//Import the User model to work with user accounts in the database.
import User from "../models/User.js";

//Import bcrypt to securely hash user passwords
import bcrypt from "bcryptjs";

//Register a new Customer or Bakery Owner
const registerUser = async (request, response) => {
    try {
        //Get the registration information sent in the request
        //This is object destructuring.
        const { first_name, last_name, email, password, role } = request.body;

        //Only Customer & Bakery accounts can register publicly.
        if (role !== "customer" && role !== "bakeryOwner") {
            return response.status(400).json({
                message: "Invalid account type"
            });
        }

        //Check if an account with this email already exists.
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return response.status(400).json({
                message: "An account with this email already exists."
            });
        }

        //Hash the password before storing in the database
        const password_hash = await bcrypt.hash(password, 10);

        //Create the new user account in the database.
        const newUser = await User.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password_hash: password_hash,
            role: role
        });

        //Send the newly created user's safe account information to the client.
        response.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        //Log error in the server terminal for debugging.
        console.error("Registration error: ", error.message);

        //Send a server error response to the client.
        return response.status(500).json({
            message: "Unable to register user"
        });
    }
};

//Export the registerUser function so it can be used in the authentication routes
export { registerUser };