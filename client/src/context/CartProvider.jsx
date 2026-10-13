//Import React tools used to manage the Cart
import {
    useEffect,
    useState
} from "react";

//Import the Customer Cart Context
import { CartContext } from "./CartContext";


//Name used to save the Cart inside Local Storage
const CART_STORAGE_KEY = "bakeau_cart";


//Provides Cart information and functions to the application
export default function CartProvider({ children }) {

    //Stores all Products currently inside the Cart
    const [cartItems, setCartItems] = useState(() => {

        try {

            //Get the saved Cart from the browser
            const savedCart =
                localStorage.getItem(
                    CART_STORAGE_KEY
                );

            //Convert the saved Cart back into JavaScript
            return savedCart
                ? JSON.parse(savedCart)
                : [];

        } catch (error) {

            console.error(
                "Unable to load Cart:",
                error
            );

            return [];
        }
    });

    //Stores the optional note for the Bakery
    const [cartNote, setCartNote] = useState(() => {

        //Get the saved Bakery note
        return localStorage.getItem(
            "bakeau_cart_note"
        ) || "";
    });


    //Save the Cart whenever Cart items change
    useEffect(() => {

        try {

            localStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify(cartItems)
            );

        } catch (error) {

            console.error(
                "Unable to save Cart:",
                error
            );
        }

    }, [cartItems]);

    //Save the Bakery note whenever it changes
    useEffect(() => {

        localStorage.setItem(
            "bakeau_cart_note",
            cartNote
        );

    }, [cartNote]);

    //Add a configured Product to the Cart
    function addToCart(cartItem) {

        //Create a unique ID for this Cart item
        const newCartItem = {
            ...cartItem,

            cart_item_id:
                crypto.randomUUID()
        };


        //Add the Product to the existing Cart
        setCartItems(
            (currentItems) => [
                ...currentItems,
                newCartItem
            ]
        );
    }


    //Remove one Product from the Cart
    function removeFromCart(cartItemId) {

        setCartItems(
            (currentItems) =>
                currentItems.filter(
                    (item) =>
                        item.cart_item_id !==
                        cartItemId
                )
        );
    }


    //Change the quantity of one Cart item
    function updateCartQuantity(
        cartItemId,
        quantity
    ) {

        //Do not allow quantities below one
        if (quantity < 1) {
            return;
        }


        setCartItems(
            (currentItems) =>
                currentItems.map(
                    (item) => {

                        //Update the matching Cart item
                        if (
                            item.cart_item_id ===
                            cartItemId
                        ) {

                            return {
                                ...item,
                                quantity: quantity
                            };
                        }


                        //Leave all other Cart items unchanged
                        return item;
                    }
                )
        );
    }


    ///Updates information for one Cart item
    function updateCartItem(
        cartItemId,
        updates
    ) {

        setCartItems(
            (currentItems) =>
                currentItems.map(
                    (item) => {

                        //Update the matching Cart item
                        if (
                            item.cart_item_id ===
                            cartItemId
                        ) {

                            return {
                                ...item,
                                ...updates
                            };
                        }

                        //Leave other Cart items unchanged
                        return item;
                    }
                )
        );
    }

    //Clears the Customer Cart
    function clearCart() {

        //Remove all Cart Products
        setCartItems([]);

        //Remove the Bakery note
        setCartNote("");

        //Remove saved Bakery note
        localStorage.removeItem(
            "bakeau_cart_note"
        );
    }


    //Count the total quantity of Products in the Cart
    const cartCount =
        cartItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    return (

        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartNote,
                setCartNote,
                addToCart,
                removeFromCart,
                updateCartQuantity,
                updateCartItem,
                clearCart
            }}
        >

            {children}

        </CartContext.Provider>
    );
}