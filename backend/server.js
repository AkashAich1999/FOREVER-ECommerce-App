import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

// App Config
const app = express();
const port = process.env.PORT || 8000;

connectCloudinary();

// Middleware
app.use(express.json());
app.use(cors());

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