import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const Verify = () => {

    const navigate = useNavigate();
    const { token, backendUrl, setCartItems } = useContext(ShopContext);
    const [searchParams] = useSearchParams();

    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");

    const verifyPayment = async () => {
        try {
            if (!token || !success || !orderId) return;

            const response = await axios.post(
                `${backendUrl}/api/order/verifyStripe`,
                { success, orderId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCartItems({});
                navigate("/orders");
            } else {
                navigate("/cart");
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        verifyPayment();
    }, [token, success, orderId]);

  return (
    <div className="text-center mt-20">
        Verifying Payment...
    </div>
  )
}

export default Verify;