import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import { useState } from "react";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto my-8 ml-[max(5vw, 25px)] text-gray-600 text-base">
              <Routes>
                <Route path="/" element={<Navigate to="/add" replace />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

/*
  Without replace (default behavior) :
    <Navigate to="/add" />

  Browser history becomes :
    /  →  /add
    
  If the User Presses Back :
  • Goes Back to /.
  • Immediately Redirected again.
  • Infinite Back Loop.

  • Bad User Experience.  
*/

/*
  With replace : 
    <Navigate to="/add" replace />

  Browser history becomes :
    /add

  • / is Removed.
  • Back Button Works normally.
  • No Redirect Loop.

  • Correct Behavior for Redirects.  
*/