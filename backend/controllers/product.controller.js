import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";

// Add Product.
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestSeller } = req.body;

        // 1. Required Field Validation.
        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: "Missing Required Fields" });
        }

        // 2. Get Images safely from Multer.
        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        if (images.length === 0) {
            return res.status(400).json({ success: false, message: "At Least One Image is Required." });
        }

        // 3. Upload Images to Cloudinary.
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type:'image' });
                return result.secure_url;
            })
        )

        // if (!image1 || !image2 || !image3 || !image4) {
        //     return res.status(400).json({ success: false, message: "All Images are Required" });
        // }

        // 4. Safely Parse Sizes.
        let parsedSizes = [];
        try {
          parsedSizes = sizes ? JSON.parse(sizes) : [];
        } catch {
          return res.status(400).json({ success: false, message: "Invalid Sizes Format", });
        }

        // 5. Convert bestSeller to boolean
        // const isBestSeller = bestSeller === "true" ? true : false;
        const isBestSeller = bestSeller === "true";

        console.log(name, description, price, category, subCategory, parsedSizes, bestSeller, isBestSeller);
        // console.log(image1, image2, image3, image4);
        // console.log(images);
        console.log(imagesUrl);

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: parsedSizes,
            bestSeller: isBestSeller,
            image: imagesUrl,
        }
      
        console.log(productData);
        
        const product = new productModel(productData);
        await product.save();

        res.status(201).json({ success: true, message: "Product Added Successfully", product, });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// List Product.
export const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Removing Product.
export const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        // 1. Validate ID.
        if (!id) {
            return res.status(400).json({
                success: false, message: "Product ID is Required",
            });
        }

        // 2. Delete Product.
        const product = await productModel.findByIdAndDelete(id);

        // 3. Check Existence.
        if (!product) {
            return res.status(404).json({
                success: false, message: "Product Not Found",
            });
        }

        res.status(200).json({ success: true, message: "Product Removed Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Single Product Info.
export const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        // 1. Validate productId.
        if (!productId) {
            return res.status(400).json({ 
                success: false, message: "Product ID is Required."
            });
        }

        // 2. Validate MongoDB ObjectId Format.
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID", });
        }

        // 3. Fetch product.
        const product = await productModel.findById(productId);

        // 4. Check Existence.
        if (!product) {
            return res.status(404).json({
                success: false, message: "Product Not Found"
            });
        }

        // 5. Success Response.
        res.status(200).json({ success: true, product, });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message, });
    }
}

/*
    Q. Why in the Following, we are Checking for 
       price == null   and not   !price ?
    => We use:      price == null
       Instead of:  !price

       Because  !price  wrongly rejects valid values like 0.
       
       if (!price)
       This checks whether price is falsy.

       Falsy values in JavaScript :
       • false
       • 0
       • ""
       • null
       • undefined
       • NaN

       Problem: 0 is a valid price, but !price treats it as Invalid.
*/

/*
    Actual Structure of req.files :

    req.files = {
      image1: [
        {
          fieldname: "image1",
          originalname: "shirt.png",
          path: "uploads/abc123.png",
          mimetype: "image/png",
          size: 24563
        }
      ],
      image2: [
        {
          fieldname: "image2",
          path: "uploads/def456.png"
        }
      ]
    }
*/

/*
    1. First Version (WITHOUT Optional Chaining) :
       const image1 = req.files.image1[0];
       
    Q. How JavaScript Evaluates this ?
    => Step by Step :
       1. req.files must Exist.
       2. req.files.image1 must Exist.
       3. req.files.image1[0] must Exist.
       If ANY step fails → 💥 SERVER CRASH
       
       When this Crashes :
       Case 1: No Files Uploaded.
               req.files === undefined 

       Case 2: image1 Field Missing.
               req.files = { image2: [...] } 

       Case 3: image1 Exists but Empty Array.
               req.files.image1 = []

    Conclusion (First Version) :
    1. Unsafe.
    2. Assumes Everything Exists.
    3. Bad for production APIs.           
            
    
    2. Second Version (WITH Optional Chaining) :
       const image1 = req.files?.image1?.[0];
       
    Q. How JavaScript Evaluates this ?
    => Step by Step :
       1. If req.files Exists → continue
       2. Else → return undefined
       3. If image1 Exists → continue
       4. Else → return undefined
       5. Access [0] safely
       6. ✔ No crash
*/

