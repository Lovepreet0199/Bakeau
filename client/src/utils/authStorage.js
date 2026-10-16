//Returns the saved authentication token from either browser storage
export function getAuthToken() {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
}

//Returns the saved logged-in user
export function getAuthUser() {

    //Get user data from local or session storage
    const savedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");


    //Return null if no user is saved
    if (!savedUser) {

        return null;
    }


    try {

        //Convert saved JSON text back into an object
        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Unable to read saved user:",
            error
        );

        return null;
    }
}

//Removes the saved login information
export function clearAuth() {

    //Remove login information from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    //Remove login information from session storage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
}