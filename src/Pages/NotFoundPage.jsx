import React from "react";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigator = useNavigate();

  return (
    <div className="max-w-[1200px] h-[85vh] mx-auto p-5 py-7 flex items-center justify-center flex-col">
      <div className="w-full h-[200px] mt-6 flex items-center justify-center">
        <img
          src="https://cdn-icons-gif.flaticon.com/12753/12753479.gif"
          alt="404"
          className="h-full object-contain rounded-full"
          draggable={false}
        />
      </div>

      <div className="w-full py-5 text-center">
        <button
          className="py-2 px-7 bg-gray-700 text-[1.1rem] text-gray-400 font-medium hover:bg-gray-600 hover:text-gray-300 rounded-md"
          onClick={() => navigator("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