/*
    let imagesUrl = await Promise.all(
        images.map(async (item) => {
            let result = await cloudinary.uploader.upload(item.path, { resource_type:'image' });
            return result.secure_url;
        })
    )

    Uploads Multiple Images to Cloudinary CONCURRENTLY and returns Array of Secure URLs!
    
    Line-by-Line Breakdown :

    1. let imagesUrl = await Promise.all(
    • Wait for ALL Uploads to Finish. (Parallel, Not Sequential)

    2.     images.map(async (item) => { 
    • Loop through Images Array. (from req.files ---> Multer)

    3.         let result = await cloudinary.uploader.upload(item.path, { resource_type:'image' });
    • Upload EACH image to Cloudinary → returns upload result.

    4.         return result.secure_url;
    • Return ONLY the secure HTTPS URL. (not full result object)

    5.     })
        )
    • Promise.all resolves → imagesUrl = ["url1", "url2", "url3"]
*/

/*
    JSON.parse() & JSON.stringify()  =  Object ↔ String converters! 🔄
    
    Simple Analogy :    
        JavaScript Object  ↔  JSON String (for APIs/Storage)

    • JSON.stringify()  →  Object TO String.
        const doctor = { name: "Dr. Rao", specialty: "Cardio" };
        const jsonString = JSON.stringify(doctor);
    
        OUTPUT :
        '{"name":"Dr. Rao","specialty":"Cardio"}'  ← TEXT !

        Use when : Sending to API, Saving to localStorage, logging.

    • JSON.parse()  →  String TO Object.
        const jsonString = '{"name":"Dr. Rao","specialty":"Cardio"}';
        const doctor = JSON.parse(jsonString);
        
        OUTPUT :
        { name: "Dr. Rao", specialty: "Cardio" }   ← USABLE OBJECT ! 
         
        Use when : Receiving from API, Reading from localStorage.
*/
/*
    const user = {
      name: "Akash",
      age: 25,
      isAdmin: true
    };

    const jsonString = JSON.stringify(user);
    console.log(jsonString);

    Output :
    {"name":"Akash","age":25,"isAdmin":true}

    ✔ Object → String
*/

/*
    const parsedSizes = sizes ? JSON.parse(sizes) : [];

    Q. Why this line is needed (THE REAL PROBLEM) ?
    => When data is sent as multipart/form-data :
           formData.append("sizes", JSON.stringify(["S", "M", "L"]));
       On the Backend :
           req.body.sizes === '["S","M","L"]'   // STRING ❌
       But, In our database / logic, we want :
           ["S", "M", "L"]   // ARRAY ✅  
       So, we must Convert the String into an Array.
       

    • sizes ? ... : ... (Ternary operator)
    This Checks:  “Does sizes exist and is it truthy?”   

    • JSON.parse('["S","M","L"]') 
    Converts a JSON String into a Real JavaScript Object / Array.
    Result: ["S", "M", "L"]

    • : []
    If sizes is:
        • undefined.
        • null.
        • empty.
    Then:
        parsedSizes = [];
    This Avoids:
        • JSON.parse(undefined)
        • Runtime Crash.      
*/

/*
    Q. Why is catch REQUIRED ?
    => Because JSON.parse() can CRASH our Server.

       • JSON.parse() is Not Safe.
       • If the Input String is Not Valid JSON, it Throws a Runtime Exception.

       • That Exception does NOT return null or undefined.
       • It Terminates Execution Immediately unless handled.
*/

/*
    Correct Validation :

    • If 0 is Not Allowed :
      if (!name || price == null || price <= 0 || !category)

    • If 0 is Allowed :
      if (!name || price == null || !category)
*/

