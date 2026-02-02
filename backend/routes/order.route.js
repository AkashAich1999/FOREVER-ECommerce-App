import express from "express";
import { placeOrderCOD, placeOrderStripe, placeOrderRazorpay, getAllOrders, getUserOrders, updateOrderStatus } from "../controllers/order.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const orderRouter = express.Router();

// Admin Features.
orderRouter.get("/list", adminAuth, getAllOrders);
orderRouter.post("/status", adminAuth, updateOrderStatus);

// Payment Features.
orderRouter.post("/place", userAuth, placeOrderCOD);
orderRouter.post("/stripe", userAuth, placeOrderStripe);
orderRouter.post("/razorpay", userAuth, placeOrderRazorpay);

// User Feature.
orderRouter.get("/userorders", userAuth, getUserOrders);

export default orderRouter;