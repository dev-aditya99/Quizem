import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../MainContext";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { FaGlassMartini, FaMehRollingEyes, FaSpinner } from "react-icons/fa";

function PlayQuiz() {
  // context
  const {
    openToast,
    htmlBody,
    currentUser,
    user,
    setCategoryClickDetails,
    categoryClickDetails,
    setIsLoader,
    setCurrentPage,
  } = useContext(Context);

  // navigator
  const navigator = useNavigate();

  // states
  const [selectedOption, setSelectedOption] = useState([]);
  const [quizes, setQuizes] = useState([]);
  const [quizNum, setQuizNum] = useState(0);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [cancelPopUp, setCancelPopUp] = useState(false);

  const [totalMarks, setTotalMarks] = useState(0);
  const [correctQuizes, setCorrectQuizes] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [showAnsDesc, setShowAnsDesc] = useState(false);

  // set current page
  useEffect(() => {
    setCurrentPage("quizes");
  }, []);

  // get data from localStorage and set to the an state
  useEffect(() => {
    const lsQuizNum = localStorage.getItem("quizNum");
    const lsSelectedOptions = localStorage.getItem("selectedOptions");

    if (lsSelectedOptions) {
      setSelectedOption(JSON.parse(lsSelectedOptions));
    }

    if (lsQuizNum) {
      setQuizNum(parseInt(lsQuizNum));
    }
  }, []);

  // quiz view handler
  const quizViewHandler = (status) => {
    if (status) {
      if (quizNum < quizes.length - 1) setQuizNum(quizNum + 1);
    } else {
      if (quizNum > 0) setQuizNum(quizNum - 1);
    }
  };

  // get data from firebase and set it to the quizes
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

        // set data if exist
        if (data) {
          setQuizes(data);
          setIsLoader(true);
        } else {
          setIsLoader(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (selectedOption.length != 0) {
      localStorage.setItem("selectedOptions", JSON.stringify(selectedOption));
    }
  }, [selectedOption]);

  useEffect(() => {
    if (quizNum) {
      localStorage.setItem("quizNum", quizNum);
    }
  }, [quizNum]);

  useEffect(() => {
    let lsUser = localStorage.getItem("user");
    if (lsUser == null) {
      navigator("/auth");
    }
  }, [user]);

  // handle option change
  const handleOptionChange = (option, e) => {
    const options = [...selectedOption];

    const item = options.find((ans) => ans.qId == quizes[quizNum]?.quizesId);
    if (item) {
      item.userAnswer = option;
      setSelectedOption(options);
    } else {
      setSelectedOption([
        ...selectedOption,
        {
          qId: quizes[quizNum]?.quizesId,
          userAnswer: option,
          correctAnswer: quizes[quizNum]?.correct_Option,
        },
      ]);
    }
    e.target.checked = false;
    setIsChanged(true);
  };

  // cancel btn handler
  const cnacelBtnHandler = () => {
    if (isChanged) {
      setCancelPopUp(true);
      htmlBody.style.overflow = "hidden";
    } else {
      htmlBody.style.overflow = "";
      localStorage.removeItem("quizNum");
      localStorage.removeItem("selectedOptions");
      navigator("/quizes");
    }
  };

  // cancel yes btn
  const cancelYesBtnHandler = () => {
    setIsChanged(false);
    localStorage.removeItem("quizNum");
    localStorage.removeItem("selectedOptions");
    navigator("/quizes");
    htmlBody.style.overflow = "";
    userPlayDataHandler();
  };

  const cancelNoBtnHandler = () => {
    setCancelPopUp(false);
    htmlBody.style.overflow = "";
  };

  // marks handler
  const marksHandler = () => {
    let marks = 0;
    const cQuizesArr = [];
    for (let i = 0; i < quizes.length; i++) {
      if (
        selectedOption[i]?.userAnswer == selectedOption[i]?.correctAnswer &&
        selectedOption[i]?.userAnswer != undefined
      ) {
        marks = marks + 1;
        cQuizesArr.push(selectedOption[i]?.userAnswer);
      } else if (selectedOption[i]?.userAnswer == undefined) {
        marks = marks + 0;
      } else {
        marks = marks - 0.25;
      }
    }

    setCorrectQuizes(cQuizesArr);
    setTotalMarks(marks);
  };

  // quiz submit handler
  const quizSubmitHandler = () => {
    setIsSubmit(true);
    marksHandler();
    htmlBody.style.overflow = "hidden";
  };

  // set percentage
  useEffect(() => {
    let perc = (totalMarks / quizes.length) * 100;
    setPercentage(perc);
  }, [quizSubmitHandler]);

  // view answer handler
  const viewAnsHandler = () => {
    htmlBody.style.overflow = "";
    setShowAnsDesc(true);
    setIsSubmit(false);
    setIsChanged(false);
    userPlayDataHandler();
  };

  // user play data handler
  const userPlayDataHandler = async () => {
    // checking the correct quizes is available or not
    if (correctQuizes) {
      // variables
      let userDataMatched = false;
      let userPlayData = {};
      let currentTime = new Date().getTime();
      const newUserPlayData = [];

      // set user play data
      userPlayData = {
        categoryDetails: categoryClickDetails,
        userDetails: currentUser,
        totalQuizes: quizes.length,
        attemptedQuizes: selectedOption.length,
        correctAnswers: correctQuizes.length,
        wrongAnswers: selectedOption.length - correctQuizes.length,
        totalMarks,
        percentage: percentage.toFixed(2),
        time: currentTime,
        userPlayDataId: currentUser.userKey + "_" + categoryClickDetails.cateId,
      };

      // fire base database
      const db = getDatabase();

      // get user play data from the firebase
      const starCountRef = ref(
        db,
        "usersPlayData/" +
          currentUser.userKey +
          "_" +
          categoryClickDetails.cateId
      );

      await onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        // set data to userDataMatched, if the data exist

        if (data) {
          userDataMatched = data;
        }
      });

      // check the userDataMatched is available or not and push in newUserPlayData according them
      if (userDataMatched) {
        newUserPlayData.push(...userDataMatched, userPlayData);
        console.log(userDataMatched);
      } else {
        newUserPlayData.push(userPlayData);
      }

      // check if newUserPlayData is empty or not
      if (newUserPlayData != "") {
        set(
          ref(
            db,
            "usersPlayData/" +
              currentUser.userKey +
              "_" +
              categoryClickDetails.cateId
          ),
          newUserPlayData
        )
          .then(() => {
            openToast("User Analytics Updated!", 1);
          })
          .catch((error) => {
            openToast("Unable to update user analytics!", 0);
          });
      }
    }
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto">
        <h1 className="bg-gray-800 text-gray-100 text-[2rem] font-black p-5 rounded-md">
          PlayQuiz
        </h1>

        {quizes == "" ? (
          <div className="my-9 flex items-center justify-center flex-col">
            <p className="flex items-center gap-2 text-[1.2rem] text-gray-400 font-medium">
              Nothing to show{" "}
              <FaGlassMartini fontSize={"1.5rem"}></FaGlassMartini>
            </p>
          </div>
        ) : (
          <div className="w-full px-5 py-4">
            <div className="w-full mx-auto">
              <div className="container mx-auto py-10 flex items-center flex-col relative">
                <div className=" bg-gray-600 py-2 px-5 rounded-md text-gray-100 text-xl font-bold mb-4">
                  Questions : {quizes.length} / Q : {quizNum + 1}
                </div>
                <QuizCard
                  userOptions={selectedOption.find((ans) => {
                    if (ans?.qId == quizes[quizNum]?.quizesId) {
                      return true;
                    } else {
                      return false;
                    }
                  })}
                  showAnsDesc={showAnsDesc}
                  quizes={quizes}
                  quizNum={quizNum}
                  handleOptionChange={handleOptionChange}
                  selectedOption={selectedOption}
                ></QuizCard>
                {/* left right btns  */}
                <div className="w-full max-w-[700px] flex justify-between gap-3 mt-2 mb-5 sm:absolute top-[45%]">
                  <button
                    className={` text-white text-[1.2rem] py-2 px-4 rounded-full enabled:active:animate-[bounce_1s_ease-in-out] disabled:cursor-not-allowed ${
                      quizNum == 0
                        ? "bg-gray-800"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    disabled={quizNum == 0 ? true : false}
                    onClick={() => quizViewHandler(false)}
                  >
                    <GrFormPrevious></GrFormPrevious>
                  </button>

                  <button
                    className={` text-white text-[1.2rem] py-2 px-4 rounded-full enabled:active:animate-[bounce_1s_ease-in-out] disabled:cursor-not-allowed ${
                      quizes?.length - 1 > quizNum
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-800"
                    }`}
                    disabled={quizes?.length - 1 > quizNum ? false : true}
                    onClick={() => quizViewHandler(true)}
                  >
                    <GrFormNext></GrFormNext>
                  </button>
                </div>
                {/* btns  */}
                <div className="flex items-center gap-3">
                  <button
                    className={
                      "py-2 px-6 bg-gray-700 text-gray-200 hover:bg-gray-800 hover:text-gray-400 font-bold rounded-md duration-300"
                    }
                    onClick={cnacelBtnHandler}
                  >
                    Cancel
                  </button>
                  <button
                    className={`text-white py-2 px-4 rounded font-medium duration-300 ${
                      isChanged
                        ? "bg-[#ec4899] hover:bg-[#ec4899]/75 cursor-pointer"
                        : "bg-[#ec4899]/25 cursor-not-allowed"
                    }`}
                    onClick={quizSubmitHandler}
                    disabled={isChanged ? false : true}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* cancel btns  */}
      <div
        className={` ${
          cancelPopUp ? "flex" : "hidden"
        } w-full h-[100vh] bg-black/50 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
      >
        <div className="py-4 px-6 bg-gray-700 rounded-md flex flex-col items-center gap-3">
          <p className="text-[1.1rem] text-gray-100 font-medium">
            Are you sure?
          </p>
          <div className="flex items-center gap-3">
            <button
              className="py-2 px-5 bg-gray-100 rounded-md hover:bg-gray-200 "
              onClick={cancelNoBtnHandler}
            >
              No
            </button>
            <button
              className="py-2 px-5 bg-gray-600 rounded-md text-gray-100 hover:bg-gray-500 "
              onClick={cancelYesBtnHandler}
            >
              Yes
            </button>
          </div>
        </div>
      </div>

      {/* result area  */}
      <div
        className={`${
          isSubmit ? "flex" : "hidden"
        }  w-full h-[100vh] bg-black/50 backdrop-blur-sm fixed top-0 left-0 z-[99999] items-center justify-center`}
      >
        <div className="md:w-[80%] w-[90%] max-w-[1200px] py-4 px-6 bg-gray-800 rounded-md flex flex-col items-center gap-3">
          <div className="w-full">
            <div className="w-full grid min-[921px]:grid-cols-4 min-[368px]:grid-cols-2 grid-cols-1 gap-1 sm:text-[1.1rem] text-[1rem] py-3">
              <p className="text-center text-gray-200 font-bold">
                Total Questions : {quizes.length}
              </p>

              <p className="text-center text-gray-200 font-bold">
                Attempted : {selectedOption.length}
              </p>

              <p className="text-center text-green-500 font-bold">
                Correct : {correctQuizes.length}
              </p>

              <p className="text-center text-red-500 font-bold">
                Wrong : {selectedOption.length - correctQuizes.length}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1 text-[0.9rem] py-3">
              <p
                className={`text-[2rem] text-center  font-black ${
                  percentage >= 0 && percentage < 51
                    ? "text-red-500"
                    : percentage >= 51 && percentage < 75
                    ? "text-orange-500"
                    : percentage >= 75
                    ? "text-green-500"
                    : "text-blue-500"
                }`}
              >
                {Math.round(percentage * 100) / 100}%
              </p>
              <p className="text-center text-[1rem] text-gray-200 font-bold">
                Total Marks Obtained :{" "}
                <span className="text-[1.5rem] text-gray-100 font-black">
                  {totalMarks}
                </span>
                Out of {quizes.length}
              </p>

              <p className="text-center text-gray-400 font-medium italic">
                1 Point for per Correct Answer
              </p>

              <p className="text-center text-gray-400 font-medium italic">
                -0.25 Negative Marking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="py-2 px-5 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 "
              onClick={viewAnsHandler}
            >
              View Answers
            </button>

            <button
              className="py-2 px-5 bg-[#ec4899] rounded-md text-gray-100 hover:bg-[#fc6fb5] "
              onClick={cancelYesBtnHandler}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PlayQuiz;

const QuizCard = ({
  quizes,
  quizNum,
  handleOptionChange,
  selectedOption,
  userOptions,
  showAnsDesc,
}) => {
  return (
    <div className="sm:w-[500px] w-full mx-auto bg-slate-800 shadow-md rounded-md p-6 mb-4 z-[999] select-none">
      {/* Question */}
      <h2 className="text-xl font-bold mb-4 text-gray-100">
        Q. {quizNum + 1}) {quizes[quizNum]?.question}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-1 gap-4">
        <label htmlFor="Option_A">
          <div
            className={`flex items-cetner gap-2 bg-gray-600 text-gray-100 py-2 px-2 rounded-md cursor-pointer hover:brightness-[0.9] ${
              userOptions?.userAnswer == "Option A" &&
              "!bg-gray-300 text-gray-900"
            } ${
              showAnsDesc &&
              quizes[quizNum]?.correct_Option == "Option A" &&
              "!bg-green-500 text-white"
            }
            } ${
              showAnsDesc &&
              selectedOption[quizNum]?.userAnswer == "Option A" &&
              quizes[quizNum]?.correct_Option != "Option A" &&
              "!bg-red-500 text-white"
            } `}
          >
            A)
            <input
              type="radio"
              value={quizes[quizNum]?.option_A}
              name={`option_${quizNum}`}
              id="Option_A"
              className="hidden"
              onChange={(e) => handleOptionChange("Option A", e)}
            />
            <p className="w-full ps-2">{quizes[quizNum]?.option_A}</p>
          </div>
        </label>
        <label htmlFor="Option_B">
          <div
            className={`flex items-cetner gap-2 bg-gray-600 text-gray-100 py-2 px-2 rounded-md cursor-pointer hover:brightness-[0.9] ${
              userOptions?.userAnswer == "Option B" &&
              "!bg-gray-300 text-gray-900"
            } ${
              showAnsDesc &&
              quizes[quizNum]?.correct_Option == "Option B" &&
              "!bg-green-600 text-white"
            } ${
              showAnsDesc &&
              selectedOption[quizNum]?.userAnswer == "Option B" &&
              quizes[quizNum]?.correct_Option != "Option B" &&
              "!bg-red-600 text-white"
            } `}
          >
            B)
            <input
              type="radio"
              value={quizes[quizNum]?.option_B}
              name={`option_${quizNum}`}
              id="Option_B"
              className="hidden"
              onChange={(e) => handleOptionChange("Option B", e)}
            />
            <p className="w-full ps-2">{quizes[quizNum]?.option_B}</p>
          </div>
        </label>
        <label htmlFor="Option_C">
          <div
            className={`flex items-cetner gap-2 bg-gray-600 text-gray-100 py-2 px-2 rounded-md cursor-pointer hover:brightness-[0.9] ${
              userOptions?.userAnswer == "Option C" &&
              "!bg-gray-300 text-gray-900"
            } ${
              showAnsDesc &&
              quizes[quizNum]?.correct_Option == "Option C" &&
              "!bg-green-600 text-white"
            } ${
              showAnsDesc &&
              selectedOption[quizNum]?.userAnswer == "Option C" &&
              quizes[quizNum]?.correct_Option != "Option C" &&
              "!bg-red-600 text-white"
            } `}
          >
            C)
            <input
              type="radio"
              value={quizes[quizNum]?.option_C}
              name={`option_${quizNum}`}
              id="Option_C"
              className="hidden"
              onChange={(e) => handleOptionChange("Option C", e)}
            />
            <p className="w-full ps-2">{quizes[quizNum]?.option_C}</p>
          </div>
        </label>
        <label htmlFor="Option_D">
          <div
            className={`flex items-cetner gap-2 bg-gray-600 text-gray-100 py-2 px-2 rounded-md cursor-pointer hover:brightness-[0.9] ${
              userOptions?.userAnswer == "Option D" &&
              "!bg-gray-300 text-gray-900"
            } ${
              showAnsDesc &&
              quizes[quizNum]?.correct_Option == "Option D" &&
              "!bg-green-600 text-white"
            } ${
              showAnsDesc &&
              selectedOption[quizNum]?.userAnswer == "Option D" &&
              quizes[quizNum]?.correct_Option != "Option D" &&
              "!bg-red-600 text-white"
            } `}
          >
            D)
            <input
              type="radio"
              value={quizes[quizNum]?.option_D}
              name={`option_${quizNum}`}
              id="Option_D"
              className="hidden"
              onChange={(e) => handleOptionChange("Option D", e)}
            />
            <p className="w-full ps-2">{quizes[quizNum]?.option_D}</p>
          </div>
        </label>
      </div>
    </div>
  );
};
