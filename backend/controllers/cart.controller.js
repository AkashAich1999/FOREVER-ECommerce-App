import userModel from "../models/userModel.js"

// Add Products to User Cart.
export const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId, size } = req.body;

        if (!itemId || !size) {
            return res.json({ success: false, message: "ItemId or Size Missing" });
        }

        const user = await userModel.findById(userId);
        let cartData = await user.cartData;

        if (cartData[itemId]) {
            cartData[itemId][size]
              ? (cartData[itemId][size] += 1)
              : (cartData[itemId][size] = 1);
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Product Added to Cart" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// Update User Cart.
export const updateCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId, size, quantity } = req.body;

        if (!itemId || !size || quantity === undefined) {
            return res.json({ success: false, message: "Invalid Data" });
        }

        const user = await userModel.findById(userId);
        let cartData = await user.cartData;

        if (cartData[itemId] && cartData[itemId][size]) {
            cartData[itemId][size] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Cart updated" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// Get User Cart Data.
export const getUserCart = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);
        let cartData = await user.cartData;

        res.json({
            success: true,
            cartData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

/*
    Typically something like :
      if (quantity === undefined) {
   
      }


    Instead of :
      if (!quantity) {
    
      }

    Key Difference : !quantity checks for falsy values
    This condition becomes true when quantity is :
      undefined
      null
      0
      false
      ""
      NaN

    Why This Matters in Cart Logic :
    In our Cart System :
      quantity can legitimately be 0.
      
    Example :
      User reduces quantity to 0 → remove item from cart.  
*/