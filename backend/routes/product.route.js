import express from "express";
import { addProduct, listProducts, removeProduct, singleProduct } from "../controllers/product.controller.js";
import upload from "../middleware/multer.js";

const productRouter = express.Router();

productRouter.post("/add", upload.fields([
    { name:'image1', maxCount:1 },
    { name:'image2', maxCount:1 }, 
    { name:'image3', maxCount:1 }, 
    { name:'image4', maxCount:1 }
    ]), addProduct);
productRouter.get("/list", listProducts);
productRouter.post("/remove", removeProduct);
productRouter.post("/single", singleProduct);

export default productRouter;

/*
    upload.fields([...]) — Multer Middleware.

    Q. What upload.fields() does ?
    => Tells multer to accept multiple file fields.
       Each field has :
         • a Specific Name.
         • a Maximum File Count.
*/

/*
    Field Configuration Explained :
    { name: "image1", maxCount: 1 }

    Means:
    • Field name in frontend form must be exactly "image1".
    • Only 1 file allowed for this field.
*/

/*
    So Our Frontend must Send :

      <input type="file" name="image1" />
      <input type="file" name="image2" />
      <input type="file" name="image3" />
      <input type="file" name="image4" />
*/

//  Result inside the backend (req.files) :
//  After multer runs, our controller receives :

//    req.files = {
//        image1: [ { /* file object */ } ],
//        image2: [ { /* file object */ } ],
//        image3: [ { /* file object */ } ],
//        image4: [ { /* file object */ } ]
//    };

//  That’s why in our controller we do :  req.files.image1[0]