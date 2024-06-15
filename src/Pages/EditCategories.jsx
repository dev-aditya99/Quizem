import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RiImageAddFill } from "react-icons/ri";
import { Context } from "../MainContext";
import { getDatabase, ref, set, onValue, update } from "firebase/database";
import { getStorage, ref as storRef, uploadBytes } from "firebase/storage";
import { FaSpinner, FaUpload } from "react-icons/fa";
import { MdOutlineRemove } from "react-icons/md";

function EditCategories() {
  const { htmlBody, openToast, user, admin, isLoader, setIsLoader } =
    useContext(Context);
  const navigator = useNavigate();
  const [newCategory, setNewCategory] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageBlob, setSelectedImageBlob] = useState(null);
  const [showCategoryBannerUploader, setShowCategoryBannerUploader] =
    useState(false);
  const [isAnyChange, setIsAnyChange] = useState(false);
  const [cancelPopUp, setCancelPopUp] = useState(false);

  // refs
  const uploadImageRef = useRef();

  // non user redirection
  useEffect(() => {
    setIsLoader(false);
    let lsAdmin = localStorage.getItem("admin");
    if (!lsAdmin) {
      navigator("/auth");
    }
  }, [user]);

  // get slug from the URL
  const params = useParams();
  const categorySulg = params?.slug;

  // get category data from the firebase accordingly slug
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "categories/");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      let dataArr = {};
      if (data) {
        for (let key in data) {
          if (key == categorySulg) {
            dataArr = {
              ...data[key],
              id: key,
            };
          }
        }
        setNewCategory(dataArr);
      }
    });
  }, [categorySulg]);

  // array of categories
  const quizCategories = [
    "Animals & Wildlife",
    "Arts & Crafts",
    "Automotive",
    "Business & Finance",
    "Computer Science",
    "Cuisine & Cooking",
    "Education & Learning",
    "Entertainment",
    "Environmental Science & Conservation",
    "Fashion & Style",
    "Famous Quotes & Sayings",
    "Food & Drink",
    "General Knowledge",
    "Geography",
    "Health & Wellness",
    "History",
    "Home & Garden",
    "Language & Linguistics",
    "Literature & Writing",
    "Mathematics",
    "Movies & Film",
    "Music",
    "Mythology & Folklore",
    "Nature & Outdoors",
    "Other",
    "Personal Finance",
    "Pets & Animals",
    "Philosophy",
    "Photography",
    "Politics & Government",
    "Pop Culture",
    "Psychology",
    "Religion & Spirituality",
    "Science & Technology",
    "Social Media",
    "Sports & Recreation",
    "Travel & Tourism",
    "Video Games",
    "World Records & Achievements",
  ];

  useEffect(() => {
    // Custom sorting function for case-insensitive and special character handling
    quizCategories
      .slice()
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "accent" }));
  }, []);

  // get image handler
  const getImageHandler = (e) => {
    const file = e.target.files[0];
    const blob = new Blob([file], {
      type: "image/*",
    });
    setSelectedImageBlob(blob);
    const imageNewURL = URL.createObjectURL(blob);
    setSelectedImage(imageNewURL);
    // category banner uploader state
    setShowCategoryBannerUploader(true);
  };

  // Category banner uploader
  const uploadCategoryBannerHandler = async () => {
    setIsLoader(true);
    const storage = getStorage();
    const storageRef = storRef(
      storage,
      `categoryBanner/${newCategory?.id}.png`
    );

    const metadata = {
      contentType: "image/png",
    };

    // Upload the image file and metadata
    const uploadTask = uploadBytes(storageRef, selectedImageBlob, metadata);
    uploadTask
      .then((snapshot) => {
        setShowCategoryBannerUploader(false);
        openToast("Banner Updated", 1);
        // update image
        const db = getDatabase();
        const newBanner = `https://firebasestorage.googleapis.com/v0/b/quiz-game-ece43.appspot.com/o/categoryBanner%2F${newCategory?.id}.png?alt=media&token=e3599b11-2062-4bf1-9962-58e2e0d9f3d5`;

        const updates = {};
        updates["/categories/" + newCategory?.id + "/" + "image"] = newBanner;

        return update(ref(db), updates);
      })
      .catch((error) => {
        openToast("Something wrong! see console", 0);
        console.log(error);
      })
      .finally(() => {
        setIsLoader(false);
        location.reload();
      });
  };

  // onchange handler
  const onchangeHandler = (changing_state) => {
    const changingObj = {
      ...isAnyChange,
      [changing_state]: changing_state,
    };
    setIsAnyChange(changingObj);
  };

  // cancel btn
  const cnacelBtnHandler = () => {
    if (isAnyChange) {
      setCancelPopUp(true);
      htmlBody.style.overflow = "hidden";
    } else {
      htmlBody.style.overflow = "";
      navigator("/admin");
    }
  };

  // cancel yes btn
  const cancelYesBtnHandler = () => {
    setIsAnyChange(false);
    navigator("/admin");
    htmlBody.style.overflow = "";
  };

  // cancel no btn
  const cancelNoBtnHandler = () => {
    setCancelPopUp(false);
    htmlBody.style.overflow = "";
  };

  // submit handler
  const submitHandler = async (e) => {
    e.preventDefault();

    // get database
    const db = getDatabase();
    const updates = {};

    // take banner image url ,if exist?
    let imageFile = e.target.image_url.value
      ? newCategory?.image != e.target.image_url.value
        ? e.target.image_url.value
        : null
      : null;

    // take all the data
    let image = imageFile;
    let category = e.target.select_category.value;
    let title = e.target.title.value;
    let description = e.target.description.value;
    let viewStatus = Boolean(e.target.view_status.value);

    // check that any input is not empty
    if (category != "" && title != "" && description != "") {
      setIsLoader(true);

      // update data according conditions
      // update category
      if (isAnyChange?.category == "category") {
        updates["/categories/" + newCategory?.id + "/" + "category"] = category;
      }

      // update title
      if (isAnyChange?.title == "title") {
        updates["/categories/" + newCategory?.id + "/" + "title"] = title;
      }

      // update description
      if (isAnyChange?.description == "description") {
        updates["/categories/" + newCategory?.id + "/" + "description"] =
          description;
      }

      // update banner URL
      if (isAnyChange?.bannerURL == "bannerURL") {
        if (image != null) {
          updates["/categories/" + newCategory?.id + "/" + "image"] = image;
        }
      }

      // update description
      if (isAnyChange?.view_status == "view_status") {
        updates["/categories/" + newCategory?.id + "/" + "viewStatus"] =
          viewStatus;
      }
    } else {
      openToast("Fields can't empty", 4);
    }
    return update(ref(db), updates)
      .then(() => {
        openToast("Category updated", 1);
      })
      .catch((error) => {
        openToast("Something went wrong! see console", 0);
        console.log(error);
      })
      .finally(() => {
        setIsLoader(false);
        setIsAnyChange(false);
      });
  };

  return (
    <>
      {newCategory ? (
        <div>
          {/* heading  */}
          <h1 className="w-[95%] mx-auto bg-gray-800 text-gray-100 p-5 rounded-md font-black sm:text-[2rem] text-[1.5rem]">
            Update Category
          </h1>

          {/* main area  */}
          <div className="w-full">
            <div className="w-[95%] mx-auto py-6 px-5 rounded">
              {/* form  */}
              <form onSubmit={(e) => submitHandler(e)}>
                {/* upload image from pc  */}
                <label htmlFor="upload-image" title="Upload Banner">
                  <div className="group w-full h-[400px] mx-auto bg-gray-600 text-gray-300 rounded-md flex items-center justify-center cursor-pointer overflow-hidden relative">
                    {newCategory?.image != "" ? (
                      <img
                        src={newCategory?.image}
                        alt="404"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <RiImageAddFill
                        fontSize={"5rem"}
                        title="Add image"
                      ></RiImageAddFill>
                    )}

                    <button
                      type="button"
                      className="group-hover:opacity-100 opacity-0 m-5 p-2 bg-slate-800/75 text-white text-[1.2rem] hover:bg-slate-800 active:bg-slate-600 rounded-full absolute top-0 right-0 duration-200"
                      onClick={() => {
                        uploadImageRef.current.value = null;
                        setSelectedImageBlob(null);
                        uploadCategoryBannerHandler();
                      }}
                    >
                      <MdOutlineRemove />
                    </button>
                  </div>
                </label>

                <input
                  type="file"
                  accept=".jpg, .png, .jpeg, .webp"
                  id="upload-image"
                  className="hidden"
                  name="image_file"
                  ref={uploadImageRef}
                  onChange={(e) => getImageHandler(e)}
                />

                {/* banner pic uploader screen */}
                <div
                  className={`${
                    showCategoryBannerUploader ? "flex" : "hidden"
                  } w-full h-full bg-black/75 fixed top-0 left-0 z-[9999] items-center justify-center cursor-default`}
                >
                  <div className="w-[80%] p-6 bg-slate-800 rounded-3xl">
                    <p className="text-[1.5rem] text-white text-left border-b-4 py-3 mb-4 flex items-center gap-2">
                      Upload File{" "}
                      <FaUpload className="text-[#ec4899]"></FaUpload>
                    </p>

                    {/* banner showing area  */}
                    <div className="w-full h-[300px] bg-gray-100 rounded-md ">
                      <img
                        src={selectedImage}
                        alt="404"
                        className="w-full h-full object-cover object-center rounded-md"
                      />
                    </div>

                    {/* btns  */}
                    <div className="w-full mt-5 py-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="py-2 px-6 bg-gray-100 text-gray-800 text-[1rem] font-bold rounded-3xl hover:bg-slate-800 hover:text-gray-100 border border-gray-500 duration-200"
                        onClick={() => setShowCategoryBannerUploader(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`py-2 px-6 text-[1rem] font-bold rounded-3xl hover:bg-slate-800 hover:text-[#ec4899] border border-[#ec4899] duration-200 flex items-center gap-2 ${
                          isLoader
                            ? "bg-white text-[#ec4899]"
                            : "bg-[#ec4899] text-white"
                        }`}
                        onClick={uploadCategoryBannerHandler}
                      >
                        {isLoader ? "Uploading" : "Upload"}
                        <FaSpinner
                          className={` ${
                            isLoader ? "block" : "hidden"
                          } animate-spin`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* banner URL  */}
                <div className="w-full max-w-[300px] mx-auto my-6 flex flex-col justify-center items-center gap-3">
                  <span className="text-[1.2rem] text-gray-100 font-bold">
                    Or
                  </span>
                  <input
                    type="url"
                    placeholder="Image URL"
                    name="image_url"
                    defaultValue={newCategory?.image}
                    className="w-full bg-gray-700 text-gray-100 border-0 outline-none p-2 rounded-md "
                    onChange={() => onchangeHandler("bannerURL")}
                  />
                </div>

                {/* category details  */}
                <div className="py-5">
                  <ul className="flex flex-col gap-4">
                    {/* category  */}
                    <li className="flex sm:flex-row flex-col sm:gap-0 gap-4 text-gray-100">
                      <p className="w-[200px]">Category : </p>
                      <div className="sm:w-[500px] w-full relative inline-block">
                        <select
                          className="w-full block appearance-none bg-gray-700 text-gray-100 border border-gray-700 hover:border-gray-500 focus:border-gray-500 px-4 py-2 pr-8 rounded-md shadow leading-tight outline-none cursor-pointer"
                          onChange={() => onchangeHandler("category")}
                          name="select_category"
                          defaultValue={newCategory?.category}
                          required
                        >
                          <option defaultValue="">
                            -- Select a Category --
                          </option>
                          {quizCategories?.map((category, index) => (
                            <option key={index} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-100">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 11.293a1 1 0 011.414 0L10 12.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414zM10 4a1 1 0 011 1v7a1 1 0 11-2 0V5a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </li>
                    {/* title  */}
                    <li className="flex sm:flex-row flex-col sm:gap-0 gap-4">
                      <p className="w-[200px] text-gray-100">Title : </p>
                      <input
                        type="text"
                        name="title"
                        onChange={() => onchangeHandler("title")}
                        defaultValue={newCategory?.title}
                        required
                        className="sm:w-[500px] w-full p-2 bg-gray-700 text-gray-100 border-0 outline-none rounded-md"
                      />
                    </li>
                    {/* description */}
                    <li className="flex sm:flex-row flex-col sm:gap-0 gap-4">
                      <p className="w-[200px] text-gray-100">Description : </p>
                      <textarea
                        type="text"
                        name="description"
                        maxLength={1000}
                        onChange={() => onchangeHandler("description")}
                        defaultValue={newCategory?.description}
                        required
                        className="sm:w-[500px] w-full h-[400px] p-2 bg-gray-700 text-gray-100 border-0 outline-none rounded-md resize-none"
                      />
                    </li>

                    {/* set who can see this - private or public  */}
                    <li className="flex sm:flex-row flex-col sm:gap-0 gap-4 text-gray-100">
                      <p className="w-[200px]">Who can see this : </p>
                      <div className="sm:w-[200px] w-full relative inline-block">
                        <select
                          className="w-full block appearance-none bg-gray-700 text-gray-100 border border-gray-700 hover:border-gray-500 focus:border-gray-500 px-4 py-2 pr-8 rounded-md shadow leading-tight outline-none cursor-pointer"
                          name="view_status"
                          required
                          defaultValue={newCategory?.viewStatus}
                          onChange={() => onchangeHandler("view_status")}
                        >
                          <option value="true">Public</option>
                          <option value="false">Private</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-100">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 11.293a1 1 0 011.414 0L10 12.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414zM10 4a1 1 0 011 1v7a1 1 0 11-2 0V5a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* btns  */}
                <div className="p-6 text-right flex items-center justify-end gap-4">
                  <button
                    type="button"
                    className={
                      "py-2 px-6 bg-gray-700 text-gray-200 hover:bg-gray-800 hover:text-gray-400 font-bold rounded-md duration-300"
                    }
                    onClick={cnacelBtnHandler}
                  >
                    Cancel
                  </button>
                  <button
                    className={` py-3 px-6 text-white font-bold rounded-md shadow flex items-center gap-2  ${
                      isAnyChange
                        ? " bg-[#ec4899] hover:bg-[#f989c1]"
                        : "bg-[#f989c1]/50 hover:bg-[#f989c1]/50 cursor-not-allowed"
                    }`}
                    disabled={isAnyChange ? false : true}
                  >
                    <span className="">
                      {isAnyChange ? "Update" : "Updated"}
                    </span>
                    <FaSpinner
                      className={` ${
                        isLoader ? "block" : "hidden"
                      } animate-spin`}
                    />
                  </button>

                  {/* cancel btn alert area  */}
                  <div
                    className={` ${
                      cancelPopUp ? "flex" : "hidden"
                    } w-full h-[100vh] bg-black/25 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
                  >
                    <div className="py-4 px-6 bg-gray-700 rounded-md flex flex-col items-center gap-3">
                      <p className="text-[1.1rem] text-gray-100 font-bold">
                        Are you sure?
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="py-2 px-5 bg-gray-500 text-gray-100 hover:bg-gray-600 rounded-md duration-300"
                          onClick={cancelNoBtnHandler}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          className="py-2 px-5 bg-[#ec4899] rounded-md text-gray-100 hover:bg-[#ec4899]/75 duration-300"
                          onClick={cancelYesBtnHandler}
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-9 ">
          <FaSpinner className="text-gray-300 text-[2rem] block animate-spin" />
        </div>
      )}
    </>
  );
}

export default EditCategories;
