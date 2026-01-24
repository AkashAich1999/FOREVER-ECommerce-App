import { assets } from "../assets/assets";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-[4%] py-2">
        <img className="w-[max(10%,_80px)]" src={assets.logo} alt="logo" />
        <button className="bg-gray-600 text-white px-5 sm:px-7 py-2 sm:py-2 text-xs sm:text-sm rounded-full">Logout</button>
    </div>
  )
}

export default Navbar;

/*
    className="w-[max(10%,_80px)]"

    This is a Tailwind CSS arbitrary value used to set the width of an element.

    It translates directly to CSS:
    width: max(10%, 80px);


    max(10%,_80px)
    • max()  --->  Choose the Larger Value.
    • 10%  --->  10% of the Parent Container Width.
    • 80px  --->  Fixed Minimum Width.
    • _  --->  Space Replacement. (Tailwind Requirement)

    Tailwind does not allow spaces, so _ is used instead of space.
*/