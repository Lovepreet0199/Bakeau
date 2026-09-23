//Import jsonwebtoken to verify authentication tokens
import jwt from "jsonwebtoken";

//Authenticate a user using their JWT
const authenticateUser = (request, response, next) => {

    //Get the Authorization header from the request
    const authHeader = request.headers.authorization;

    //Check if the Authorization header exists
    if (!authHeader) {
        return response.status(401).json({
            message: "Authentication required"
        });
    }

    //Check if the Authorization header uses the Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
        return response.status(401).json({
            message: "Invalid authentication format"
        });
    }

    //Get the JWT from the Authorization header
    const token = authHeader.split(" ")[1];

    try {
        //Verify the JWT using the server's secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Attach the authenticated user's information to the request
        request.user = decoded;

        //Continue to the next function because authentication was successful
        next();

    } catch (error) {

        //Reject the request if the JWT is invalid or expired
        return response.status(401).json({
            message: "Invalid or expired authentication token"
        });
    }
};

//Export the authentication middleware so it can be used in protected routes
export { authenticateUser };