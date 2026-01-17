import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = () => {
    const { currency, deliveryfee, getCartAmount } = useContext(ShopContext);
 
  return (
    <div className="w-full px-4 sm:px-0">
        <div className="text-2xl">
            <Title text1={"CART"} text2={"TOTALS"} />
        </div>

        {/* <div className="flex flex-col gap-2 mt-2 text-sm"> */}
        <div className="mt-4 border p-4 sm:p-6 rounded-md flex flex-col gap-3 text-sm">

            <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{currency} {getCartAmount()} </p>
            </div>

            <hr />

            <div className="flex justify-between">
                <p>Shipping Fee</p>
                <p>{currency} {deliveryfee}</p>
            </div>

            <hr />

            <div className="flex justify-between">
                <b>Total</b>
                <b>{currency} { getCartAmount() === 0 ? 0 : getCartAmount()+deliveryfee }</b>
            </div>

        </div>
    </div>
  )
}

export default CartTotal;