//Import React Router tools
import {
    Navigate,
    Outlet
} from "react-router-dom";

//Import authentication helpers
import {
    getAuthToken,
    getAuthUser
} from "../../utils/authStorage";


//Protects Bakery Owner pages
export default function ProtectedBakeryRoute() {

    //Get saved login information
    const token = getAuthToken();
    const user = getAuthUser();


    //Send logged-out users to login
    if (!token || !user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    //Only Bakery Owners can access these pages
    if (user.role !== "bakeryOwner") {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    //Show protected Bakery Owner pages
    return <Outlet />;
}