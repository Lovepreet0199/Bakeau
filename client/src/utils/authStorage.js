//Returns the saved authentication token from either browser storage
export function getAuthToken() {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
}