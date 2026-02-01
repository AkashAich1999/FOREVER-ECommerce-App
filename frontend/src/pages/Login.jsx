import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const navigate = useNavigate();
  const { token, setToken, backendUrl } = useContext(ShopContext); 

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if User is Already Logged In.
  // useEffect(() => {
  //   const localToken = localStorage.getItem("token");
  //   if (token || localToken) {
  //     setToken(token || localToken);  // Sync context with localStorage.
  //     navigate("/");  // Redirect to home.
  //   }
  // }, [token, setToken, navigate]);

  useEffect(() => {
  if (token) {
    navigate("/"); 
  }
}, [token]); // Runs whenever the token changes or the component loads

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (currentState === "Sign Up") {
        response = await axios.post(
          `${backendUrl}/api/user/register`,
          { name, email, password }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/user/login`,
          { email, password }
        );
      }

      console.log(response);
      console.log(response.data);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);

        toast.success(
          currentState === "Login"
            ? "Login Successful"
            : "Account Created Successfully"
        );

        navigate("/");
      } else {
        toast.error(response.data.message);
      }  

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something Went Wrong"
      );
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 mx-auto mt-14 gap-4 text-gray-800">

      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      { currentState === "Login" ? "" : <input onChange={(e) => setName(e.target.value)} value={name} className="w-full px-3 py-2 border border-gray-800" type="text" placeholder="Name" required />}
      <input onChange={(e) => setEmail(e.target.value)} value={email} className="w-full px-3 py-2 border border-gray-800" type="email" placeholder="Email" required />
      <input onChange={(e) => setPassword(e.target.value)} value={password} className="w-full px-3 py-2 border border-gray-800" type="password" placeholder="Password" required />

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your Password?</p>
        {
          currentState === "Login"
          ? <p onClick={() => setCurrentState("Sign Up")} className="cursor-pointer">Create Account</p>
          : <p onClick={() => setCurrentState("Login")} className="cursor-pointer">Login Here</p>
        }
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">{currentState === "Login" ? "Sign In" : "Sign Up"}</button>  

    </form>
  )
}

export default Login;