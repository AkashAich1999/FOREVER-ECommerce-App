import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Gateway Initialize.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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