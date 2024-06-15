import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Context } from "../MainContext";
import { IoHomeOutline } from "react-icons/io5";
import { RiAdminLine } from "react-icons/ri";
import { IoIosLogOut } from "react-icons/io";
import { GoSignIn } from "react-icons/go";
import {
  MdHome,
  MdAccountCircle,
  MdOutlineDashboard,
  MdDashboard,
  MdOutlinePersonOutline,
  MdPerson,
  MdOutlineCategory,
  MdCategory,
  MdAddCircleOutline,
  MdAddCircle,
  MdOutlinePlayArrow,
  MdPlayArrow,
  MdLogout,
  MdEdit,
} from "react-icons/md";
import { FaXmark } from "react-icons/fa6";

function Header() {
  const navigator = useNavigate();
  const { user, logout, htmlBody, currentUser, currentPage, setCurrentPage } =
    useContext(Context);
  const [showSideBar, setShowSideBar] = useState(false);

  useEffect(() => {
    if (showSideBar) {
      htmlBody.style.overflow = "hidden";
    } else {
      htmlBody.style.overflow = "";
    }
  }, [showSideBar]);

  return (
    <div className="w-full p-5 bg-gray-900 shadow sticky top-0 z-[9999]">
      <ul className="w-full grid grid-cols-2 items-center justify-center gap-5 text-[1.2rem] text-gray-300">
        <li className=" flex">
          <NavLink to="/">
            <MdHome
              className="hover:text-gray-500 duration-200"
              title="Home"
            ></MdHome>
          </NavLink>
        </li>
        {user && (
          <li className="text-gray-600 hover:text-gray-800 duration-200 cursor-pointer justify-self-end">
            <div className="w-[28px] h-[28px] rounded-full bg-gray-400 overflow-hidden shadow-[0_0_5px_rgba(0,0,0,1)] hover:brightness-75 duration-300">
              <img
                src={
                  currentUser?.userImage
                    ? currentUser?.userImage
                    : "https://cdn-icons-png.flaticon.com/128/74/74472.png"
                }
                alt="404"
                onClick={() => setShowSideBar(!showSideBar)}
                title="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <SideBar
              showSideBar={showSideBar}
              setShowSideBar={setShowSideBar}
              logout={logout}
              currentUser={currentUser}
              navigator={navigator}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            ></SideBar>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Header;

function SideBar({
  showSideBar,
  setShowSideBar,
  logout,
  currentUser,
  navigator,
  currentPage,
  setCurrentPage,
}) {
  const linkClkHandler = (cP) => {
    setCurrentPage(cP);
    setShowSideBar(false);
  };

  return (
    <>
      {/* overlay */}
      <div
        className={` ${
          showSideBar ? "visible opacity-1" : "opacity-0 invisible"
        } w-full h-[100vh] bg-black/25 backdrop-blur-sm fixed top-0 left-0 flex items-center duration-200 cursor-default`}
      >
        {/* menu  */}
        <div
          className={`${
            showSideBar ? "translate-x-[0]" : "translate-x-[-100%]"
          } sm:w-[700px] w-full h-full bg-gray-800 sm:rounded-tr-2xl sm:rounded-br-2xl duration-200 origin-top-left`}
        >
          {/* profile div  */}
          <div className="w-full p-5 flex items-center justify-center flex-col border-b border-gray-100/[0.2] relative">
            {/* profile circle */}
            <div
              className="group w-[60px] h-[60px] rounded-full bg-gray-700 overflow-hidden cursor-pointer flex items-center justify-center relative"
              onClick={() => {
                navigator("/profile");
                linkClkHandler("profile");
              }}
            >
              <img
                src={
                  currentUser?.userImage
                    ? currentUser?.userImage
                    : "https://cdn-icons-png.flaticon.com/128/74/74472.png"
                }
                alt="404"
                className="w-full h-full object-cover group-hover:brightness-50 duration-300"
                draggable={false}
              />

              <MdEdit className="absolute text-gray-100 opacity-0 group-hover:opacity-100 duration-300"></MdEdit>
            </div>
            {/* username */}
            <p
              className="text-gray-400 text-[1rem] mt-2 font-medium"
              title={currentUser?.username}
            >
              {currentUser?.username}
            </p>
            {/* close btn  */}
            <button
              className="absolute top-0 right-0 p-4 text-gray-400 hover:text-gray-600 duration-300"
              onClick={() => setShowSideBar(false)}
            >
              <FaXmark></FaXmark>
            </button>
          </div>

          {/* link's div  */}
          <div className="w-full py-5 border-b border-gray-100/[0.2]">
            {/* link's ul  */}
            <ul className="w-full flex items-center justify-center flex-col text-gray-400">
              {/* link's li  */}
              <li
                className={`w-full border-s-2 border-gray-800 hover:bg-gray-900 text-[1rem] ${
                  currentPage == "dashboard" && "active-page"
                } `}
                onClick={() => linkClkHandler("dashboard")}
              >
                {/* Links  */}
                <Link
                  to="/dashboard"
                  className="py-3 px-6 flex items-center gap-8"
                >
                  {" "}
                  {currentPage == "dashboard" ? (
                    <MdDashboard fontSize={"1.8rem"}></MdDashboard>
                  ) : (
                    <MdOutlineDashboard
                      fontSize={"1.8rem"}
                    ></MdOutlineDashboard>
                  )}
                  Dashboard
                </Link>
              </li>

              {/* link's li  */}
              <li
                className={`w-full border-s-2 border-gray-800 hover:bg-gray-900 text-[1rem] ${
                  currentPage == "profile" && "active-page"
                } `}
                onClick={() => linkClkHandler("profile")}
              >
                {/* Links  */}
                <Link
                  to="/profile"
                  className="py-3 px-6 flex items-center gap-8"
                >
                  {currentPage == "profile" ? (
                    <MdPerson fontSize={"1.8rem"}></MdPerson>
                  ) : (
                    <MdOutlinePersonOutline
                      fontSize={"1.8rem"}
                    ></MdOutlinePersonOutline>
                  )}
                  Profile
                </Link>
              </li>

              {/* link's li  */}
              <li
                className={`w-full border-s-2 border-gray-800 hover:bg-gray-900 text-[1rem] ${
                  currentPage == "category" && "active-page"
                } `}
                onClick={() => linkClkHandler("category")}
              >
                {/* Links  */}
                <Link
                  to="/admin/category"
                  className="py-3 px-6 flex items-center gap-8"
                >
                  {currentPage == "category" ? (
                    <MdCategory fontSize={"1.8rem"}></MdCategory>
                  ) : (
                    <MdOutlineCategory fontSize={"1.8rem"}></MdOutlineCategory>
                  )}
                  Create Categories
                </Link>
              </li>

              {/* link's li  */}
              <li
                className={`w-full border-s-2 border-gray-800 hover:bg-gray-900 text-[1rem] ${
                  currentPage == "admin" && "active-page"
                } `}
                onClick={() => linkClkHandler("admin")}
              >
                {/* Links  */}
                <Link to="/admin" className="py-3 px-6 flex items-center gap-8">
                  {currentPage == "admin" ? (
                    <MdAddCircle fontSize={"1.8rem"}></MdAddCircle>
                  ) : (
                    <MdAddCircleOutline
                      fontSize={"1.8rem"}
                    ></MdAddCircleOutline>
                  )}
                  Add Quizes
                </Link>
              </li>

              {/* link's li  */}
              <li
                className={`w-full border-s-2 border-gray-800 hover:bg-gray-900 text-[1rem] ${
                  currentPage == "quizes" && "active-page"
                } `}
                onClick={() => linkClkHandler("quizes")}
              >
                {/* Links  */}
                <Link
                  to="/quizes"
                  className="py-3 px-6 flex items-center gap-8"
                >
                  {currentPage == "quizes" ? (
                    <MdPlayArrow fontSize={"1.8rem"}></MdPlayArrow>
                  ) : (
                    <MdOutlinePlayArrow
                      fontSize={"1.8rem"}
                    ></MdOutlinePlayArrow>
                  )}
                  Play Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Logout Btn  */}
          <div className="w-full py-5 text-center">
            <button
              onClick={() => {
                logout();
                navigator("/auth");
              }}
              className="bg-gray-600 hover:bg-gray-700 p-2 rounded-full text-gray-300 duration-300"
              title="Logout"
            >
              <MdLogout></MdLogout>
            </button>
          </div>

          {/* App Name and Logo  */}
          <div className="w-full py-5">
            <div className=" mx-2 bg-gray-700 p-2 rounded-full text-pink-500 font-bold flex items-center justify-center">
              <img
                src="https://github.com/dev-aditya99/Quizem/blob/main/src/assets/favicons/favicon-32x32.png?raw=true"
                alt="404"
              />
              Quizem
            </div>
          </div>
        </div>
        <div
          className="sm:block hidden w-full h-full bg-transparent text-white"
          onClick={() => setShowSideBar(false)}
        ></div>
      </div>
    </>
  );
}
