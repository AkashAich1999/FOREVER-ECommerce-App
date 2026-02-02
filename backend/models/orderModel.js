import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true 
    },

    items: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "product", 
                required: true 
            },
            size: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ],

    amount: { type: Number, required: true },

    address: { type: Object, required: true },

    status: { type: String, default: "Order Placed" },

    paymentMethod: { type: String, required: true },

    payment: { type: Boolean, default: false },

    date: { type: Date, default: Date.now }
    
}, { timestamps: true });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;



// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//     userId: { type: String, required: true },
//     items: { type: Array, required: true },
//     amount: { type: Number, required: true },
//     address: { type: Object, required: true },
//     status: { type: String, required: true, default: "Order Placed" },
//     paymentMethod: { type: String, required: true },
//     payment: { type: Boolean, required: true, default: false },
//     date: { type: Number, required: true }
// });

// const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

// export default orderModel;