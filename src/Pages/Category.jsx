import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiImageAddFill } from "react-icons/ri";
import { Context } from "../MainContext";
import { v4 as uuidv4 } from "uuid";
import { FaSpinner } from "react-icons/fa";
import { HiMiniXMark } from "react-icons/hi2";
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as storRef, uploadBytes } from "firebase/storage";

function Category() {
  // context
  const {
    user,
    currentUser,
    admin,
    isLoader,
    setIsLoader,
    htmlBody,
    openToast,
  } = useContext(Context);

  // navigator
  const navigator = useNavigate();

  // states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmited, setIsSubmited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageBlob, setSelectedImageBlob] = useState(null);
  const [isAnyChange, setIsAnyChange] = useState(false);
  const [cancelPopUp, setCancelPopUp] = useState(false);

  useEffect(() => {
    setIsLoader(false);
    let lsAdmin = localStorage.getItem("admin");
    if (!lsAdmin) {
      navigator("/admin");
    }
  }, [user]);

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

  const handleCategoryChange = (event) => {
    setIsAnyChange(true);
    setSelectedCategory(event.target.value);
  };

  // get image handler
  const getImageHandler = (e) => {
    setIsAnyChange(true);
    const file = e.target.files[0];
    const blob = new Blob([file], {
      type: "image/*",
    });
    setSelectedImageBlob(blob);
    const imageNewURL = URL.createObjectURL(blob);
    setSelectedImage(imageNewURL);
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

  // submit btn
  const submitHandler = (e) => {
    e.preventDefault();

    // category id
    const cateID = uuidv4();

    let bannerImage = null;
    // banner image
    if (selectedImage) {
      bannerImage = `https://firebasestorage.googleapis.com/v0/b/quiz-game-ece43.appspot.com/o/categoryBanner%2F${cateID}.png?alt=media&token=e3599b11-2062-4bf1-9962-58e2e0d9f3d5`;
    }

    // image file
    let imageFile = bannerImage ? bannerImage : e.target.image_url.value;

    // object for category data
    const categoryObj = {
      image: imageFile,
      category: e.target.select_category.value,
      title: e.target.title.value,
      description: e.target.description.value,
      userName: currentUser?.username,
      adminHandle: admin?.adminHandle,
      categoryKey: cateID,
      viewStatus: Boolean(e.target.view_status.value),
    };

    // condition
    if (
      categoryObj.category != "" &&
      categoryObj.title != "" &&
      categoryObj.description != ""
    ) {
      setIsLoader(true);
      setIsSubmited(false);
      const db = getDatabase();
      let status = set(ref(db, "categories/" + cateID), categoryObj);
      status
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          // upload banner to firebase
          const storage = getStorage();
          const storageRef = storRef(storage, `categoryBanner/${cateID}.png`);

          // metadata
          const metadata = {
            contentType: "image/png",
          };

          // Upload the image file and metadata
          const uploadTask = uploadBytes(
            storageRef,
            selectedImageBlob,
            metadata
          );
          uploadTask
            .then((snapshot) => {
              // setShowCategoryBannerUploader(false);
              openToast("Banner Uploaded", 1);
            })
            .catch((error) => {
              openToast("Can't uplaod banner", 0);
              console.log(error);
            })
            .finally(() => {
              setIsLoader(false);
              setIsSubmited(true);
            });
        });
    }
  };

  return (
    <div>
      <h1 className="w-[95%] mx-auto bg-gray-800 text-gray-100 p-5 rounded-md font-black sm:text-[2rem] text-[1.5rem]">
        Create Category
      </h1>

      {/* category details  */}
      <div className="w-full">
        <div className="w-[95%] mx-auto py-6 px-5 rounded">
          <form onSubmit={(e) => submitHandler(e)}>
            {/* upload image from pc  */}
            <label htmlFor="upload-image" title="Upload Image">
              <div className="w-full h-[400px] mx-auto bg-gray-600 text-gray-300 rounded-md flex items-center justify-center cursor-pointer overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="404"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <RiImageAddFill
                    fontSize={"5rem"}
                    title="Add image"
                  ></RiImageAddFill>
                )}
              </div>
            </label>

            {/* input:file  */}
            <input
              type="file"
              accept=".jpg, .png, .jpeg, .webp"
              id="upload-image"
              className="hidden"
              name="image_file"
              onChange={(e) => getImageHandler(e)}
            />

            {/* banner URL  */}
            <div className="w-full max-w-[300px] mx-auto my-6 flex flex-col justify-center items-center gap-3">
              <span className="text-[1.2rem] text-gray-100 font-bold">Or</span>
              <input
                type="url"
                placeholder="Image URL"
                name="image_url"
                className="w-full bg-gray-700 text-gray-100 border-0 outline-none p-2 rounded-md "
              />
            </div>

            {/* category details  */}
            <div className="py-5">
              {/* ul  */}
              <ul className="flex flex-col gap-4">
                {/* lis  */}
                {/* category selection  */}
                <li className="flex sm:flex-row flex-col sm:gap-0 gap-4 text-gray-100">
                  <p className="w-[200px]">Category : </p>
                  <div className="sm:w-[500px] w-full relative inline-block">
                    <select
                      className="w-full block appearance-none bg-gray-700 text-gray-100 border border-gray-700 hover:border-gray-500 focus:border-gray-500 px-4 py-2 pr-8 rounded-md shadow leading-tight outline-none cursor-pointer"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      name="select_category"
                      required
                    >
                      <option value="">-- Select a category --</option>
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
                    required
                    onChange={() => setIsAnyChange(true)}
                    className="sm:w-[500px] w-full p-2 bg-gray-700 text-gray-100 border-0 outline-none rounded-md"
                  />
                </li>

                {/* description  */}
                <li className="flex sm:flex-row flex-col sm:gap-0 gap-4">
                  <p className="w-[200px] text-gray-100">Description : </p>
                  <textarea
                    type="text"
                    name="description"
                    required
                    onChange={() => setIsAnyChange(true)}
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
                      onChange={() => setIsAnyChange(true)}
                    >
                      <option value={true}>Public</option>
                      <option value={false}>Private</option>
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

            <div className="p-6 text-right flex items-center justify-end gap-4">
              <div
                className={`${
                  isSubmited ? "flex" : "hidden"
                } py-3 px-9 bg-slate-100 rounded-md shadow-lg items-center flex-col gap-1 relative`}
              >
                <HiMiniXMark
                  className="text-[1.1rem] absolute top-0 right-0 m-2 text-slate-500 cursor-pointer"
                  onClick={() => setIsSubmited(false)}
                ></HiMiniXMark>
                <p>Category Created </p>
                <p className="text-[0.9rem] text-blue-500 cursor-pointer">
                  <Link to={"/admin"} onClick={() => setIsSubmited(false)}>
                    Click to View
                  </Link>
                </p>
              </div>
              {/* btns */}
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
                <span className="">Create</span>
                <FaSpinner
                  className={` ${isLoader ? "block" : "hidden"} animate-spin`}
                />
              </button>

              {/* cancel btn alert area  */}
              <div
                className={` ${
                  cancelPopUp ? "flex" : "hidden"
                } w-full h-[100vh] bg-black/75 fixed top-0 left-0 z-[99999] items-center justify-center`}
              >
                <div className="py-4 px-6 bg-white rounded-md flex flex-col items-center gap-3">
                  <p className="text-[1.1rem] text-gray-800">Are you sure?</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="py-2 px-5 bg-gray-100 rounded-md hover:bg-gray-200 "
                      onClick={cancelNoBtnHandler}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="py-2 px-5 bg-[#ec4899] rounded-md text-gray-100 hover:bg-[#ec4899]/75 "
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
  );
}

export default Category;
