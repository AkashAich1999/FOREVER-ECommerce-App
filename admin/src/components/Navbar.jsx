import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  const handleLogout = () => {
    // 1. Remove token from localStorage
    localStorage.removeItem("adminToken");

    // 2. Clear React state
    setToken("");
  }

  return (
    <div className="flex items-center justify-between px-[4%] py-2">
        <img className="w-[max(10%,_80px)]" src={assets.logo} alt="logo" />
        <button onClick={handleLogout} className="bg-gray-600 text-white px-5 sm:px-7 py-2 sm:py-2 text-xs sm:text-sm rounded-full">Logout</button>
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
/*
    What max(10%, 80px) Does:
    Sets width to the LARGER value between:
    • 10% of parent container.
    • 80px fixed size.

    Visual Behavior :

    Parent 800px wide:
    10% = 80px  → max(80px, 80px) = 80px

    Parent 1000px wide: 
    10% = 100px → max(100px, 80px) = 100px

    Parent 500px wide:
    10% = 50px  → max(50px, 80px) = 80px  (Never smaller than 80px!)
*/