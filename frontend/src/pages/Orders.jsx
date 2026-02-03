import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

function Orders() {
  const { currency, token, backendUrl } = useContext(ShopContext);

  const [orderData, setorderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.get(
        `${backendUrl}/api/order/userorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("loadOrderData :", response.data);

      if (response.data.success) {
        let allOrdersItem = [];

        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,    // productId, size, quantity
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.createdAt
            })
          })
        });

        console.log("allOrdersItem :", allOrdersItem);
        setorderData(allOrdersItem);
      }

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">

      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {
          orderData.map((item, index) => (
            <div key={index} className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              <div className="flex items-start gap-6 text-sm">

                <img className="w-16 sm:w-20" src={item.productId?.image?.[0]} alt="" />

                <div>
                  <p className="sm:text-base font-medium">{item.productId?.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>{currency}{item.productId?.price}</p>
                    <p>Quantity: {item?.quantity}</p>
                    <p>Size: {item?.size}</p>
                  </div>
                  <p className="mt-1">Date: <span className="text-gray-400">
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </span></p>
                  <p className="mt-1">Payment: <span className="text-gray-400">{item.paymentMethod}</span></p>
                </div>

              </div>

              <div className="md:w-1/2 flex justify-between">

                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500 "></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>

                <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium rounded-sm">Track Order</button>

              </div>

            </div>  
          ))
        }
      </div>

    </div>
  )
}

export default Orders;