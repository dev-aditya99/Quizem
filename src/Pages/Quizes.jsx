import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../MainContext";
import { FaSpinner, FaPlay } from "react-icons/fa";

function Quizes() {
  // context
  const { category, user, categoryClickDetailsHandler, isLoader, setIsLoader } =
    useContext(Context);

  // navigator
  const navigator = useNavigate();

  // other code
  useEffect(() => {
    let lsUser = localStorage.getItem("user");

    if (!lsUser) {
      navigator("/auth");
    }
  }, [user]);

  const btnClickHandler = (cateId, cateTitle, cateCategory) => {
    categoryClickDetailsHandler({
      cateId: cateId,
      cateTitle: cateTitle,
      cateCategory: cateCategory,
    });

    localStorage.setItem(
      "cateItems",
      JSON.stringify({
        cateId: cateId,
        cateTitle: cateTitle,
        cateCategory: cateCategory,
      })
    );
    navigator("/quizes/play-quiz");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="bg-gray-800 text-gray-100 text-[2rem] font-black p-5 rounded-md">
        Quizes
      </h1>

      <div className="w-full my-6 py-4">
        {category == false ? (
          <div className="flex items-center justify-center py-9 ">
            <FaSpinner className="text-gray-300 text-[2rem] block animate-spin" />
          </div>
        ) : (
          <div className="w-full mx-auto">
            {category == null ? (
              <div className="my-9 flex items-center justify-center flex-col">
                <p className="text-gray-300 text-[2rem] ">
                  No Quizes Were Found
                </p>
                <p className="my-4 font-medium ">
                  <Link
                    to={"/admin"}
                    className="py-2 px-6 bg-slate-500 rounded-md text-slate-200"
                  >
                    Create an Quiz +
                  </Link>
                </p>
              </div>
            ) : (
              <>
                <div className="grid min-[921px]:grid-cols-3 sm:grid-cols-2 grid-cols-1 justify-between gap-4 px-5 py-4 mb-5">
                  {category?.map((cate) => {
                    return (
                      <div
                        key={cate?.id}
                        className="bg-slate-800 rounded-md p-5 mb-3 text-center flex flex-col items-center justify-center gap-2"
                      >
                        <div className="group w-full h-[400px] bg-gray-700 rounded-md overflow-hidden relative">
                          <img
                            src={`${cate?.image}`}
                            alt="404"
                            title={`${cate?.title}`}
                            className="w-full h-full object-cover group-hover:scale-[1.2] duration-300 cursor-pointer"
                            draggable={false}
                            onClick={() =>
                              btnClickHandler(
                                cate.id,
                                cate.title,
                                cate.category
                              )
                            }
                          />

                          <span className="w-[100px] py-1 m-3 px-2 bg-[#ec4899] text-[0.8rem] text-gray-100 font-bold rounded-md absolute top-0 right-[0] select-none truncate">
                            @{cate?.userName}
                          </span>
                        </div>
                        <p
                          className="w-full font-bold text-[1.3rem] text-gray-100 truncate"
                          title={`${cate?.title}`}
                        >
                          {cate?.title}
                        </p>
                        <p
                          className="w-full text-gray-200 truncate"
                          title={`Description`}
                        >
                          {cate?.description}
                        </p>
                        <div
                          className="w-full bg-gray-600 text-gray-100 py-1 px-6 rounded-md truncate"
                          title={`${cate?.category}`}
                        >
                          {cate?.category}
                        </div>
                        <button
                          className="mt-7 mb-4 py-3 px-9 bg-gray-700 hover:bg-gray-500 duration-200 text-gray-100 text-[1.5rem] rounded-md "
                          title="Add Questions"
                          onClick={() =>
                            btnClickHandler(cate.id, cate.title, cate.category)
                          }
                        >
                          <FaPlay></FaPlay>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quizes;
