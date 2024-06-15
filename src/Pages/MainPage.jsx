import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../MainContext";

function MainPage() {
  const { ToastContainer } = useContext(Context);
  return (
    <>
      <ToastContainer></ToastContainer>
      <div>
        <Header></Header>
        <Outlet></Outlet>
      </div>
    </>
  );
}

export default MainPage;