/*
    Q. What is Promise.all() ?
    => Promise.all(iterableOfPromises);

       • It takes an Array (or Iterable) of Promises.
       • Returns One Single Promise. 

    Q. How it Works (Step-By-Step) ?
    => 1. You give it Multiple Promises.
          const p1 = Promise.resolve(10);
          const p2 = Promise.resolve(20);
          const p3 = Promise.resolve(30);

          Promise.all([p1, p2, p3])
    
       2. All Promises start Executing Immediately.
          • Important Rule:
            Promises Execute as soon as they are Created, Not when Awaited.

          • So: images.map(uploadImage)
            Creates All Upload Promises at Once.
       
       3. Promise.all() Waits for ALL to Settle.
          • If All Promises resolve → it resolves.
          • If Any Promise rejects → it rejects immediately.

       4. Resolution Case (success) :
          Promise.all([p1, p2, p3])
                 .then(values => console.log(values)); 

          Output: [10, 20, 30]

          Order is Preserved: Even if p2 finishes first, its result stays in index 1.
       
       5. Rejection Case (failure) :
          const p1 = Promise.resolve(10);
          const p2 = Promise.reject("Error in p2");
          const p3 = Promise.resolve(30);

          Promise.all([p1, p2, p3])

          Result: Rejects immediately with "Error in p2"
          • p3 may still be running in background.
          • But Promise.all() stops waiting.

    VISUAL TIMELINE :
    • Example :
        Promise.all([
          uploadImage1(), // 2 sec
          uploadImage2(), // 1 sec
          uploadImage3()  // 3 sec
        ])

      Total Time = Max Time, Not Sum.
      Therefore, Total Time = 3 (Here)
      This is Why it’s Fast.  

    Q. What Promise.all() RETURNS ?
    => const result = await Promise.all(promises);
    
        result is :
          [
            resolvedValueOfPromise1,
            resolvedValueOfPromise2,
            resolvedValueOfPromise3
          ] 

        In our case:
          [
            "imageUrl1",
            "imageUrl2",
            "imageUrl3"
          ]    
       
    COMMON MISTAKES :
    1. Using forEach :
        await images.forEach(async (img) => {
           await upload(img);
        });  
        
       Why Wrong :
       • forEach does NOT return promises.
       • await does nothing here.
       
    2. Sequential Uploads (Slow) :
        for (const img of images) {
           await upload(img);
        } 
       • Uploads One-by-One → Slow.

    CORRECT PATTERN :
    await Promise.all(images.map(upload));
*/

/*
    1. images array : This is an Array of File Objects from Multer, like :
        [
          { path: "uploads/img1.jpg", ... },
          { path: "uploads/img2.jpg", ... }
        ] 

    2. images.map(async (item) => { ... })
       • map() loops over every image.
       • Because the callback is async, it returns a Promise.
       • Each Promise represents one Cloudinary upload.   
       
       After map():
        [
          Promise, // upload img1
          Promise, // upload img2
        ]

    3. Uploading Each Image :
       await cloudinary.uploader.upload(item.path, { resource_type:'image' });

       • Uploads the image file at item.path .
       • Returns a result object from Cloudinary.

        Example result:
        {
          secure_url: "https://res.cloudinary.com/xyz/image/upload/v123/img1.jpg",
          public_id: "xyz/img1"
        }    

    4. Returning secure_url :
       return result.secure_url;

       Each Promise resolves to :
       "https://res.cloudinary.com/xyz/image/upload/..."    
*/



/*
    Validate MongoDB ObjectId Format :

    If Someone Sends :
        { "productId": "abc123" }
    Mongoose throws a CastError, which goes to catch.

    We can prevent that :
    import mongoose from "mongoose";

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Product ID",
        });
    }

    This makes our API more Robust and Cleaner.
*/

/*
    mongoose.Types = Mongoose's Utility Namespace for MongoDB Native Data Types !
    • mongoose.Types contains MongoDB Data Type Classes that Mongoose provides as Helpers.

    What's Inside :

      mongoose.Types = {
        ObjectId:    [ObjectId class],     // Most used!
        Array:       [Mongoose Array subclass],
        Buffer:      [Buffer subclass],
        Decimal128:  [Decimal128 class],
        Map:         [Map subclass],
        SchemaType:  [Base class for schema types]
      }

    mongoose.Types.ObjectId.isValid("507f1f77bcf86cd79943911")
    
    • ObjectId = MongoDB's 12-Byte Unique ID Type.
    • isValid() = Static Method that Validates ObjectId Strings.
*/