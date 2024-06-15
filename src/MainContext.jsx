import React, { createContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzcbQV9ls8mE4fQPbDuLnaMokQ-3caScg",
  authDomain: "quiz-game-ece43.firebaseapp.com",
  projectId: "quiz-game-ece43",
  storageBucket: "quiz-game-ece43.appspot.com",
  messagingSenderId: "242204011577",
  appId: "1:242204011577:web:cfbfb224b7700ef74a71e8",
  measurementId: "G-DBD5CVG720",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const Context = createContext();

function MainContext(props) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [category, setCategory] = useState(false);
  const [adminCategory, setAdminCategory] = useState(null);
  const [categoryClickDetails, setCategoryClickDetails] = useState();
  const [isLoader, setIsLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataKeys, setDataKeys] = useState(null);
  const [holdUserPlayData, setHoldUserPlayData] = useState([]);
  const [holdUserPlayDataKeys, setHoldUserPlayDataKeys] = useState([]);

  // open toast
  const openToast = (msg, status) => {
    toast(msg, {
      type:
        status == 1
          ? "success"
          : status == 2
          ? "info"
          : status == 3
          ? "default"
          : status == 4
          ? "warning"
          : "error",
      autoClose: 2000,
      position: "bottom-right",
    });
  };

  useEffect(() => {
    let lsCurPage = localStorage.getItem("currentPage");
    if (lsCurPage) {
      setCurrentPage(lsCurPage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const htmlBody = document.querySelector("body");

  const userLogoObj = {
    a: {
      image: "https://cdn-icons-png.flaticon.com/128/3595/3595030.png",
    },
    b: {
      image: "https://cdn-icons-png.flaticon.com/128/9037/9037226.png",
    },
    c: {
      image: "https://cdn-icons-png.flaticon.com/128/3600/3600912.png",
    },
    d: {
      image: "https://cdn-icons-png.flaticon.com/128/9037/9037228.png",
    },
    e: {
      image: "https://cdn-icons-png.flaticon.com/128/3665/3665930.png",
    },
    f: {
      image: "https://cdn-icons-png.flaticon.com/128/3665/3665934.png",
    },
    g: {
      image: "https://cdn-icons-png.flaticon.com/128/3665/3665939.png",
    },
    h: {
      image: "https://cdn-icons-png.flaticon.com/128/3665/3665946.png",
    },
    i: {
      image: "https://cdn-icons-png.flaticon.com/128/9605/9605279.png",
    },
    j: {
      image: "https://cdn-icons-png.flaticon.com/128/9605/9605279.png",
    },
    k: {
      image: "https://cdn-icons-png.flaticon.com/128/8142/8142734.png",
    },
    l: {
      image: "https://cdn-icons-png.flaticon.com/128/8142/8142742.png",
    },
    m: {
      image: "https://cdn-icons-png.flaticon.com/128/8142/8142749.png",
    },
    n: {
      image: "https://cdn-icons-png.flaticon.com/128/8142/8142756.png",
    },
    o: {
      image: "https://cdn-icons-png.flaticon.com/128/9605/9605285.png",
    },
    p: {
      image: "https://cdn-icons-png.flaticon.com/128/9326/9326518.png",
    },
    q: {
      image: "https://cdn-icons-png.flaticon.com/128/3666/3666003.png",
    },
    r: {
      image: "https://cdn-icons-png.flaticon.com/128/9326/9326518.png",
    },
    s: {
      image: "https://cdn-icons-png.flaticon.com/128/9972/9972701.png",
    },
    t: {
      image: "https://cdn-icons-png.flaticon.com/128/9871/9871813.png",
    },
    u: {
      image: "https://cdn-icons-png.flaticon.com/128/5379/5379477.png",
    },
    v: {
      image: "https://cdn-icons-png.flaticon.com/128/3600/3600967.png",
    },
    w: {
      image: "https://cdn-icons-png.flaticon.com/128/9326/9326534.png",
    },
    x: {
      image: "https://cdn-icons-png.flaticon.com/128/190/190406.png",
    },
    y: {
      image: "https://cdn-icons-png.flaticon.com/128/3666/3666007.png",
    },
    z: {
      image: "https://cdn-icons-png.flaticon.com/128/3097/3097134.png",
    },
  };

  // get user data from localStorage in first render
  useEffect(() => {
    let lsUser = localStorage.getItem("user");
    if (lsUser) {
      setUser(JSON.parse(lsUser));
    }
  }, []);

  // login handler
  const loginHandler = (user_data) => {
    setUser(user_data);
    localStorage.setItem("user", JSON.stringify(user_data));
  };

  // logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("quizNum");
    localStorage.removeItem("selectedOptions");
    htmlBody.style.overflow = "";
    localStorage.clear("admin");
  };

  // get admin data from localStorage in first render
  useEffect(() => {
    let lsAdmin = localStorage.getItem("admin");
    if (lsAdmin) {
      setAdmin(JSON.parse(lsAdmin));
    }
  }, [currentUser]);

  // get categories from firebase database
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "categories/");
    setCategory(false);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        let dataArr = [];
        for (let key in data) {
          if (data[key]?.viewStatus == true) {
            dataArr.push({
              ...data[key],
              id: key,
            });
          }
        }
        if (dataArr != "") {
          setCategory(dataArr);
        } else {
          setCategory(null);
        }

        //
        const filteredCategories = [];
        for (let key in data) {
          if (data[key]?.adminHandle == admin?.adminHandle) {
            filteredCategories.push(data[key]);
          }
        }

        setAdminCategory(filteredCategories);
      } else {
        setCategory(null);
      }
    });
  }, [user, currentPage]);

  // get quizes from firebase database
  useEffect(() => {
    const db = getDatabase();
    let lsCateItems = localStorage.getItem("cateItems");
    setCategoryClickDetails(JSON.parse(lsCateItems));

    if (lsCateItems) {
      const starCountRef = ref(
        db,
        "quiz-cards/" + JSON.parse(lsCateItems).cateId
      );
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();

        const dataArr = [];

        for (let key in data) {
          dataArr.push({
            ...data[key],
            qId: data[key].quizesId,
          });
        }
        setQuiz(dataArr);
      });
    }

    const starCountRef = ref(db, "quiz-cards/");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      const dataKeyArr = [];

      for (let key in data) {
        dataKeyArr.push(key);
      }

      setDataKeys(dataKeyArr);
    });
  }, []);

  // onclick category handler
  const categoryClickDetailsHandler = (cateDetails) => {
    setCategoryClickDetails(cateDetails);
  };

  // remove user profile pic
  const removeProfilePicHandler = () => {
    let userLogoImage = "";

    for (let key in userLogoObj) {
      if (key == currentUser?.username[0]) {
        userLogoImage = userLogoObj[key].image;
      }
    }
    const db = getDatabase();
    const updates = {};
    updates["/users/" + currentUser?.userKey + "/" + "userImage"] =
      userLogoImage;

    return update(ref(db), updates);
  };

  // update the user profile pic
  const updateUser = () => {
    const db = getDatabase();
    const newProfilePic = `https://firebasestorage.googleapis.com/v0/b/quiz-game-ece43.appspot.com/o/profileImages%2F${currentUser?.userKey}.png?alt=media&token=e3599b11-2062-4bf1-9962-58e2e0d9f3d5`;

    const updates = {};
    updates["/users/" + currentUser?.userKey + "/" + "userImage"] =
      newProfilePic;

    return update(ref(db), updates);
  };

  // get quizes from firebase database
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "users/");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      let userData = {};
      let allUserDataArr = [];

      if (data) {
        for (let key in data) {
          allUserDataArr.push(data[key]);
          if (data[key]?.email == user?.email) {
            userData = {
              ...data[key],
              userKey: key,
            };
          }
        }
      }

      setAllUsers(allUserDataArr);
      setCurrentUser(userData);
    });
  }, [user, isLoader]);

  // get user play data from firebase
  useEffect(() => {
    setIsLoader(true);
    // firebase database
    const db = getDatabase();
    const starCountRef = ref(db, "usersPlayData/");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();

      // if data exist
      if (data) {
        let dataObjArr = [];
        let playDataKey = [];

        // get key of data
        for (let playData in data) {
          // map the user play data
          data[playData].map((dataObj) => {
            // if the username matched with the current user's username, then push the dataObj to the dataObjArr
            if (dataObj.userDetails.username == currentUser?.username) {
              dataObjArr.push(dataObj);
              playDataKey.push(playData);
            }
          });
        }

        // set the dataObjArr to the holdUserPlayData
        setHoldUserPlayData(dataObjArr);
        setHoldUserPlayDataKeys(playDataKey);
        setIsLoader(false);
      }
    });
  }, [currentUser]);

  return (
    <Context.Provider
      value={{
        ToastContainer,
        openToast,
        getDatabase,
        ref,
        update,
        htmlBody,
        user,
        admin,
        setAdmin,
        adminCategory,
        setAdminCategory,
        allUsers,
        currentUser,
        loginHandler,
        setUser,
        logout,
        quiz,
        category,
        setCategory,
        categoryClickDetailsHandler,
        categoryClickDetails,
        setCategoryClickDetails,
        isLoader,
        setIsLoader,
        userLogoObj,
        currentPage,
        setCurrentPage,
        updateUser,
        removeProfilePicHandler,
        dataKeys,
        holdUserPlayData,
        setHoldUserPlayData,
        holdUserPlayDataKeys,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export default MainContext;
export { Context };
