import React, { useContext, useEffect, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Context } from "../MainContext";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const LoginForm = () => {
  // context
  const {
    loginHandler,
    userLogoObj,
    currentUser,
    allUsers,
    openToast,
    setCurrentPage,
  } = useContext(Context);

  // states
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg = { errorMsg }, setErrorMsg] = useState("");
  const [isBuffer, setIsBuffer] = useState(false);
  const [userNameAlert, setUserNameAlert] = useState(null);
  const [userNameAlertState, setUserNameAlertState] = useState(null);
  const [userNameChecker, setuserNameChecker] = useState(null);

  // navigator
  const navigator = useNavigate();

  // other code
  useEffect(() => {
    setCurrentPage("auth");
  }, []);

  // admin handle onchange
  let userNameState = 0;
  const userNameOnchange = (e) => {
    // map
    allUsers?.map((m) => {
      if (m.username == e.target.value) {
        console.log(m.username);
        userNameState = 2;
      }
    });

    // check for special char match or not
    const pattern = /^[a-zA-Z0-9_-]+$/;
    const patternState = pattern.test(e.target.value);

    if (patternState == false) {
      userNameState = 1;
    }

    // conditons
    if (e.target.value != "" && e.target.value.length <= 30) {
      if (
        e.target.value !== "adminHandle" &&
        e.target.value !== "admin-handle" &&
        e.target.value !== "user-name" &&
        e.target.value !== "userName" &&
        e.target.value !== "username"
      ) {
        if (userNameState == 0) {
          setUserNameAlert(`${e.target.value} is available!`);
          setUserNameAlertState(1);
        } else {
          if (userNameState == 2) {
            setUserNameAlert(`${e.target.value} is not available!`);
            setUserNameAlertState(0);
          } else {
            if (userNameState == 1) {
              setUserNameAlert(
                `Space and special characters(excluding - and _ ) are not allowed!`
              );
              setUserNameAlertState(0);
            } else {
              setUserNameAlert(`${e.target.value} is available!`);
              setUserNameAlertState(1);
            }
          }
        }
      } else {
        setUserNameAlert(`${e.target.value} is not available!`);
        setUserNameAlertState(0);
      }
    } else {
      setUserNameAlert(null);
    }
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const auth = getAuth();

    // is login true or false
    if (isLogin == true) {
      // login
      const email = e.target.email.value;
      const password = e.target.password.value;

      if (email != "" && password != "") {
        setIsBuffer(true);
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            loginHandler(user);
            navigator("/");
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            setErrorMsg(errorMessage);
            // ..
          })
          .finally(() => {
            setIsBuffer(false);
          });
      }
    } else {
      // create an account
      const firstName = e.target.first_name.value.split(" ").join(" ");
      const lastName = e.target.last_name.value.split(" ").join(" ");
      let userName = e.target.user_name.value.split(" ").join(" ");
      const email = e.target.email.value.split(" ").join(" ");
      const password = e.target.password.value.split(" ").join(" ");
      const confirmPassword = e.target.confirm_password.value
        .split(" ")
        .join(" ");

      // username checker
      allUsers?.map((m) => {
        if (m.username == userName) {
          console.log(m.username);
          userNameState = 2;
        }
      });

      // decalring user logo image
      let userLogoImage = "";

      // no empty field condition
      if (
        firstName != "" &&
        lastName != "" &&
        userName != "" &&
        email != "" &&
        password != "" &&
        confirmPassword != ""
      ) {
        if (userNameAlertState == 1) {
          // password and confirm password matching condition
          if (password == confirmPassword) {
            // select an image url according username's first letter
            for (let key in userLogoObj) {
              if (key == userName[0]) {
                userLogoImage = userLogoObj[key].image;
              }
            }

            setIsBuffer(true);
            // firebase create user code
            createUserWithEmailAndPassword(
              auth,
              email,
              password,
              firstName,
              lastName,
              userName
            )
              .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                loginHandler(user);
                openToast("Account Created!", 1);
                navigator("/");
                // ...
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
                setErrorMsg(errorMessage);
                openToast("Can't create your account", 0);
                // ..
              })
              .finally(() => {
                setIsBuffer(false);
              });

            //  set user details to firebase database
            const db = getDatabase();
            set(ref(db, "users/" + userName), {
              firstName: firstName,
              lastName: lastName,
              username: userName,
              email: email,
              password: password,
              userImage: userLogoImage,
            });
          } else {
            setErrorMsg("Your confirm password doesn't match with password!!!");
            openToast(
              "Your confirm password doesn't match with password!!!",
              0
            );
          }
        } else {
          openToast("Something wrong!", 0);
        }
      } else {
        setErrorMsg("Please! fill out all the fields.");
        openToast("Please! fill out all the fields.", 4);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {isLogin ? (
          <Login
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loginHandler
            isLogin={isLogin}
            errorMsg={errorMsg}
            isBuffer={isBuffer}
          ></Login>
        ) : (
          <SignUp
            userNameOnchange={userNameOnchange}
            userNameAlert={userNameAlert}
            userNameAlertState={userNameAlertState}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loginHandler={loginHandler}
            isLogin={isLogin}
            errorMsg={errorMsg}
            isBuffer={isBuffer}
          ></SignUp>
        )}
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-[#ff92c9] mt-4 hover:underline"
      >
        {isLogin ? "Create an account" : "Already have an account? Log in"}
      </button>
    </>
  );
};

