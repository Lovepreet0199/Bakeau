//Import React Context hook
import { useContext } from "react";

//Import the Customer Cart Context
import { CartContext } from "./CartContext";


//Allows components to access the Customer Cart
export function useCart() {

    return useContext(
        CartContext
    );
}