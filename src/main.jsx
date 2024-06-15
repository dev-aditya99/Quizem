import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import MainContext from "./MainContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <MainContext>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </MainContext>
);