// login area
const Login = ({ showPassword, setShowPassword, errorMsg, isBuffer }) => {
  return (
    // login
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[#ec4899]">Login</h2>
      {/* error msg  */}
      <p
        className={`${
          errorMsg !== "" ? "block" : "hidden"
        } text-red-500 text-center py-4`}
      >
        {errorMsg}
      </p>

      {/* email  */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-200">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="mt-1 p-2 border rounded-md w-full outline-none"
          required
        />
      </div>

      {/* password  */}
      <div className="mb-4 relative group">
        <label htmlFor="password" className="block text-gray-200">
          Password
        </label>
        <input
          type={`${showPassword ? "text" : "password"}`}
          id="password"
          name="password"
          className="mt-1 p-2 border rounded-md w-full outline-none"
          required
        />

        <button
          type="button"
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 duration-300 text-slate-500 text-[1.5rem] absolute top-[50%] right-[5%]"
          onClick={() => setShowPassword(!showPassword)}
        >
          <IoMdEyeOff
            className={`${showPassword ? "block" : "hidden"}`}
          ></IoMdEyeOff>
          <IoMdEye className={`${showPassword ? "hidden" : "block"}`}></IoMdEye>
        </button>
      </div>

      {/* submit btn */}
      <button
        type="submit"
        className="w-full mt-7 bg-[#ec4899] text-white font-medium py-2 rounded-md flex items-center justify-center gap-3"
      >
        Login{" "}
        <FaSpinner
          className={` ${isBuffer ? "block" : "hidden"} animate-spin`}
        />
      </button>
    </div>
  );
};

// sign up OR create an account
const SignUp = ({
  showPassword,
  setShowPassword,
  errorMsg,
  isBuffer,
  userNameAlert,
  userNameAlertState,
  userNameOnchange,
}) => {
  return (
    // sign up OR create an account
    <div>
      <h2 className="text-2xl font-bold py-3 mb-3 text-[#ec4899]">Sign Up</h2>

      {/* error msg  */}
      <p
        className={`${
          errorMsg !== "" ? "block" : "hidden"
        } text-red-500 text-center py-4`}
      >
        {errorMsg}
      </p>

      {/* first name and last name  */}
      <div className="flex items-center justify-between gap-3">
        {/* first name  */}
        <div className="mb-4">
          <label htmlFor="first_name" className="block text-gray-200">
            First Name
          </label>
          <input
            type="first_name"
            id="first_name"
            name="first_name"
            required
            autoCapitalize="on"
            className="mt-1 p-2 border rounded-md w-full outline-none capitalize"
          />
        </div>

        {/* last name */}
        <div className="mb-4">
          <label htmlFor="last_name" className="block text-gray-200">
            Last Name
          </label>
          <input
            type="last_name"
            id="last_name"
            name="last_name"
            required
            autoCapitalize="on"
            className="mt-1 p-2 border rounded-md w-full outline-none capitalize"
          />
        </div>
      </div>

      {/* username  */}
      <div className="mb-4">
        <div className="w-full px-2 bg-white font-normal text-gray-700 border rounded-md overflow-hidden flex items-center gap-[2px]">
          <span className="bg-white font-black text-[#ff8ac5]">@</span>

          <input
            type="user_name"
            id="user_name"
            name="user_name"
            maxLength={30}
            required
            defaultValue={"username"}
            onChange={(e) => userNameOnchange(e)}
            className="w-full py-2 bg-transparent border-none outline-none"
          />
        </div>

        {/* admin handle alert  */}
        {userNameAlert != null && (
          <p
            className={`text-[0.8rem] font-medium mt-1 px-1 ${
              userNameAlertState == 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            {userNameAlert}
          </p>
        )}
      </div>

      {/* email  */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-200">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 p-2 border rounded-md w-full outline-none"
        />
      </div>

      {/* password  */}
      <div className="mb-4 relative group">
        <label htmlFor="password" className="block text-gray-200">
          Password
        </label>
        <input
          type={`${showPassword ? "text" : "password"}`}
          id="password"
          name="password"
          required
          className="mt-1 p-2 border rounded-md w-full outline-none"
        />

        <button
          type="button"
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 duration-300 text-slate-500 text-[1.5rem] absolute top-[50%] right-[5%]"
          onClick={() => setShowPassword(!showPassword)}
        >
          <IoMdEyeOff
            className={`${showPassword ? "block" : "hidden"}`}
          ></IoMdEyeOff>
          <IoMdEye className={`${showPassword ? "hidden" : "block"}`}></IoMdEye>
        </button>
      </div>

      {/* confirm password  */}
      <div className={`mb-4 relative group`}>
        <label htmlFor="confirm_password" className="block text-gray-200">
          Confrim Password
        </label>
        <input
          type={`${showPassword ? "text" : "password"}`}
          id="confrim-password"
          name="confirm_password"
          required
          className="mt-1 p-2 border rounded-md w-full outline-none"
        />

        <button
          type="button"
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 duration-300 text-slate-500 text-[1.5rem] absolute top-[50%] right-[5%]"
          onClick={() => setShowPassword(!showPassword)}
        >
          <IoMdEyeOff
            className={`${showPassword ? "block" : "hidden"}`}
          ></IoMdEyeOff>
          <IoMdEye className={`${showPassword ? "hidden" : "block"}`}></IoMdEye>
        </button>
      </div>

      {/* sign up btn  */}
      <button
        type="submit"
        className="w-full mt-7 bg-[#ec4899] text-white font-medium py-2 rounded-md flex items-center justify-center gap-3"
      >
        Sign Up{" "}
        <FaSpinner
          className={` ${isBuffer ? "block" : "hidden"} animate-spin`}
        />
      </button>
    </div>
  );
};

// Authentication main component for login component and sign up component
const Authentication = () => {
  return (
    <div className="w-full py-9">
      <div className="max-w-md mx-auto py-6 px-8 rounded-xl bg-gray-800 border border-gray-700">
        {/* login form component */}
        <LoginForm></LoginForm>
      </div>
    </div>
  );
};

export default Authentication;
