import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, getCartAmount, deliveryfee, products } = useContext(ShopContext);

  // No Default Payment Selected.
  const [method, setMethod] = useState("");

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    phone: ''
  });

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      // receipt: order.receipt,
      handler: async (response) => {
        console.log(response)

        try {
          const verifyRes = await axios.post(
            `${backendUrl}/api/order/verifyRazorpay`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (verifyRes.data.success) {
            setCartItems({});
            navigate("/orders");
            toast.success("Payment Successful");
          } else {
            toast.error("Payment Verification Failed");
          }

        } catch (error) {
          toast.error(error.response?.data?.message || "Payment Verification Error");
        }
      }
      ,

      modal: {
        ondismiss: async () => {
          await axios.delete(
            `${backendUrl}/api/order/cancel-razorpay`,
            {
              data: { orderId: order.receipt },
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    // const { name, value } = e.target;

    setFormData(data => ({ ...data, [name]: value }))
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!method) {
      toast.error("Please Select a Payment Method");
      return;
    }

    try {
      let orderItems = [];

      // Logic to transform cartItems (nested object) into an array of items with details
      // Loop 1: Goes through every Product ID in your cart
      for (const productId in cartItems) { 
        
        // Loop 2: Goes through every Size for that specific Product ID
        for (const size in cartItems[productId]) { 
          const quantity = cartItems[productId][size];
          
          // Check if the quantity is more than 0
          if (quantity > 0) {
            
            // Find the full product details (name, price, image) from your main products list
            const product = products.find(p => p._id === productId);

            if (!product) continue;

            orderItems.push({
              productId: product._id,
              size,
              quantity
            });
          }
        }
      }

      // Prepare the order data bundle
      let orderData = {
        address: formData,                    // Contains firstName, street, city, etc.
        items: orderItems,                    // The flat array we just made.
        amount: getCartAmount() + deliveryfee // The total price the user must pay.
      }

      console.log(orderItems);
      console.log(orderData);

      // Switch case for different payment methods
      switch (method) {
        case 'cod': {
          const response = await axios.post(
            `${backendUrl}/api/order/place`, 
            orderData, 
            { 
              headers: {
                Authorization: `Bearer ${token}` 
              }  
            }
          );
          
          console.log(response.data.success);
          
          if (response.data.success) {
            setCartItems({});     // Clear Cart Locally.
            navigate("/orders");  // Redirect to Orders Page.
            toast.success(response.data.message);
          } else {
            toast.error(response.data.message);
          }
          break;
        }
          
        case 'stripe': {
          const responseStripe = await axios.post(
            `${backendUrl}/api/order/stripe`,
            orderData,
            { 
              headers: {
                Authorization: `Bearer ${token}` 
              }  
            }
          )

          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }

          break;
        }

        case 'razorpay': {
          const responseRazorpay = await axios.post(
            `${backendUrl}/api/order/razorpay`,
            orderData,
            { 
              headers: {
                Authorization: `Bearer ${token}` 
              }  
            }
          );

          if (responseRazorpay.data.success) {
            // console.log(responseRazorpay.data.razorpayOrder);
            initPay(responseRazorpay.data.razorpayOrder);
          } else {
            toast.error(responseRazorpay.data.message);
          }

          break;
        }
          
        default:
          break;
       }     
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">

      {/* ---------- Left Side ---------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="text" placeholder="First Name" />
          <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="text" placeholder="Last Name" />
        </div>

        <input required onChange={onChangeHandler} name="email" value={formData.email} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="email" placeholder="Email Address" />
        <input required onChange={onChangeHandler} name="street" value={formData.street} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="text" placeholder="Street" />

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="city" value={formData.city} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="text" placeholder="City" />
          <input required onChange={onChangeHandler} name="state" value={formData.state} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="text" placeholder="State" />
        </div>

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="pincode" value={formData.pincode} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="number" placeholder="PIN Code" />
          <input required onChange={onChangeHandler} name="country" value={formData.country} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="text" placeholder="Country" />
        </div>

        <input required onChange={onChangeHandler} name="phone" value={formData.phone} className="border border-gray-300 rounded px-3.5 py-1.5 w-full" type="number" placeholder="Phone" />

      </div>

      {/* ---------- Right Side ---------- */}
      <div className="mt-8 sm:ml-20">

        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          {/* ---------- Payment Method Selection ---------- */}
          <div className="flex gap-3 flex-col lg:flex-row">

            <div onClick={() => setMethod("stripe")} className="flex items-center gap-3 p-2 px-3 border cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : "" }`}></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="" />
            </div>

            <div onClick={() => setMethod("razorpay")} className="flex items-center gap-3 p-2 px-3 border cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "razorpay" ? "bg-green-400" : "" }`}></p>
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="" />
            </div>

            <div onClick={() => setMethod("cod")} className="flex items-center gap-3 p-2 px-3 border cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : "" }`}></p>
              <p className="mx-4 text-sm font-medium text-gray-500">CASH ON DELIVERY</p>
            </div>

          </div>

          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black text-white px-16 py-3 text-sm">PLACE ORDER</button>
          </div>
        </div>

      </div>

    </form>
  )
}

export default PlaceOrder;

/*
    cartItems object looks like this :

    { 
      "64f1a2c9e8b1a12345678901": { 
        "M": 2, 
        "L": 1 
      } 
    }

    But Orders Database wants a Flat Array of Objects. 
    So, We loop through the nested object to "flatten" it.

    Example : cartItems

    cartItems = {
      "64f1a2c9e8b1a12345678901": {
        "M": 2,
        "L": 1
      },
      "64f1a2c9e8b1a12345678902": {
        "S": 1
      }
    };

  

*/