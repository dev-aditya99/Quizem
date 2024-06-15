import React, { useContext, useEffect, useState } from "react";
import { Context } from "../MainContext";
import { useNavigate } from "react-router-dom";
import { MdCameraAlt, MdDelete, MdWarning } from "react-icons/md";
import { FaSpinner, FaXmark } from "react-icons/fa6";
import { FaUpload } from "react-icons/fa";
import { getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  update,
  remove,
} from "firebase/database";
import { getAuth, deleteUser } from "firebase/auth";

function Profile() {
  const {
    admin,
    user,
    openToast,
    currentUser,
    updateUser,
    isLoader,
    setIsLoader,
    removeProfilePicHandler,
    htmlBody,
    adminCategory,
    dataKeys,
    logout,
    holdUserPlayDataKeys,
  } = useContext(Context);
  const navigator = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(false);
  const [showProfilePicUploader, setShowProfilePicUploader] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageBlob, setSelectedImageBlob] = useState(null);
  const [isAnyChange, setIsAnyChange] = useState(false);
  const [cancelPopUp, setCancelPopUp] = useState(false);
  const [deleteAlertState, setDeleteAlertState] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmUser, setShowConfirmUser] = useState(false);

  function handleImageChange(event) {
    const file = event.target.files[0];
    const blob = new Blob([file], {
      type: "image/*",
    });

    setSelectedImageBlob(blob);

    const imageNewURL = URL.createObjectURL(blob);
    setSelectedImage(imageNewURL);

    // profile pic uploader state
    setShowProfilePicUploader(true);
  }

  const uploadProfilePicHandler = async () => {
    setIsLoader(currentUser?.username);
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `profileImages/${currentUser?.userKey}.png`
    );

    const metadata = {
      contentType: "image/png",
    };

    // Upload the file and metadata
    const uploadTask = uploadBytes(storageRef, selectedImageBlob, metadata);
    uploadTask
      .then((snapshot) => {
        updateUser();
        setShowProfilePicUploader(false);
        openToast("Profile Pic Updated", 1);
      })
      .finally(() => {
        setIsLoader(false);
      });
  };

  useEffect(() => {
    setIsLoader(false);
    let lsUser = localStorage.getItem("user");
    if (lsUser == null) {
      navigator("/auth");
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();

    setIsLoader(true);
    // get database
    const db = getDatabase();
    const updates = {};

    // update data according conditions
    if (isAnyChange?.firstName == "firstName") {
      updates["/users/" + currentUser?.userKey + "/" + "firstName"] =
        e.target.firstName.value;
    }

    if (isAnyChange?.lastName == "lastName") {
      updates["/users/" + currentUser?.userKey + "/" + "lastName"] =
        e.target.lastName.value;
    }

    if (isAnyChange?.username == "username") {
      updates["/users/" + currentUser?.userKey + "/" + "username"] =
        e.target.username.value;
    }

    return update(dbRef(db), updates)
      .then(() => {})
      .finally(() => {
        setIsLoader(false);
        setIsAnyChange(false);
      });
  };

  const onchangeHandler = (changing_state) => {
    const changingObj = {
      ...isAnyChange,
      [changing_state]: changing_state,
    };

    setIsAnyChange(changingObj);
  };

  const cnacelBtnHandler = () => {
    if (isAnyChange) {
      setCancelPopUp(true);
      htmlBody.style.overflow = "hidden";
    } else {
      htmlBody.style.overflow = "";
      navigator("/");
    }
  };

  const cancelYesBtnHandler = () => {
    setIsAnyChange(false);
    navigator("/");
    htmlBody.style.overflow = "";
  };

  const cancelNoBtnHandler = () => {
    setCancelPopUp(false);
    htmlBody.style.overflow = "";
  };

  // delete user handler
  const deleteUserHandler = (username, adminID, adminHandle) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase(); // Get a reference to the database
    const storage = getStorage();
    const updates = {};

    if (user) {
      setIsDeleting(true);
      // delete admin and related data
      if (admin != "") {
        // delte categories and quizes
        if (adminCategory != "") {
          // delete quizes
          if (dataKeys) {
            let found = [];
            for (let key in adminCategory) {
              // push in found if they matched
              for (let d of dataKeys) {
                if (d == adminCategory[key]?.categoryKey) {
                  found.push(d);
                }
              }
            }

            // get data of found
            for (let qKey of found) {
              const path = "quiz-cards/" + qKey;
              remove(dbRef(db, path))
                .then((success) => {
                  openToast(`Quiz ${qKey} is deleted`, 1);
                })
                .catch((error) => {
                  openToast(`Can't delete Quiz ${qKey}`, 0);
                });
            }
          }

          // delete categories
          for (let key in adminCategory) {
            let category_key = adminCategory[key]?.categoryKey;
            const path = "categories/" + category_key;
            remove(dbRef(db, path))
              .then((success) => {
                openToast(`Category ${category_key} is deleted`, 1);

                // Create a reference to the file to delete
                const desertRef = ref(
                  storage,
                  `categoryBanner/${category_key}.png`
                );

                // Delete the file
                deleteObject(desertRef)
                  .then(() => {
                    // File deleted successfully
                  })
                  .catch((error) => {
                    // Uh-oh, an error occurred!
                    console.log(error);
                  });
              })
              .catch((error) => {
                openToast(`Can't delete Quiz ${category_key}`, 0);
              });
          }
        }

        // delete admin
        const path = "admins/" + adminID;
        remove(dbRef(db, path))
          .then((success) => {
            openToast(`Admin account is deleted`, 1);
          })
          .catch((error) => {
            openToast(`Can't delete ${adminID}`, 0);
          });
      }

      // delete the user from auth and user details from the database
      if (currentUser != "") {
        // delete the user
        const path = "users/" + currentUser?.userKey;
        remove(dbRef(db, path))
          .then((success) => {
            openToast(`User details is deleted`, 1);

            // Create a reference to the file to delete
            const desertRef = ref(
              storage,
              `profileImages/${currentUser?.userKey}.png`
            );

            // Delete the file
            deleteObject(desertRef)
              .then(() => {
                // File deleted successfully
              })
              .catch((error) => {
                // Uh-oh, an error occurred!
                console.log(error);
              });
          })
          .catch((error) => {
            openToast(`Can't delete details`, 0);
          })
          .finally(() => {
            // delete the user from auth
            deleteUser(user)
              .then(() => {
                // delete the user paly data
                holdUserPlayDataKeys.map(async (key) => {
                  updates["usersPlayData/" + key] = {};

                  return await update(dbRef(db), updates)
                    .then(() => {
                      // User deleted.
                      openToast(`User account is deleted`, 1);
                    })
                    .catch((error) => {
                      // An error ocurred
                      openToast(`Can't delete the user`, 0);
                      console.log(error);
                    });
                });
              })
              .catch((error) => {
                // An error ocurred
                openToast(`Can't delete the user`, 0);
                console.log(error);
                // ...
              })
              .finally(() => {
                htmlBody.style.overflow = "";
                setIsDeleting(false);
                setDeleteAlertState(false);
                navigator("/auth");
                logout();
                location.reload();
              });
          });
      }
    }
  };

  // delete alert handler
  const deleteAlertHandler = () => {
    setDeleteAlertState(true);
    htmlBody.style.overflow = "hidden";
  };

  // cancel delete
  const cancelDeleteHandler = () => {
    setDeleteAlertState(false);
    htmlBody.style.overflow = "";
  };

  // form 2
  // confirm user submit handler
  const confirmUserSubmitHandler = (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;
    // const confirmCheck = e.target.confirm_check.value;

    if (email != "" && password != "") {
      if (e.target.confirm_check.checked == true) {
        if (email == currentUser?.email && password == currentUser?.password) {
          deleteUserHandler(
            currentUser?.username,
            admin?.adminID,
            admin?.adminHandle
          );
        } else {
          openToast("Invalid User!", 0);
        }
      } else {
        openToast("Please check the box!", 4);
      }
    } else {
      openToast("Fill all the fields", 4);
    }
  };

  // confirm user
  const confirmUserHandler = () => {
    setShowConfirmUser(true);
    setDeleteAlertState(false);
    htmlBody.style.overflow = "hidden";
  };

  // cancel confirm user
  const cancelConfirmUserHandler = () => {
    setShowConfirmUser(false);
    htmlBody.style.overflow = "";
  };

  return (
    <div className="max-w-[1200px] mx-auto mt-10 sm:p-6 py-6 ">
      {/* user pic  */}
      <div className="bg-gray-800 flex items-center justify-center flex-col gap-2 py-4 rounded-md shadow-inner">
        <label htmlFor="profile_pic_id">
          <div className="group h-[180px] w-[180px] rounded-full overflow-hidden border-2 border-gray-400 cursor-pointer relative flex items-center justify-center">
            <img
              src={
                currentUser?.userImage
                  ? currentUser?.userImage
                  : "https://cdn-icons-png.flaticon.com/128/74/74472.png"
              }
              alt="404"
              className="h-full w-full rounded-full  bg-no-repeat bg-center object-cover group-hover:brightness-50 duration-200"
            />
            <MdCameraAlt className="group-hover:block hidden absolute text-[2rem] text-gray-300"></MdCameraAlt>
          </div>
        </label>
        {/* alert bottom card  */}
        <div className="py-6 px-6 sm:text-[0.8rem] text-[0.8rem] text-white font-medium rounded-md flex items-center sm:gap-3 gap-2">
          <button
            className="py-2 sm:px-4 px-2 bg-[#ec4899] hover:bg-[#fc6fb5] hover-text-gray-500 rounded-md duration-300"
            onClick={() => setShowProfilePic(true)}
          >
            View Profile Pic
          </button>
          <button className="py-2 sm:px-4 px-2 bg-[#ec4899] hover:bg-fc6fb5f989c1] hover-text-gray-500 rounded-md duration-300">
            <label
              htmlFor="profile_pic_id"
              className="inline-block w-full h-full"
            >
              Change Profile Pic
            </label>
            <input
              type="file"
              name="profile_pic"
              id="profile_pic_id"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </button>
          {/* profile pic uploader screen */}
          <div
            className={`${
              showProfilePicUploader ? "flex" : "hidden"
            } w-full h-full bg-black/75 fixed top-0 left-0 z-[9999] items-center justify-center cursor-default`}
          >
            <div className="w-[80%] p-6 bg-gray-800 rounded-3xl">
              <p className="text-[1.5rem] text-gray-100 text-left border-b-4 border-gray-300 py-3 mb-4 flex items-center gap-2">
                Upload File <FaUpload className="text-[#ec4899]"></FaUpload>
              </p>

              <div className="w-full h-[300px] bg-gray-600 rounded-md p-5">
                <img
                  src={selectedImage}
                  alt="404"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="w-full mt-5 py-3 flex items-center justify-end gap-2">
                <button
                  className="py-2 px-6 bg-gray-600 text-gray-100 text-[1rem] font-bold rounded-3xl hover:bg-gray-700 border border-gray-500 duration-200"
                  onClick={() => setShowProfilePicUploader(false)}
                >
                  Cancel
                </button>
                <button
                  className={`py-2 px-6 text-[1rem] font-bold rounded-3xl hover:bg-[#ec4899]/25 hover:text-[#ec4899] border border-[#ec4899] duration-200 flex items-center gap-2 ${
                    isLoader
                      ? "bg-[#ec4899]/25 text-[#ec4899]"
                      : "bg-[#ec4899] text-white"
                  }`}
                  onClick={uploadProfilePicHandler}
                >
                  {isLoader ? "Uploading" : "Upload"}
                  <FaSpinner
                    className={` ${isLoader ? "block" : "hidden"} animate-spin`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            className="py-2 sm:px-4 px-2 bg-[#ec4899] hover:bg-[#fc6fb5] hover-text-gray-500 rounded-md duration-300"
            onClick={removeProfilePicHandler}
          >
            Remove Profile Pic
          </button>
        </div>

        {/* profile pic viewer  */}
        <div
          className={`${
            showProfilePic ? "flex" : "hidden"
          } w-full h-full bg-black/75 fixed top-0 left-0 z-[9999] items-center justify-center backdrop-blur-sm`}
        >
          <img
            src={currentUser?.userImage}
            alt="404"
            className="w-[80%] h-[80%] object-contain"
          />
          <button className="p-5 absolute top-0 right-0 text-gray-200 text-[1.5rem] hover:text-gray-500 duration-200">
            <FaXmark onClick={() => setShowProfilePic(false)}></FaXmark>
          </button>
        </div>
      </div>
      {/* user details  */}
      <div className="w-full bg-gray-800 mt-4 sm:rounded-3xl shadow-lg p-5 flex items-center justify-center">
        {/* form area */}
        <form onSubmit={submitHandler}>
          <div className="max-w-[700px] mx-auto my-6 sm:p-5 rounded-3xl flex items-center justify-center flex-col gap-3 py-9 text-gray-200 font-bold">
            <div className="w-full flex items-center gap-4">
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
                  onChange={() => onchangeHandler("firstName")}
                  className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
                />
              </div>
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
                  onChange={() => onchangeHandler("lastName")}
                  className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
                />
              </div>
            </div>
            <div className="w-full mb-4">
              <input
                type="text"
                id="user_name"
                name="username"
                defaultValue={currentUser?.username}
                required
                onChange={() => onchangeHandler("username")}
                // placeholder="@username"
                className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
              />
            </div>
            <div className="w-full mb-4">
              <label htmlFor="email" className="block ">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={currentUser?.email}
                required
                readOnly
                onChange={() => onchangeHandler("email")}
                className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
              />
              <div className="w-full mt-2 text-[#ff8ac5] font-medium ">
                <button className="text-sm hover:underline">
                  Change Email
                </button>
              </div>
            </div>

            <div className="w-full relative group">
              <label htmlFor="password" className="block ">
                Password
              </label>
              <input
                type={`${showPassword ? "text" : "password"}`}
                id="password"
                name="password"
                defaultValue={currentUser?.password}
                required
                readOnly
                onChange={() => onchangeHandler("password")}
                className="mt-2 p-2 bg-gray-100 font-normal text-gray-700 border rounded-md w-full outline-none"
              />

              <div className="w-full mt-2 text-[#ff8ac5] font-medium ">
                <button className="text-sm hover:underline">
                  Change Password
                </button>
              </div>
            </div>

            <div className="w-full mb-4 font-bold flex items-center justify-end gap-3 ">
              <button
                type="button"
                className="bg-[#ff8ac5] text-gray-800 border border-[#ff8ac5] hover:bg-gray-800 hover:text-[#ff8ac5] py-2 px-5 rounded-3xl text-sm duration-300"
                onClick={cnacelBtnHandler}
              >
                Cancel
              </button>
              <button
                className={` border py-2 px-5 rounded-3xl text-sm duration-300 flex items-center gap-2 ${
                  isAnyChange
                    ? "bg-[#ff8ac5] text-gray-800 hover:bg-gray-800 hover:text-[#ff8ac5] border-[#ff8ac5]"
                    : "cursor-not-allowed bg-gray-600 border-gray-600"
                }`}
                disabled={isAnyChange ? false : true}
              >
                {isLoader ? "Saving" : "Save"}
                <FaSpinner
                  className={` ${isLoader ? "block" : "hidden"} animate-spin`}
                />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* settings  */}
      <div className="w-full bg-gray-800 mt-4 sm:rounded-full  shadow-lg p-5 flex items-center justify-center">
        <ul className="w-full flex items-center justify-center gap-3">
          <li className="flex items-center">
            <button
              className="text-[1.5rem] text-gray-100 hover:text-gray-300 duration-300"
              onClick={() => deleteAlertHandler()}
            >
              <MdDelete></MdDelete>
            </button>
          </li>
        </ul>

        {/* delete alert area */}
        <div
          className={` ${
            deleteAlertState ? "flex" : "hidden"
          } w-full h-[100vh] px-2 bg-black/25 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
        >
          <div className="py-4 px-6 bg-gray-700 rounded-md flex flex-col items-center gap-3">
            <p className="text-[1.3rem] text-yellow-500 font-bold flex flex-col items-center">
              <MdWarning fontSize={"3rem"}></MdWarning>
              Warning
            </p>
            <div className="max-w-[400px] text-[0.9rem] text-gray-100 font-medium text-center px-5 mb-4">
              Deleting your Quizem account will permanently delete your admin
              account, categories, quizzes, and play data. This action cannot be
              undone. Are you sure you want to proceed?
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="py-2 px-5 bg-gray-500 text-gray-100 font-bold hover:bg-gray-400 rounded-md"
                onClick={cancelDeleteHandler}
              >
                No
              </button>
              <button
                type="button"
                className="py-2 px-5 bg-gray-900 text-gray-200 font-medium hover:bg-gray-800 rounded-md flex items-center gap-2"
                onClick={() => confirmUserHandler()}
              >
                Delete
                {isDeleting && <FaSpinner className="block animate-spin" />}
              </button>
            </div>
          </div>
        </div>

        {/* confirm user details  */}
        <div
          className={` ${
            showConfirmUser ? "flex" : "hidden"
          } w-full h-[100vh] px-2 bg-black/25 backdrop-blur-sm fixed top-0 left-0 z-[999] items-center justify-center`}
        >
          {/* confirm user form  */}
          <div className="w-full max-w-[400px] py-7 px-9 bg-gray-700 rounded-xl flex flex-col items-center gap-3">
            <div className="mb-4 py-1 px-5 bg-gray-900 sm:text-[1.3rem] text-[1rem] text-gray-100 font-bold rounded-full">
              Confirm Your Details
            </div>

            <form onSubmit={confirmUserSubmitHandler} className="w-full">
              {/* email  */}
              <div className="w-full flex flex-col gap-2 mb-3">
                <label
                  htmlFor="email_2"
                  className="text-[1.1rem] text-gray-100 font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email_2"
                  name="email"
                  required
                  className="py-1 px-2 border-0 outline-0 rounded-sm"
                />
              </div>

              {/* password  */}
              <div className="w-full flex flex-col gap-2 mb-3">
                <label
                  htmlFor="password_2"
                  className="text-[1.1rem] text-gray-100 font-medium"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password_2"
                  name="password"
                  required
                  className="py-1 px-2 border-0 outline-0 rounded-sm"
                />
              </div>

              {/* check box  */}
              <div className="w-full flex items-start gap-2 mb-6">
                <input
                  type="checkbox"
                  id="confirm_check"
                  name="confirm_check"
                  required
                  className="text-gray-400 mt-[4px]"
                />

                <label
                  htmlFor="confirm_check"
                  className="text-[0.7rem] text-gray-400 font-normal"
                >
                  Yes! I know that after clicking on the submit button, my
                  Quizem account, along with all its data (such as admin
                  account, categories, quizzes, and your scores, etc.), will be
                  deleted.
                </label>
              </div>

              {/* btns  */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {/* cancel button */}
                <button
                  type="button"
                  className="py-2 px-5 bg-gray-500 text-gray-100 font-bold hover:bg-gray-600 rounded-md duration-300"
                  onClick={cancelConfirmUserHandler}
                >
                  Cancel
                </button>
                {/* submit button  */}
                <button
                  className="py-2 px-5 bg-gray-800/50 text-gray-200 font-medium hover:bg-gray-900 rounded-md flex items-center gap-2 duration-300"
                  onClick={() => confirmUserHandler()}
                >
                  Confirm
                  {isDeleting && <FaSpinner className="block animate-spin" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* cancel btn alert area  */}
      <div
        className={` ${
          cancelPopUp ? "flex" : "hidden"
        } w-full h-[100vh] bg-black/25 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
      >
        <div className="py-4 px-6 bg-gray-700 rounded-md flex flex-col items-center gap-3">
          <p className="text-[1.1rem] text-gray-100">Are you sure?</p>
          <div className="flex items-center gap-3">
            <button
              className="py-2 px-5 bg-gray-100 rounded-md hover:bg-gray-200 duration-300"
              onClick={cancelNoBtnHandler}
            >
              No
            </button>
            <button
              className="py-2 px-5 bg-gray-600 rounded-md text-gray-100 hover:bg-gray-500 duration-300"
              onClick={cancelYesBtnHandler}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
