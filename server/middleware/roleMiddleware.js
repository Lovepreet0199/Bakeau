//Authorize a user based on their role
const authorizeRoles = (...allowedRoles) => {

    return (request, response, next) => {
        //Check if the authenticated user's role is allowed
        if (!allowedRoles.includes(request.user.role)) {
            return response.status(403).json({
                message: "You do not have permission to access this resource"
            });
        }

        //Continue to the next function because the user has permission
        next();
    };
};

//Export the role authorization middleware so it can be used in protected routes
export { authorizeRoles };