import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    image: { type: [String], required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },

    sizes: { type: [String], required: true },
    bestSeller: { type: Boolean, default: false },
    // date: { type: Number, required: true }
}, { timestamps: true });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;

/*
    const productModel = mongoose.models.product || mongoose.model("product", productSchema);

    Q. What Problem does this Solve ?
    => Mongoose does NOT allow redefining a model with the same name.

       If we run this twice :
       mongoose.model("product", productSchema);
       mongoose.model("product", productSchema);
       
       We'll get this Error :
       OverwriteModelError: Cannot overwrite `product` model once compiled.

       This happens a lot in :
       • Next.js
       • Vite
       • Nodemon
       • Hot reload / Fast refresh
        because files are re-executed multiple times.
        
    Q. mongoose.models — What is it ?
    => mongoose.models is an object cache of all already-created models.

       Example:
       mongoose.models = {
         product: Model,
         user: Model,
       }
       
       So:
       mongoose.models.product

       means:
       “Give me the existing product model if it already exists.”
*/

/*
    mongoose.models.product || mongoose.model("product", productSchema);

    Case 1: Model Already Exists.
        mongoose.models.product === Model

        Returned Value: 
            mongoose.models.product
        No Error, Model Reused.

    Case 2: Model does NOT Exist.
        mongoose.models.product === undefined

        Executes: 
            mongoose.model("product", productSchema)
        Model is created Once.
*/