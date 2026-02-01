import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not Authorized - Login Again" });
    }

    // 2. Extract token.
    const token = authHeader.split(" ")[1];
    
    if (process.env.NODE_ENV === "development") {
        console.log("Auth Header:", req.headers.authorization);
    }

    // 3. Verify token    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Invalid or Expired Token", }); 
  }
};

export default userAuth;