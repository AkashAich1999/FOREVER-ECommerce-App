
const NewsletterBox = () => {
    
  const onSubmitHandler = (event) => {
    event.preventDefault();
  }

  return (
    <div className="text-center">
        <p className="text-2xl font-medium text-gray-800">Subscribe now & get 20% off</p>
        <p className="text-gray-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem itaque excepturi dignissimos.
        </p>
        <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 flex mx-auto items-center gap-3 my-6 border pl-3">
            <input type="email" placeholder="Enter your Email" required className="w-full outline-none sm:flex-1" />
            <button type="submit" className="bg-black text-white text-xs px-10 py-4">SUBSCRIBE</button>
        </form>
    </div>
  )
}

export default NewsletterBox;