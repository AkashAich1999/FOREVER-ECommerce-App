import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";

// App Config
const app = express();
const port = process.env.PORT || 8000;

connectCloudinary();

// Middleware
app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);

// API Endpoints (Routes)
app.get("/", (req, res) => {
    res.status(200).send("API Working !");
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Server Start
connectDB().then(() => (
    app.listen(port, () => {
        console.log("Server Started on PORT:" + port);
    })
));