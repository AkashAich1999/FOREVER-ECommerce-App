import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

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
export const placeOrderStripe = async (req, res) => {

}

// Placing Orders using Razorpay Method.
export const placeOrderRazorpay = async (req, res) => {

}

// All Orders Data for Admin Panel.
export const getAllOrders = async (req, res) => {

}

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

}