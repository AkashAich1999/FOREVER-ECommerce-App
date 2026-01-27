import { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
   
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestSeller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
         formData,
         {
            headers: {
              Authorization: `Bearer ${token}`,
            },
         }
      );
      console.log(response);
      console.log(response.data);

      toast.success("Product Added Successfully !");

      
      // Reset Form After Success.
      setName("");
      setDescription("");
      setPrice("");
      setCategory("Men");
      setSubCategory("Topwear");
      setBestseller(false);
      setSizes([]);
      setImage1(null);
      setImage2(null);
      setImage3(null);
      setImage4(null);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Product Add Failed");
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col gap-3 w-full items-start">

      <div>
        <p className="mb-2">Upload Image</p>

        <div className="flex gap-2">

          <label htmlFor="image1">
            <img className="w-20" src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>

          <label htmlFor="image2">
            <img className="w-20" src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>

          <label htmlFor="image3">
            <img className="w-20" src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>

          <label htmlFor="image4">
            <img className="w-20" src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>

        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Type Here ..." required />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Write Content Here ..." required />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 w-full">

        <div>
          <p className="mb-2">Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} value={category} name="" id="" className="w-full px-3 py-2">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} name="" id="" className="w-full px-3 py-2">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className="w-full px-3 py-2 sm:w-[120px]" type="number" placeholder="25" />
        </div>

      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">

          <div onClick={() => 
                setSizes(prev => 
                  prev.includes("S") 
                    ? prev.filter(item => item !== "S") 
                    : [...prev, "S"]
                )
              }
          >
            <p className={`${sizes.includes("S") 
                            ? "bg-pink-100" 
                            : "bg-slate-200"} 
                            px-3 py-1 cursor-pointer`}>S</p>
          </div>

          <div onClick={() => 
                setSizes(prev => 
                  prev.includes("M") 
                    ? prev.filter(item => item !== "M") 
                    : [...prev, "M"]
                )
              }
          >
            <p className={`${sizes.includes("M") 
                            ? "bg-pink-100" 
                            : "bg-slate-200"} 
                            px-3 py-1 cursor-pointer`}>M</p>
          </div>

          <div onClick={() => 
                setSizes(prev => 
                  prev.includes("L") 
                    ? prev.filter(item => item !== "L") 
                    : [...prev, "L"]
                )
              }
          >
            <p className={`${sizes.includes("L") 
                            ? "bg-pink-100" 
                            : "bg-slate-200"} 
                            px-3 py-1 cursor-pointer`}>L</p>
          </div>

          <div onClick={() => 
                setSizes(prev => 
                  prev.includes("XL") 
                    ? prev.filter(item => item !== "XL") 
                    : [...prev, "XL"]
                )
              }
          >
            <p className={`${sizes.includes("XL") 
                            ? "bg-pink-100" 
                            : "bg-slate-200"} 
                            px-3 py-1 cursor-pointer`}>XL</p>
          </div>

          <div onClick={() => 
                setSizes(prev => 
                  prev.includes("XXL") 
                    ? prev.filter(item => item !== "XXL") 
                    : [...prev, "XXL"]
                )
              }
          >
            <p className={`${sizes.includes("XXL") 
                            ? "bg-pink-100" 
                            : "bg-slate-200"} 
                            px-3 py-1 cursor-pointer`}>XXL</p>
          </div>

        </div>

      </div>

      <div className="flex gap-2 mt-2">
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id="bestSeller" />
        <label htmlFor="bestSeller" className="cursor-pointer">Add to bestSeller</label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">ADD</button>

    </form>
  )
}

export default Add;

/*
    URL.createObjectURL(image1) is a Browser API used to Create a Temporary Local URL for a File or 
    Binary Object so it can be Previewed or Used Immediately in the Browser Without Uploading it to a Server.
*/

/*
    <label htmlFor="image1">
      <img src={assets.upload_area} alt="" />
      <input type="file" id="image1" />
    </label>

    Q. What is Happening Overall ?
    => We are :
       Making an image act like a Clickable File-Upload Button.
       Instead of Showing the Ugly Default File input UI.

       1. <input type="file" id="image1" />
          • This is the Actual File Input.
          • It Opens the File Picker. (Gallery / File Explorer)
          • id="image1" Uniquely Identifies this Input.
          Normally, This Input looks like:
            Choose File | No file chosen
          But we DON'T want that UI.

       2. <label htmlFor="image1">
          • htmlFor="image1" links the label to the input.
          • When anything inside the label is clicked, the input with that id is Triggered.
          ⚠️ In React, we use htmlFor instead of for
             (because for is a reserved keyword in JavaScript)   
*/

