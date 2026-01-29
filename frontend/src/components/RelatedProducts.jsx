import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subCategory }) => {
  const { products, loading } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!loading && products.length > 0) {
        let productsCopy = products.slice();

        productsCopy = productsCopy.filter((item) => category === item.category);
        productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);

        // console.log(productsCopy.slice(0, 5));
        setRelated(productsCopy.slice(0, 5));
    }
  }, [products, category, subCategory, loading]);

  if (loading) return null; // or loader

  return (
    <div className="mt-24">
        <div className="text-3xl text-center py-2">
            <Title text1={'RELATED'} text2={'PRODUCTS'} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
            {related.map((item, index) => (
                <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
            ))}
        </div>    
    </div>
  )
}

export default RelatedProducts;