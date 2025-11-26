import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const { showSearch, setShowSearch } = useContext(ShopContext);

  return (
    <div className="py-5 font-medium flex justify-between items-center">
        <Link to="/"><img src={assets.logo} alt="" className="w-36" /></Link>
        
        <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
            
            <NavLink to="/" className="flex flex-col items-center gap-1">
                <p>HOME</p>
                <hr className="bg-gray-700 w-2/4 h-[1.5px] border-none hidden" />
            </NavLink>
            <NavLink to="/collection" className="flex flex-col items-center gap-1">
                <p>COLLECTION</p>
                <hr className="bg-gray-700 w-2/4 h-[1.5px] border-none hidden" />
            </NavLink>
            <NavLink to="/about" className="flex flex-col items-center gap-1">
                <p>ABOUT</p>
                <hr className="bg-gray-700 w-2/4 h-[1.5px] border-none hidden" />
            </NavLink>
            <NavLink to="/contact" className="flex flex-col items-center gap-1">
                <p>CONTACT</p>
                <hr className="bg-gray-700 w-2/4 h-[1.5px] border-none hidden" />
            </NavLink>

        </ul>

        <div className="flex gap-5 sm:gap-6 items-center">
            <img onClick={() => setShowSearch(!showSearch)} src={assets.search_icon} alt="" className="w-5 cursor-pointer" />
            
            <div className="group relative">
                <img src={assets.profile_icon} alt="" className="w-5 cursor-pointer" />
                <div className="absolute hidden dropdown-menu right-0 pt-4 group-hover:block">
                    <div className="flex flex-col w-36 py-3 px-5 gap-2 bg-slate-100 text-gray-500 rounded">
                        <p className="cursor-pointer hover:text-black">My Profile</p>
                        <p className="cursor-pointer hover:text-black">Orders</p>
                        <p className="cursor-pointer hover:text-black">Logout</p>
                    </div>
                </div>
            </div>

            <Link to='/cart' className="relative">
                <img src={assets.cart_icon} alt="" className="w-5 min-w-5" />
                <p className="absolute right-[-5px] bottom-[-5px] bg-black text-white leading-4 w-4 text-center aspect-square rounded-full text-[8px]">10</p>
            </Link>
            <img onClick={() => setVisible(true)} src={assets.menu_icon} alt="" className="w-5 cursor-pointer sm:hidden" />
        </div>

        {/* sidebar menu for small screens */}
        <div className={`absolute top-0 right-0 bottom-0 bg-white overflow-hidden transition-all ${ visible ? 'w-full' : 'w-0' }`}>
            <div className="flex flex-col text-gray-600">
                <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer">
                    <img src={assets.dropdown_icon} alt="" className="h-4 rotate-180" />
                    <p>Back</p>
                </div>

                <NavLink className='border py-2 pl-6' to={'/'}>HOME</NavLink>
                <NavLink className='border py-2 pl-6' to={'/collection'}>COLLECTION</NavLink>
                <NavLink className='border py-2 pl-6' to={'/about'}>ABOUT</NavLink>
                <NavLink className='border py-2 pl-6' to={'/contact'}>CONTACT</NavLink>
            </div>
        </div>
    </div>
  )
}

export default Navbar;