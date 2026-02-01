import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";

import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '₹';
    const deliveryfee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');

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

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/add`, 
                    { itemId, size },
                    { 
                      headers: {
                        Authorization: `Bearer ${token}` 
                      }  
                    } 
                );

                // Fetch Updated Cart From DB.
                await getUserCart(token);

            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || error.message);
            }
        } else {
            // Guest User Logic.
            setCartItems(cartData);
        }
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

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);  // Creates Deep Copy of Current Cart.
        cartData[itemId][size] = quantity;

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity },
                    { 
                      headers: {
                        Authorization: `Bearer ${token}` 
                      }  
                    } 
                );

                // Sync From DB.
                await getUserCart(token);

            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        } else {
            setCartItems(cartData);
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;

        for (const productId in cartItems) {
            const productInfo = products.find((product) => product._id === productId);

            if (!productInfo) continue; // Prevents Crash if Product Removed from DB.

            for (const size in cartItems[productId]) {
                const quantity = cartItems[productId][size];
                totalAmount += productInfo.price * quantity;
            }
        }

        return totalAmount;
    }

    useEffect(() => {
        console.log("Products loaded:", products);
    }, [products]);

    const getProductsData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${backendUrl}/api/product/list`);

        if (response.data.success) {
            setProducts(response.data.products);
        } else {
            toast.error(response.data.message);
        }

      } catch (error) {
        console.error(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const getUserCart = async ( token ) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/cart/get`, 
                {},
                { 
                  headers: {
                    Authorization: `Bearer ${token}` 
                  }  
                }
            );

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            getUserCart(storedToken);
        }
    }, []);

    const value = {
        products, currency, deliveryfee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        backendUrl,
        loading,
        token, setToken
    }

    return (
        <ShopContext.Provider value={value}>
            { props.children }
        </ShopContext.Provider>
    )
};

export default ShopContextProvider;

/*
    Cart Data Structure :

    cartItems = {
      "productId1": {
        "M": 2,
        "L": 1
      },
      "productId2": {
        "S": 1
      }
    }


    - Same product
    - Multiple sizes
    - Quantity per size
*/

/*
    addToCart Function :

    const addToCart = async (itemId, size) => {

    1. Size Validation :

        if(!size) {
            toast.error("Select Product Size");
            return;
        }

        - Prevents Adding Product without Selecting Size.
    
    2. Deep Copy State :

        let cartData = structuredClone(cartItems);

        Q. Why ?
        - React state must NOT be mutated directly.
        - structuredClone safely copies nested objects.    
*/

/*
    - Product exists ?
    if (cartData[itemId]) {

        - Size exists ?
        if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
        }

        ✔ Increase quantity


        - New size :
        cartData[itemId][size] = 1;


    - New product :
    cartData[itemId] = {};
    cartData[itemId][size] = 1;


    - Update state :
    setCartItems(cartData);
    Triggers UI Re-Render Everywhere.
*/


/*
    
    if (token) {
        try {
            await axios.post(
            `${backendUrl}/api/cart/add`, 
            { itemId, size },
            { 
                headers: {
                Authorization: `Bearer ${token}` 
                }  
            } 
            );
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    }

    Main Purpose :

    This block is used to :
      Sync the Cart with the Backend Database ONLY if the User is Logged In.

    Q. Why if (token) Check ?
    => Supports two cart modes :

       Mode 1 — Guest User. (Not Logged In)
       No token exists.  ( token = "" )

       So:  if (token) → false

       Result:
       Cart only updates in frontend state
       setCartItems(cartData)

       ✔ Works locally
       ❌ Not saved in database

       Mode 2 — Logged In User.

       Token Exists :  ( token = "eyJhbGciOiJIUzI1NiIsInR5..." )

       So:  if (token) → true

       Result:

       Send request to backend API
       Save cart in DB


       ✔ Persistent cart
       ✔ User can login later and still see cart
*/