/*
    URL.createObjectURL(image1) is used to Create a Temporary Local URL for a File (usually an Image) 
    so that it can be Previewed in the Browser Before Uploading.

    Q. Why is this needed ?
    => Browsers CANNOT directly display local files selected by users due to Security Reasons.
       This does NOT work:
          <img src={image1} />
       This works:
          <img src={URL.createObjectURL(image1)} />
*/
/*
    URL.createObjectURL(image1);

    It creates a Temporary blob URL like:
       blob:http://localhost:5173/3f8a2e3a-9c8a-4f1b-bf92...    
    
    This URL: 
      • Points to the File Stored in Browser Memory.
      • Can be used as an <img src="">
      • Works Without Uploading the File.
*/

/*
    <div
      onClick={() =>
        setSizes(prev =>
          prev.includes("S") ? prev.filter(item => item !== "S")
            : [...prev, "S"]
        )
      }
    >

    High-Level Idea :

    This <div> works like a Toggle Button for the size "S".
    • Click Once  → "S" gets Added.
    • Click Again → "S" gets Removed.

*/

/*
    const [sizes, setSizes] = useState([]);

    • sizes → current selected sizes. (array)
    • setSizes → updates the array.

    1. Check if "S" Already Exists :

       prev.includes("S")
       • Returns true if "S" is already selected.
       • Returns false otherwise.
       
    2. If "S" exists → REMOVE it :
    
       prev.filter(item => item !== "S")
       • Example:
         • prev = ["S", "M"]
         • result = ["M"]
       • This unselects "S".

    3. If "S" does NOT exist → ADD it :
       
       [...prev, "S"]
       • Example:
         • prev = ["M"]
         • result = ["M", "S"]
       • This selects "S".  
*/


/*
  Following is the Improved Code :

  import { useState } from "react";
  import { assets } from "../assets/assets";
  import axios from "axios";
  import { backendUrl } from "../App";
  import { toast } from "react-toastify";

  const Add = ({ token }) => {
    
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [image3, setImage3] = useState(null);
    const [image4, setImage4] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Men");
    const [subCategory, setSubCategory] = useState("Topwear");
    const [bestseller, setBestseller] = useState(false);
    const [sizes, setSizes] = useState([]);

    const onSubmitHandler = async (e) => {
      e.preventDefault();

      try {
        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", Number(price));
        formData.append("category", category);
        formData.append("subCategory", subCategory);
        formData.append("bestSeller", bestseller);
        formData.append("sizes", JSON.stringify(sizes));

        image1 && formData.append("image1", image1);
        image2 && formData.append("image2", image2);
        image3 && formData.append("image3", image3);
        image4 && formData.append("image4", image4);

        const response = await axios.post(
          `${backendUrl}/api/product/add`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Product added successfully !");

        setName("");
        setDescription("");
        setPrice("");
        setCategory("Men");
        setSubCategory("Topwear");
        setBestseller(false);
        setSizes([]);
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);

      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Product Add Failed !");
      }
    };

    return (
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-3 w-full items-start">

        <div>
          <p className="mb-2">Upload Image</p>
          <div className="flex gap-2">

            {[image1, image2, image3, image4].map((img, index) => (
              <label key={index} htmlFor={`image${index + 1}`}>
                <img
                  className="w-20"
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt=""
                />
                <input
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (index === 0) setImage1(file);
                    if (index === 1) setImage2(file);
                    if (index === 2) setImage3(file);
                    if (index === 3) setImage4(file);
                  }}
                />
              </label>
            ))}

          </div>
        </div>

        <div className="w-full">
          <p className="mb-2">Product Name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            required
          />
        </div>

        <div className="w-full">
          <p className="mb-2">Product Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full max-w-[500px] px-3 py-2"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 w-full">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2"
          >
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>

          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="px-3 py-2"
          >
            <option>Topwear</option>
            <option>Bottomwear</option>
            <option>Winterwear</option>
          </select>

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="25"
            className="px-3 py-2 sm:w-[120px]"
          />

        </div>

        <div>
          <p className="mb-2">Product Sizes</p>
          <div className="flex gap-3">
            {["S", "M", "L", "XL", "XXL"].map(size => (
              <p
                key={size}
                onClick={() =>
                  setSizes(prev =>
                    prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                  )
                }
                className={`px-3 py-1 cursor-pointer ${
                  sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                }`}
              >
                {size}
              </p>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={() => setBestseller(prev => !prev)}
          />
          <label>Add to bestSeller</label>
        </div>

        <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
          ADD
        </button>

      </form>
    );
  };

  export default Add;

*/