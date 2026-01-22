import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Function to Generate JWT Token using user ID.
const createToken = (id) => {
    // Create a token with payload { id }
    // Uses Secret Key from Environment Variables.
    // Token Expires in 7 Days.
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Register Controller.
export const registerUser = async (req, res) => {
    try {
        // Step 1: Extract User Data from Request Body.
        const { name, email, password } = req.body;

        // Step 2: Validate Required Fields.
        if (!name || !email || !password) { 
            return res.status(400).json({ success: false, message: "All Fields are Required", }); 
        }

        // Step 3: Normalize Email.
        const normalizedEmail = email.trim().toLowerCase();

        // Step 4: Validate Email Format.
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Please Enter a Valid Email." });
        }

        // Step 5: Validate Password.
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password Too Short" });
        }

        // Step 6: Check If User Already Exists or Not.
        const userExists = await userModel.findOne({ email:normalizedEmail });

        // Step 7: If User Exists, Stop Execution and Return Error.
        if (userExists) {
            return res.status(400).json({ success: false, message: "User Already Exists." });
        }

        // Step 8: Hash the User's Password using bcrypt.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // const hashedPassword = await bcrypt.hash(password, 10); // Shorthand.

        // Step 9: Create a New User Document with Hashed Password.
        const newUser = new userModel({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Step 10: Save User to Database.
        const user = await newUser.save();

        // Step 11: Generate JWT Token using Saved User's ID.
        const token = createToken(user._id);

        // Step 12: Send Success Response with Token.
        res.status(201).json({ 
            success: true, 
            token, 
            message: "User Registered Successfully", 
        });

    } catch (error) {
        console.error(error);   // Handle Unexpected server Errors.
        res.status(500).json({ success: false, message: "Server Error" });  
    }
}

// Login Controller.
export const loginUser = async (req, res) => {
    try {
        // Step 1: Extract Email & Password from Request Body.
        const { email, password } = req.body;

        // Step 2: Validate Required Fields.
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are Required", });
        }

        // Step 3: Normalize Email.
        const normalizedEmail = email.trim().toLowerCase();

        // Step 4: Find User by Email.
        const user = await userModel.findOne({ email: normalizedEmail });

        // Step 5: If User Does Not Exist.
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials", });
        }

        // Step 6: Compare Entered Password with Hashed Password.
        const isMatched = await bcrypt.compare(password, user.password);

        // Step 7: If Password Does Not Match.
        if (!isMatched) {
            return res.status(400).json({ success: false, message: "Invalid Credentials", });
        }

        // Step 8: Generate JWT Token.
        const token = createToken(user._id);

        // Step 9: Send Success Response.
        res.status(200).json({
            success: true,
            token,
            message: "Login Successful",
        });

    } catch (error) {
        console.error(error);   // Handle Unexpected server Errors.
        res.status(500).json({ success: false, message: "Server Error" });  
    }
}

// Admin Login Controller.
export const adminLogin = async (req, res) => {
    
}


/*
    A token is a Digital Proof that the Server Gives to the Client to say:
    “I know who you are, and I trust you.”

    • Without Token :
      
      Every request would need:
      {
        "email": "...",
        "password": "..."
      }

      • VERY unsafe.
      • Password sent repeatedly.
      • Bad design.  

    • With Token :

      1. Login / Register once.
      2. Server gives a token.
      3. Client sends token with Every Request.

      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
      ✔ Password never sent again
      ✔ Secure
      ✔ Efficient
*/

/*
    A JWT (JSON Web Token) looks like a long string with three dot-separated parts.

    Example JWT Token :
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        .eyJpZCI6IjY1YWY5MmMxZDFmOWE4ZTEyM2FiYzQ1NiIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwNjA0ODAwfQ
        .ME7xR2k5sJ9Y7F0P9y8GmA1ZbZJz6XK8N8LzJx5Qq2o

    JWT Structure : 
        A JWT has 3 parts, separated by dots (.):

        HEADER . PAYLOAD . SIGNATURE

        1. Header (Algorithm Info) :
           {
             "alg": "HS256",
             "typ": "JWT"
           }
             
            After Base64 encoding:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
            ✔ Tells how the token was signed.

        2. Payload (User Data) :
           {
              "id": "65af92c1d1f9a8e123abc456",
              "iat": 1710000000,
              "exp": 1710604800
           }

            id	 --->  User’s database ID
            iat	 --->  Issued at time
            exp	 --->  Expiry time (7 days)

            After Base64 encoding: eyJpZCI6IjY1YWY5MmMxZDFmOWE4ZTEyM2FiYzQ1NiIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwNjA0ODAwfQ
            ✔ Contains user identity.
            🚫 Anyone can decode this. (don’t store secrets)   

        3. Signature (Security) :
           HMACSHA256(
              base64Header + "." + base64Payload,
              JWT_SECRET
           )

            Example: ME7xR2k5sJ9Y7F0P9y8GmA1ZbZJz6XK8N8LzJx5Qq2o
            ✔ Prevents tampering.
            ✔ Only server can generate this.       
*/

/*
    Q. Is JWT Encrypted ?
    => 
    ❌ No
    ✔ It is signed, not encrypted

    Anyone can decode header & payload, but cannot modify them. 

    Q. How JWT Is Sent in Requests ?
    => Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6... 

    Important Security Rules :
    1. Never store password in JWT
    2. Never trust JWT without verification
    3. Always use HTTPS
    4. Use strong JWT_SECRET
*/

/*
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6... 

    This is an HTTP request header.

    1. Authorization (Header Name) :
       • Authorization is a standard HTTP header.
       • It tells the server :
            “I am sending my authentication credentials with this request.”

    2. Bearer (Auth Scheme) :
       Bearer means:
            Whoever bears (possesses) this token is allowed access.
       • No username
       • No password
       • Just the token
       
       • If you have the token → you are trusted.
        
       That’s why:
       • Tokens must be stored securely
       • HTTPS is mandatory        
*/