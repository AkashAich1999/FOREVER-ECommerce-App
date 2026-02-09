import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "node:crypto";

// Gateway Initialize.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Setup Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Global Variables 
const currency = "inr";
const deliveryCharge = 10;

// Placing Orders using COD Method.
export const placeOrderCOD = async (req, res) => {
    try {

        const userId = req.userId;
        const { items, amount, address } = req.body;

        if (!items || !amount || !address) {
            return res.status(400).json({ success: false, message: "Missing Order Data" });
        }

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // After successful order placement, clear the user's cart in the database.
        // This ensures the cart is empty when the user returns to the shop.
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.status(201).json({
            success: true,
            message: "Order Placed",
            orderId: newOrder._id
        });

    } catch (error) {
        console.log("Error in placeOrderCOD:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Placing Orders using Stripe Method.
// Create Checkout Session API
export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;
        // const { origin } = req.headers;
        const origin = req.headers.origin;

        // console.log(origin);

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        let line_items = [];

        for (const item of items) {
            const product = await productModel.findById(item.productId);

            if (!product) throw new Error("Product Not Found");

            line_items.push({
                price_data: {
                    currency,   // "inr"
                    product_data: {
                        name: product.name
                    },
                    unit_amount: Math.round(Number(product.price) * 100)
                },
                quantity: item.quantity
            });
        }    

        // Delivery Charge
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: Math.round(deliveryCharge * 100) 
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Verify Stripe
export const verifyStripe = async (req, res) => {
    
    const userId = req.userId; 
    const { orderId, success } = req.body;

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.status(200).json({ success: true }); 
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.status(200).json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Placing Orders using Razorpay Method.
export const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    const newOrder = await orderModel.create({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now()
    });

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,      // paise
      currency: "INR",
      receipt: newOrder._id.toString()
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
      orderId: newOrder._id
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay.
export const verifyRazorpay = async (req, res) => {
    try {
        const userId = req.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing Razorpay payment details" });
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        console.log(orderInfo);

        const orderId = orderInfo.receipt; // OUR DB ORDER ID

        // if (orderInfo.status === 'paid') {
        //     await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
        //     await userModel.findByIdAndUpdate(userId, { cartData: {} });
        //     res.json({ success: true, message: "Payment Successful" });
        // } else {
        //     res.json({ success: false, message: "Payment Failed" });
        // }

        // STEP 1: Generate signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        // STEP 2: Compare signatures
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // STEP 3: Mark order as paid
        await orderModel.findByIdAndUpdate(orderId, {
            payment: true,
            razorpayPaymentId: razorpay_payment_id
        });

        // STEP 4: Clear cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Payment Verified Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// All Orders Data for Admin Panel.
export const getAllOrders = async (req, res) => {
    try {
      const orders = await orderModel.find({}).populate("items.productId");
      res.status(200).json({ success: true, orders });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
};

// User Order Data for Frontend.
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 }).populate("items.productId");

        // console.log(orders[0].items[0].productId);

        res.status(200).json({ success: true, orders });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update Order Status. (from Admin Panel)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and Status are Required." });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            { status },
            { new: true } // returns Updated Document
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order Not Found." });
        }

        res.status(200).json({
            success: true,
            message: "Status Updated",
            order: updatedOrder
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const cancelRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.body;

    await orderModel.findOneAndDelete({
      _id: orderId,
      userId,
      payment: false,
      paymentMethod: "Razorpay"
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/*
    In Stripe, line_items is essentially the "Digital Invoice" that you send to Stripe’s servers. It tells Stripe 
    exactly what the customer is paying for, how much each item costs, and what quantity they are buying.

    Without line_items, Stripe would only know the total amount, but couldn't show the user a receipt, 
    handle taxes correctly, or provide a clear breakdown on the checkout page.

    Stripe typically uses a "Redirect" flow (Stripe Checkout), which is the most secure and modern way for MERN applications.

    The Workflow Architecture :
    1. Backend: Create a "Stripe Checkout Session" using our Secret API Key. We send the line items 
       (price, name, quantity) to Stripe. This generates a unique session_url.
    2. Frontend: Receive that session_url from our backend and use window.location.replace(session_url) 
       to redirect the user to Stripe’s secure, hosted payment page.
    3. User: Enters their credit card details on Stripe’s own website (safe and trusted).
    4. Stripe: Redirects the user back to our website (the success_url we provided) after the payment is completed.
    5. Backend (Verification): Use a Webhook or a Verify API to check the session_id and confirm the payment 
       was successful before clearing the cart and shipping the order.
*/

/*
   Integrating Razorpay is slightly different from Stripe. While Stripe often redirects us to a new page, Razorpay typically 
   opens as a Checkout Modal (a popup) directly on our website. This keeps the user on our site the whole time. 

   The Workflow Architecture :
   1. Backend: Create a "Razorpay Order" using our Secret Key. This generates an order_id.
   2. Frontend: Receive that order_id and open the Razorpay Checkout Modal.
   3. User: Enters payment details.
   4. Backend: Verify the payment signature sent by Razorpay to ensure it’s genuine.
*/

/*
    Razorpay officially says:  Payment verification must be done using signature validation, not order status.
*/