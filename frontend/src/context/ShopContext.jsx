import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '₹';
    const deliveryfee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const addToCart = async (itemId, size) => {
        if(!size) {
            toast.error("Select Product Size");
            return;
        }

        let cartData = structuredClone(cartItems);  // deep copy of cartItems object

        if (cartData[itemId]) { // If Product Already Exists
            if (cartData[itemId][size]) {  // If Size Also Exists → Increase Quantity
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1; // If New Size → Add Size
            }
        } else {   // If Product Does NOT Exist Yet 
            cartData[itemId] = {};
            cartData[itemId][size] = 1; 
        }

        setCartItems(cartData);
    } 

    useEffect(() => {
        console.log(cartItems);
    }, [cartItems]);

    const getCartCount = () => {
        let totalCount = 0;

        for (const productId in cartItems) {
            for (const size in cartItems[productId]) {
                totalCount += cartItems[productId][size];
            }
        }

        return totalCount;
    };

    const value = {
        products, currency, deliveryfee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,
        getCartCount
    }

    return (
        <ShopContext.Provider value={value}>
            { props.children }
        </ShopContext.Provider>
    )
};

export default ShopContextProvider;