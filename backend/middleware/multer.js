import multer from "multer";

const storage = multer.diskStorage({
    // destination: (req, file, cb) => {   // cb means callback
    //     cb(null, "./public")
    // },
    filename: function(req, file, callback) {
        callback(null, file.originalname)
    }
});

const upload = multer({ storage });

export default upload;

/*
    1. import multer from "multer";

       • multer is a middleware for handling multipart/form-data.
       • It is mainly used for file uploads. (images, PDFs, videos, etc.)
       • Express cannot handle file uploads by default, so multer is required.


    2. const storage = multer.diskStorage({ ... })

       multer.diskStorage
       This tells Multer: "I want you to store the uploaded files on my server's 
       hard drive (disk) rather than in memory (RAM)."


    3. The filename Function :

       filename: function(req, file, callback) {
           callback(null, file.originalname)
       }

       • req: The standard Express request object.
       • file: An object containing info about the uploaded file (size, name, type).
       • callback (cb): A function we must call to finish the process.

       • The first argument is for an Error (passed as null here because we assume success).
       • The second argument is the Name the file will have on our computer.

       • file.originalname: This tells Multer to keep the filename exactly as it was on the user's computer (e.g., my-photo.jpg).

    • The upload Instance :
    const upload = multer({ storage }); creates the actual middleware that we will insert into our routes.   
*/