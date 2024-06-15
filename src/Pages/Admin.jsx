import React, { useContext, useEffect, useState } from "react";
import { Link, json, useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import { Context } from "../MainContext";
import {
  MdAddCircle,
  MdDelete,
  MdEdit,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdMoreVert,
  MdPublic,
  MdPublicOff,
  MdVisibility,
} from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
  update,
} from "firebase/database";
import { v4 as uuidv4 } from "uuid";

function Admin() {
  // context
  const {
    allUsers,
    htmlBody,
    user,
    categoryClickDetailsHandler,
    admin,
    adminCategory,
    isLoader,
    setIsLoader,
    currentUser,
    openToast,
    category,
    setCurrentPage,
  } = useContext(Context);

  // navigator
  const navigator = useNavigate();

  // states
  const [adminHandleAlert, setAdminHandleAlert] = useState(null);
  const [adminHandleAlertState, setAdminHandleAlertState] = useState(1);
  const [adminHandleChecker, setAdminHandleChecker] = useState(null);
  const [showMoreState, setShowMoreState] = useState(false);
  const [showViewStatus, setShowViewStatus] = useState(false);
  const [deleteAlertState, setDeleteAlertState] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoader(false);
    let lsUser = localStorage.getItem("user");

    if (!lsUser) {
      navigator("/auth");
    }
  }, [user]);

  // set current page
  useEffect(() => {
    setCurrentPage("admin");
  }, []);

  // btn click handler
  const btnClickHandler = (cateKey, cateTitle, cateCategory) => {
    categoryClickDetailsHandler({
      cateId: cateKey,
      cateTitle: cateTitle,
      cateCategory: cateCategory,
    });

    localStorage.setItem(
      "cateItems",
      JSON.stringify({
        cateId: cateKey,
        cateTitle: cateTitle,
        cateCategory: cateCategory,
      })
    );
    navigator("/admin/category/create-quizes");
  };

  // get admin data from firebase database and set to local storage
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "admins/");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      if (data != null) {
        setAdminHandleChecker(data);
        let allAdminDetails = [];
        let adminDetails = "";
        for (let key in data) {
          allAdminDetails.push(data[key]);
          if (data[key]?.userName == currentUser?.username) {
            adminDetails = data[key];
          }
        }
        setAdminHandleChecker(allAdminDetails);
        if (adminDetails) {
          localStorage.setItem("admin", JSON.stringify(adminDetails));
        }
      }
    });
  }, [admin]);

  // special chars array
  const specialCharsArr = [
    "`",
    "~",
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "=",
    "[",
    "]",
    "{",
    "}",
    ":",
    ";",
    "'",
    ",",
    ".",
    "/",
    "|",
    "<",
    ">",
    "?",
    "+",
    " ",
  ];

  // admin handle onchange
  let adminHandleState = 0;
  const adminHandleOnchange = (e) => {
    // map
    adminHandleChecker?.map((m) => {
      if (m.adminHandle == e.target.value) {
        adminHandleState = 2;
      }
    });
    // map
    specialCharsArr.map((m) => {
      for (let i = 0; i < e.target.value.length; i++) {
        if (m == e.target.value[i]) {
          adminHandleState = 1;
          break;
        }
      }
    });

    // conditons
    if (e.target.value != "" && e.target.value.length <= 30) {
      if (
        e.target.value !== "adminHandle" &&
        e.target.value !== "admin-handle" &&
        e.target.value !== "user-name" &&
        e.target.value !== "userName" &&
        e.target.value !== "username"
      ) {
        if (adminHandleState == 0) {
          setAdminHandleAlert(`${e.target.value} is available!`);
          setAdminHandleAlertState(1);
        } else {
          if (adminHandleState == 2) {
            setAdminHandleAlert(`${e.target.value} is not available!`);
            setAdminHandleAlertState(0);
          } else {
            setAdminHandleAlert(
              `Space and special characters(excluding - and _ ) are not allowed!`
            );
            setAdminHandleAlertState(0);
          }
        }
      } else {
        setAdminHandleAlert(`${e.target.value} is not available!`);
        setAdminHandleAlertState(0);
      }
    } else {
      setAdminHandleAlert(null);
    }
  };

  // submit handler
  const submitHandler = (e) => {
    e.preventDefault();
    const adminID = uuidv4();

    // admin handle checker
    adminHandleChecker?.map((m) => {
      if (m.adminHandle == e.target.adminHandle.value) {
        setAdminHandleAlertState(0);
        adminHandleState = 2;
        openToast("This user name is not available!", 0);
      }
    });

    // admin data obj
    const adminData = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      adminHandle: e.target.adminHandle.value,
      adminID: adminID,
      userName: currentUser?.username,
    };

    // no empty field condition
    if (
      adminData.firstName != "" &&
      adminData.lastName != "" &&
      adminData.adminHandle != "" &&
      adminData.adminID != ""
    ) {
      if (adminHandleAlertState == 1) {
        setIsLoader(true);
        const db = getDatabase();
        set(ref(db, "admins/" + adminID), adminData)
          .then(() => {
            // location.reload();
          })
          .finally(() => {
            setIsLoader(false);
          });
      } else {
        openToast("Something wrong!", 0);
      }
    } else {
      openToast("Fill all the data!", 0);
    }
  };

  // show More Items Handler
  const showMoreItemsHandler = (categoryKey, toggle) => {
    if (toggle) {
      setShowMoreState(categoryKey);
    } else {
      setShowMoreState(toggle);
    }
  };

  // delete category handler
  const deleteCategoryHandler = (categoryKey) => {
    const db = getDatabase(); // Get a reference to the database
    // do, if index is not empty
    if (categoryKey != "") {
      setIsDeleting(true);
      const path = "categories/" + categoryKey;
      remove(ref(db, path))
        .then((success) => {
          openToast(`${categoryKey} is deleted`, 1);
        })
        .catch((error) => {
          openToast(`Can't delete ${categoryKey}`, 0);
        })
        .finally(() => {
          htmlBody.style.overflow = "";
          setIsDeleting(false);
          setDeleteAlertState(false);
        });
    }
  };

  // delete alert handler
  const deleteAlertHandler = (categoryKey, toggle) => {
    setDeleteAlertState(categoryKey);
    htmlBody.style.overflow = "hidden";
  };

  // cancel delete
  const cancelDeleteHandler = () => {
    setIsDeleting(false);
    setDeleteAlertState(false);
    htmlBody.style.overflow = "";
  };

  // set view status
  const viewStatusHandler = (categoryKey, newViewStatus) => {
    const db = getDatabase();
    const updates = {};

    // if categoryKey is not empty
    if (categoryKey != "") {
      setIsLoader(true);

      // update
      updates["/categories/" + categoryKey + "/" + "viewStatus"] =
        newViewStatus;

      // return the update
      return update(ref(db), updates)
        .then(() => {
          if (newViewStatus == true) {
            openToast(`${categoryKey} is now Public`, 1);
          } else {
            openToast(`${categoryKey} is now Private`, 1);
          }
        })
        .catch((error) => {
          openToast("Something went wrong! see console", 0);
          console.log(error);
        })
        .finally(() => {
          setIsLoader(false);
        });
    }
  };

  return (
    <>
      {admin != null ? (
        <div className="max-w-[1200px] mx-auto">
          {adminCategory == "" ? (
            <div className="my-9 bg-gray-800 py-9 rounded-md flex items-center justify-center flex-col ">
              <p className="text-gray-200 text-[2rem] ">
                No Category Were Found
              </p>
              <p className="my-4 font-medium ">
                <Link
                  to={"/admin/category"}
                  className="py-2 px-6 bg-slate-700 rounded-md text-slate-400"
                  title="Create category"
                >
                  Create an Category +
                </Link>
              </p>
            </div>
          ) : (
            <>
              {category == false ? (
                <div className="flex items-center justify-center py-9 ">
                  <FaSpinner className="text-gray-300 text-[2rem] block animate-spin" />
                </div>
              ) : (
                <>
                  {/* add category  */}
                  <div className="py-6 px-5 bg-gray-800 rounded-md">
                    <button
                      className="py-2 px-6 bg-gray-800 text-white hover:bg-gray-700 font-bold rounded-md shadow flex items-center gap-2 duration-300"
                      onClick={() => navigator("/admin/category")}
                      title="Create Category"
                    >
                      <IoMdAdd fontSize={"2rem"}></IoMdAdd>
                    </button>
                  </div>

                  <div className="grid min-[921px]:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 px-5 py-4 mt-9 mb-5">
                    {adminCategory.map((cate) => {
                      return (
                        // box
                        <div
                          key={cate.categoryKey}
                          className="bg-slate-800 rounded-md p-5 mb-3 text-center flex flex-col items-center justify-center gap-2"
                        >
                          {/* image area  */}
                          <div className="w-full h-[400px] bg-gray-700 rounded-md overflow-hidden relative group">
                            {/* image  */}
                            <img
                              src={
                                cate.image
                                  ? cate.image
                                  : "https://via.placeholder.com/180"
                              }
                              alt="404"
                              title={`${cate.title}`}
                              className={`w-full h-full object-cover group-hover:scale-[1.2] duration-300 cursor-pointer group-hover:blur-sm group-hover:brightness-75 ${
                                showMoreState == cate.categoryKey &&
                                "blur-sm scale-[1.2] brightness-75"
                              }`}
                              draggable={false}
                            />

                            {/* left and write */}
                            <div className="w-full h-full p-3 absolute top-0 left-0 flex align-center justify-between gap-1 cursor-default">
                              {/* left side area  */}
                              <div className="w-[50%] flex flex-col items-start gap-2">
                                {/* admin handle  */}
                                <span
                                  className="w-full max-w-[100px] py-1 px-2 bg-[#ec4899] text-[0.8rem] text-gray-100 font-bold rounded-md select-none truncate"
                                  title={`@${cate?.adminHandle}`}
                                >
                                  @{cate?.adminHandle}
                                </span>

                                {/* view status  */}
                                <span
                                  className="w-[80px] py-1 px-2 bg-gray-800 text-[0.7rem] text-gray-100 font-bold rounded-md shadow-[0_0_2px_#000]/75 border border-gray-500 select-none truncate"
                                  title={`${
                                    cate?.viewStatus ? "Public" : "Private"
                                  }`}
                                >
                                  {cate?.viewStatus == true
                                    ? "Public"
                                    : "Private"}
                                </span>
                              </div>

                              {/* right side area  */}
                              <div className="w-[50%] flex flex-col items-end gap-2">
                                {/* btn for more  */}
                                <button
                                  className={`p-4 bg-gray-900/[0.2] backdrop-blur-sm text-gray-100 text-[1.8rem] hover:bg-gray-900/[0.1] ${
                                    showMoreState == cate.categoryKey &&
                                    "bg-gray-900/[0.5] hover:bg-gray-900/[0.3] backdrop-blur-lg animation-left-loop"
                                  } rounded-full duration-300 flex flex-col items-center justify-center cursor-pointer`}
                                  onClick={() => {
                                    showMoreItemsHandler(
                                      cate.categoryKey,
                                      !showMoreState
                                    );
                                  }}
                                  title="More actions"
                                >
                                  <MdKeyboardArrowLeft
                                    className={`${
                                      showMoreState == cate.categoryKey
                                        ? "rotate-180"
                                        : "rotate-0"
                                    } duration-300`}
                                  ></MdKeyboardArrowLeft>
                                </button>

                                {/* items for more  */}
                                <div
                                  className={`cursor-default absolute top-[20%] ${
                                    showMoreState == cate.categoryKey
                                      ? "opacity-1 translate-x-[0] animation-slow-shake"
                                      : "opacity-0 translate-x-[100%]"
                                  } duration-200`}
                                >
                                  <ul className="bg-gray-900/[0.5] backdrop-blur-lg text-gray-100 text-[1.5rem] flex flex-col gap-2 rounded-full">
                                    {/* edit  */}
                                    <li>
                                      <button
                                        className="p-4 hover:bg-gray-900/[0.5] rounded-full duration-300 hover:shadow"
                                        onClick={() =>
                                          navigator(
                                            `/admin/category/${cate.categoryKey}`
                                          )
                                        }
                                      >
                                        <MdEdit></MdEdit>
                                      </button>
                                    </li>

                                    {/* delete  */}
                                    <li>
                                      <button
                                        className="p-4 hover:bg-gray-900/[0.5] rounded-full duration-300 hover:shadow"
                                        onClick={() =>
                                          deleteAlertHandler(
                                            cate.categoryKey,
                                            !deleteAlertState
                                          )
                                        }
                                      >
                                        <MdDelete></MdDelete>
                                      </button>
                                    </li>

                                    {/* set view status  */}
                                    <li>
                                      <button
                                        className="p-4 hover:bg-gray-900/[0.5] rounded-full duration-300 hover:shadow"
                                        onClick={() =>
                                          viewStatusHandler(
                                            cate.categoryKey,
                                            !cate?.viewStatus
                                          )
                                        }
                                      >
                                        {isLoader ? (
                                          <FaSpinner
                                            className={`block animate-spin`}
                                          />
                                        ) : cate?.viewStatus ? (
                                          <MdPublic></MdPublic>
                                        ) : (
                                          <MdPublicOff></MdPublicOff>
                                        )}
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* delete alert area */}
                            <div
                              className={` ${
                                deleteAlertState == cate.categoryKey
                                  ? "flex"
                                  : "hidden"
                              } w-[100%] h-[100vh] bg-black/25 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
                            >
                              <div className="py-4 px-6 bg-gray-700 rounded-md flex flex-col items-center gap-3">
                                <p className="text-[1.1rem] text-gray-100 font-bold">
                                  Are you sure?
                                </p>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    className="py-2 px-5 bg-gray-500 text-gray-100 font-bold hover:bg-gray-400 rounded-md"
                                    onClick={cancelDeleteHandler}
                                  >
                                    No
                                  </button>

                                  {/* delete btn  */}
                                  <button
                                    type="button"
                                    className="py-2 px-5 bg-gray-900 text-gray-200 font-medium hover:bg-gray-800 rounded-md flex items-center gap-2"
                                    onClick={() =>
                                      deleteCategoryHandler(cate.categoryKey)
                                    }
                                  >
                                    Delete
                                    {isDeleting && (
                                      <FaSpinner className="block animate-spin" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* title  */}
                          <p
                            className="w-full font-bold text-[1.3rem] text-gray-100 truncate"
                            title={`${cate.title}`}
                          >
                            {cate.title}
                          </p>
                          {/* description  */}
                          <p
                            className="w-full text-gray-200 truncate"
                            title={`Description`}
                          >
                            {cate.description}
                          </p>
                          {/* category  */}
                          <div
                            className="w-full bg-gray-600 text-gray-100 py-1 px-6 rounded-md truncate"
                            title={`${cate.category}`}
                          >
                            {cate.category}
                          </div>
                          {/* add btn  */}
                          <button
                            className="text-gray-200 hover:text-gray-300 duration-100 rounded-full overflow-hidden text-[3rem] mt-3"
                            title="Add Questions"
                            onClick={() =>
                              btnClickHandler(
                                cate.categoryKey,
                                cate.title,
                                cate.category
                              )
                            }
                          >
                            <MdAddCircle></MdAddCircle>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div
          className={`${
            admin == null ? "block" : "hidden"
          } max-w-[1200px] mx-auto sm:p-5`}
        >
          {/* admin details  */}
          <div className="w-full bg-gray-800 mt-4 sm:rounded-3xl shadow-lg p-5 flex items-center justify-center relative z-[2]">
            {/* illustration image div  */}
            <div className="sm:block hidden w-full h-full absolute top-0 z-[-1] brightness-[0.5]">
              <img
                src="src\assets\svgs\undraw_mobile_login_re_9ntv.svg"
                alt="404"
                className="w-full h-full object-cover object-left-center"
              />
            </div>

            {/* form  */}
            <form onSubmit={submitHandler}>
              {/* another div  */}
              <div className="max-w-[700px] mx-auto my-6 sm:p-5 rounded-3xl flex items-center justify-center flex-col gap-3 py-9 text-gray-200 font-bold">
                {/* heading  */}
                <h1 className="sm:text-[2rem] text-[1.8rem] text-gray-100 font-black sm:mb-2 mb-4 text-center">
                  Create Admin Account
                </h1>

                {/* admin name  */}
                <div className="w-full flex items-center gap-4">
                  {/* first name  */}
                  <div className="w-full mb-4">
                    <label htmlFor="first_name" className="block ">
                      First Name
                    </label>
                    <input
                      type="first_name"
                      id="first_name"
                      name="firstName"
                      defaultValue={currentUser?.firstName}
                      required
                      // onChange={() => onchangeHandler("firstName")}
                      className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
                    />
                  </div>

                  {/* last name  */}
                  <div className="w-full mb-4">
                    <label htmlFor="last_name" className="block ">
                      Last Name
                    </label>
                    <input
                      type="last_name"
                      id="last_name"
                      name="lastName"
                      defaultValue={currentUser?.lastName}
                      required
                      // onChange={() => onchangeHandler("lastName")}
                      className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
                    />
                  </div>
                </div>

                {/* admin handle  */}
                <div className="w-full mb-4 mt-2">
                  {/* admin handle  */}
                  <div className="w-full px-2 bg-gray-100 font-normal text-gray-700 border rounded-md overflow-hidden flex items-center gap-[2px]">
                    <span className="bg-gray-100 font-black text-[#ff8ac5]">
                      @
                    </span>

                    <input
                      type="text"
                      id="admin_Handle"
                      name="adminHandle"
                      defaultValue={`${currentUser?.firstName}-${currentUser?.lastName}`}
                      required
                      maxLength={30}
                      onChange={(e) => adminHandleOnchange(e)}
                      className="w-full py-2 bg-transparent border-none outline-none lowercase"
                    />
                  </div>

                  {/* admin handle alert  */}
                  {adminHandleAlert != null && (
                    <p
                      className={`text-[0.8rem] font-medium mt-1 px-1 ${
                        adminHandleAlertState == 0
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {adminHandleAlert}
                    </p>
                  )}
                </div>

                {/* handles btns  */}
                <div className="w-full mb-4 font-bold flex items-center justify-end gap-3 ">
                  {/* cancel btn  */}
                  <button
                    type="button"
                    className="bg-[#ff8ac5] text-gray-800 border border-[#ff8ac5] hover:bg-gray-800 hover:text-[#ff8ac5] py-2 px-5 rounded-3xl text-sm duration-300"
                    onClick={() => navigator("/")}
                  >
                    Cancel
                  </button>

                  {/* create btn  */}
                  <button
                    className={`bg-[#ff8ac5] text-gray-800 border border-[#ff8ac5] hover:bg-gray-800 hover:text-[#ff8ac5] py-2 px-5 rounded-3xl text-sm duration-300 flex items-center gap-2 ${
                      adminHandleAlertState == 0 &&
                      "cursor-not-allowed bg-[#ff8ac5]/50 border-[#ff8ac5]/50 hover:bg-[#ff8ac5]/50 hover:text-gray-800"
                    }`}
                    disabled={adminHandleAlertState == 0 ? true : false}
                  >
                    Create
                    <FaSpinner
                      className={` ${
                        isLoader ? "block" : "hidden"
                      } animate-spin`}
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;
