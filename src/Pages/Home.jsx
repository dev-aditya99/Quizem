import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { IoMdCreate } from "react-icons/io";
import { RiAdminFill } from "react-icons/ri";
import { Context } from "../MainContext";

function Home() {
  const navigater = useNavigate();
  const { setCurrentPage } = useContext(Context);

  useEffect(() => {
    setCurrentPage("home");
  }, []);

  const linkClkHandler = (cP) => {
    setCurrentPage(cP);
    navigater(`/${cP}`);
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto h-[100vh] flex items-center justify-center gap-4 text-[1.2rem]">
        <button
          className="bg-gray-600 text-gray-200 hover:bg-gray-500 rounded-lg shadow-lg py-3 px-6"
          onClick={() => linkClkHandler("quizes")}
          title="Play Quizes"
        >
          <FaPlay></FaPlay>
        </button>

        <button
          className="bg-gray-600 text-gray-200 hover:bg-gray-500 rounded-lg shadow-lg py-3 px-6"
          onClick={() => linkClkHandler("admin")}
        >
          <IoMdCreate></IoMdCreate>
        </button>

        {/* <button
          className="bg-gray-600 text-gray-200 hover:bg-gray-500 rounded-lg shadow-lg py-3 px-6"
          onClick={() => linkClkHandler("admin")}
        >
          <RiAdminFill></RiAdminFill>
        </button> */}
      </div>
    </>
  );
}

export default Home;
