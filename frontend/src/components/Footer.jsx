import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div>
        <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
            
          <div>
            <img src={assets.logo} alt="" className="w-32 mb-5" />
            <p className="w-full md:w-2/3 text-gray-600">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ducimus iure, explicabo optio error temporibus minima fugit voluptatem possimus a, perspiciatis tempore veniam aliquid maiores pariatur enim sunt eius. Illo, quisquam.
            </p>
          </div>

          <div>
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-1 text-gray-600">
              <li>Home</li>
              <li>About Us</li>
              <li>Delivery</li>
              <li>Privacy Policy</li>
            </ul>
          </div> 

          <div>
            <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
            <ul className="flex flex-col gap-1 text-gray-600">
              <li>+1-212-457-7890</li>
              <li>contact@forever.com</li>
            </ul>
          </div>

        </div>

        <div>
            <hr />
            <p className="py-5 text-center text-sm">Copyright 2025@ forever.com - All Rights Reserved.</p>
        </div>
    </div>
  )
}

export default Footer;