import React, { useContext, useEffect, useState } from "react";
import { Context } from "../MainContext";
import { useNavigate } from "react-router-dom";
import { MdAddCircle, MdDelete } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { HiMiniXMark } from "react-icons/hi2";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import { FaSpinner, FaMehRollingEyes } from "react-icons/fa";

function CreateQiuzes() {
  // context
  const {
    user,
    categoryClickDetails,
    setCategoryClickDetails,
    isLoader,
    setIsLoader,
    openToast,
    htmlBody,
  } = useContext(Context);

  // navigator
  const navigator = useNavigate();

  // states
  const [quizes, setQuizes] = useState([]);
  const [isQuizesSaved, setIsQuizesSaved] = useState(true);
  const [error, setError] = useState(false);
  const [isQuizeCardSaved, setIsQuizeCardSaved] = useState(false);
  const [deleteAlertState, setDeleteAlertState] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // other code
  const addQuizCardHandler = () => {
    let quizesId = uuidv4();
    setQuizes([...quizes, { quizesId: quizesId }]);
  };

  // get quiz card from the firebase database
  useEffect(() => {
    setIsLoader(false);
    let lsCateItems = localStorage.getItem("cateItems");
    setCategoryClickDetails(JSON.parse(lsCateItems));

    if (lsCateItems) {
      const db = getDatabase();
      const starCountRef = ref(
        db,
        "quiz-cards/" + JSON.parse(lsCateItems).cateId
      );
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setQuizes(...quizes, data);
          setIsLoader(true);
        } else {
          setIsLoader(true);
        }
      });
    }
  }, []);

  // non user redirection
  useEffect(() => {
    setIsLoader(false);
    let lsUser = localStorage.getItem("user");

    if (!lsUser) {
      navigator("/auth");
    }
  }, [user]);

  // save the quiz
  const submitHandler = (e) => {
    e.preventDefault();
    let QuizesObjArr = [];

    if (quizes.length > 1) {
      for (let i = 0; i < quizes.length; i++) {
        if (
          e.target.question[i].value != "" &&
          e.target.option_A[i].value != "" &&
          e.target.option_B[i].value != "" &&
          e.target.option_C[i].value != "" &&
          e.target.option_D[i].value != "" &&
          e.target.select_option[i].value != ""
        ) {
          QuizesObjArr.push({
            quizesId: quizes[i].quizesId,
            question: e.target.question[i].value,
            option_A: e.target.option_A[i].value,
            option_B: e.target.option_B[i].value,
            option_C: e.target.option_C[i].value,
            option_D: e.target.option_D[i].value,
            correct_Option: e.target.select_option[i].value,
          });
        } else {
          setError("Please! fill all the fields");
        }
      }
    } else {
      if (
        e.target.question.value != "" &&
        e.target.option_A.value != "" &&
        e.target.option_B.value != "" &&
        e.target.option_C.value != "" &&
        e.target.option_D.value != "" &&
        e.target.select_option.value != ""
      ) {
        QuizesObjArr.push({
          quizesId: quizes[0].quizesId,
          question: e.target.question.value,
          option_A: e.target.option_A.value,
          option_B: e.target.option_B.value,
          option_C: e.target.option_C.value,
          option_D: e.target.option_D.value,
          correct_Option: e.target.select_option.value,
        });
      } else {
        setError("Please! fill all the fields");
      }
    }

    if (QuizesObjArr.length > 0) {
      setIsQuizeCardSaved(true);
      const db = getDatabase();
      let status = set(
        ref(db, "quiz-cards/" + categoryClickDetails.cateId),
        QuizesObjArr
      );
      localStorage.setItem("quizCardId", categoryClickDetails.cateId);

      status
        .then(() => {
          setIsQuizesSaved(true);
          openToast(`Quizes saved for ${categoryClickDetails.cateId}`, 1);
        })
        .catch((err) => {
          console.log(err);
          openToast(`Can't save quizes for ${categoryClickDetails.cateId}`, 0);
        })
        .finally(() => {
          setIsQuizeCardSaved(false);
        });
    }
  };

  // delete quiz handler
  const deleteQuizHandler = (index, quizID) => {
    const db = getDatabase(); // Get a reference to the database

    // do, if index is not empty
    if (index != "") {
      setIsDeleting(true);
      const path = "quiz-cards/" + categoryClickDetails.cateId + "/" + index;
      remove(ref(db, path))
        .then((success) => {
          openToast(`${quizID} is deleted`, 1);
        })
        .catch((error) => {
          openToast(`Can't delete ${quizID}`, 0);
        })
        .finally(() => {
          htmlBody.style.overflow = "";
          setIsDeleting(false);
          setDeleteAlertState(false);
        });
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

  return (
    <>
      <div className="max-w-[1200px] mx-auto">
        <div
          className={`${
            error == false ? "top-[10%] right-[-100%]" : "top-[10%] right-[2%]"
          } duration-200 ease-in-out py-3 px-9 bg-gray-400 text-white rounded-lg shadow-lg fixed z-[99999]`}
        >
          {error}
          <HiMiniXMark
            className="text-gray-100 text-[1.1rem] absolute top-[20%] right-[3%] cursor-pointer"
            onClick={() => setError(false)}
          ></HiMiniXMark>
        </div>

        {/* heading  */}
        <h1 className="w-[95%] mx-auto bg-gray-800 text-gray-100 font-black p-5 rounded-md sm:text-[2rem] text-[1.5rem]">
          Create Quizes{" "}
        </h1>

        {/* title and category  */}
        <div className="w-[95%] mx-auto flex items-center flex-col gap-3 my-7 ">
          <p className="text-[1rem] text-gray-100 font-medium">
            Title : {categoryClickDetails?.cateTitle}
          </p>
          <div className="bg-gray-700 text-[1rem] text-gray-100 font-medium rounded-lg py-1 px-7">
            {categoryClickDetails?.cateCategory}
          </div>
        </div>

        <div className="w-full">
          <button
            className="w-[95%] mx-auto py-9 px-5 text-[3rem] bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-500 rounded-3xl flex items-center justify-center duration-200 "
            onClick={addQuizCardHandler}
          >
            <MdAddCircle></MdAddCircle>
          </button>

          <div className="sm:w-[95%] w-full mx-auto py-6 px-5 mt-4 mb-9 rounded">
            <form
              onSubmit={(e) => submitHandler(e)}
              onChange={() => setIsQuizesSaved(false)}
              className="flex items-center flex-col"
            >
              {isLoader ? (
                <div className="items-center justify-center py-9 order-[2] flex">
                  <FaSpinner className="text-gray-300 text-[2rem] block animate-spin" />
                </div>
              ) : quizes.length == 0 ? (
                <p className="flex items-center gap-2 text-[1.2rem] text-gray-400 font-medium">
                  Nothing to show{" "}
                  <FaMehRollingEyes fontSize={"1.5rem"}></FaMehRollingEyes>{" "}
                </p>
              ) : (
                <>
                  {quizes?.map((q, index) => {
                    return (
                      <QuizCard
                        key={q.quizesId}
                        quizID={q.quizesId}
                        index={index}
                        quizes={quizes}
                        q={q}
                        deleteQuizHandler={deleteQuizHandler}
                        cancelDeleteHandler={cancelDeleteHandler}
                        deleteAlertHandler={deleteAlertHandler}
                        deleteAlertState={deleteAlertState}
                        setDeleteAlertState={setDeleteAlertState}
                        isDeleting={isDeleting}
                      ></QuizCard>
                    );
                  })}
                  <div className="w-full p-6 mb-9 flex itemsicenter justify-end gap-3">
                    <button
                      type="button"
                      className={
                        "py-2 px-6 bg-gray-700 text-gray-200 hover:bg-gray-800 hover:text-gray-400 font-bold rounded-md duration-300"
                      }
                      onClick={() => navigator("/admin")}
                    >
                      Cancel
                    </button>

                    <button
                      className={`py-2 px-6 text-white font-bold rounded-md shadow flex items-center gap-2 ${
                        isQuizesSaved
                          ? "bg-[#f989c1]/50 hover:bg-[#f989c1]/50 cursor-not-allowed"
                          : "bg-[#ec4899] hover:bg-[#fc6fb5]"
                      }`}
                      disabled={isQuizesSaved ? true : false}
                    >
                      Save
                      {isQuizeCardSaved && (
                        <FaSpinner className="text-gray-300 text-[1rem] animate-spin" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateQiuzes;

// Quiz card
function QuizCard({
  index,
  quizes,
  q,
  quizID,
  deleteQuizHandler,
  cancelDeleteHandler,
  deleteAlertHandler,
  deleteAlertState,
  isDeleting,
}) {
  return (
    <>
      <div
        className={` w-full pb-9 bg-gray-900 rounded-md mb-8 overflow-hidden`}
        style={{
          order: quizes.length - index,
        }}
        name="Quiz_Card_div"
        id={quizID}
      >
        <div className="py-5 px-5 mb-9 text-[2rem] font-black text-gray-100 bg-gray-800 text-center relative flex items-center justify-between">
          <span>Q.{index + 1}</span>
          <button
            type="button"
            className="hover:text-gray-300 duration-300"
            onClick={deleteAlertHandler}
          >
            <MdDelete></MdDelete>
          </button>
        </div>
        {/* ul  */}
        <ul className="w-full mx-auto px-5 mt-4 flex flex-col gap-4 text-gray-100">
          <li className="flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <p className="w-[200px] font-medium">Question : </p>
            <input
              type="text"
              name="question"
              defaultValue={q.question}
              className="w-full bg-gray-800 border border-gray-700 hover:border-gray-500 focus:border-gray-500 outline-none p-2 rounded-md shadow focus:shadow-none"
            />
          </li>
          <li className=" flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <p className="w-[200px] font-medium">Option A : </p>
            <input
              type="text"
              name="option_A"
              defaultValue={q.option_A}
              className="w-full bg-gray-800 border border-gray-700 hover:border-gray-500 focus:border-gray-500 outline-none p-2 rounded-md shadow focus:shadow-none"
            />
          </li>
          <li className=" flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <p className="w-[200px] font-medium">Option B : </p>
            <input
              type="text"
              name="option_B"
              defaultValue={q.option_B}
              className="w-full bg-gray-800 border border-gray-700 hover:border-gray-500 focus:border-gray-500 outline-none p-2 rounded-md shadow focus:shadow-none"
            />
          </li>
          <li className=" flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <p className="w-[200px] font-medium">Option C : </p>
            <input
              type="text"
              name="option_C"
              defaultValue={q.option_C}
              className="w-full bg-gray-800 border border-gray-700 hover:border-gray-500 focus:border-gray-500 outline-none p-2 rounded-md shadow focus:shadow-none"
            />
          </li>
          <li className=" flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <p className="w-[200px] font-medium">Option D : </p>
            <input
              type="text"
              name="option_D"
              defaultValue={q.option_D}
              className="w-full bg-gray-800 border border-gray-700 hover:border-gray-500 focus:border-gray-500 outline-none p-2 rounded-md shadow focus:shadow-none"
            />
          </li>
          <li className="flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <p className="w-[200px] font-medium">Correct Option : </p>
            <div className="w-full relative inline-block">
              <select
                className="w-full block appearance-none bg-gray-800 text-gray-100 border border-gray-700 hover:border-gray-500 focus:border-gray-500 px-4 py-2 pr-8 rounded-md shadow leading-tight outline-none cursor-pointer"
                name="select_option"
                defaultValue={q.correct_Option}
              >
                <option defaultValue="">--- Select a Correct Option ---</option>
                <option defaultValue="Option A">Option A</option>
                <option defaultValue="Option B">Option B</option>
                <option defaultValue="Option C">Option C</option>
                <option defaultValue="Option D">Option D</option>
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

      {/* delete alert area */}
      <div
        className={` ${
          deleteAlertState ? "flex" : "hidden"
        } w-full h-[100vh] bg-black/25 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
      >
        <div className="py-4 px-6 bg-gray-700 rounded-md flex flex-col items-center gap-3">
          <p className="text-[1.1rem] text-gray-100 font-bold">Are you sure?</p>
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
              onClick={() => deleteQuizHandler(index, quizID)}
            >
              Delete
              {isDeleting && <FaSpinner className="block animate-spin" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
