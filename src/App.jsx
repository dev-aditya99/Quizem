import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import CreateQiuzes from "./Pages/CreateQiuzes";
import PlayQuiz from "./Pages/PlayQuiz";
import MainPage from "./Pages/MainPage";
import Authentication from "./Pages/Authentication";
import Admin from "./Pages/Admin";
import Category from "./Pages/Category";
import Quizes from "./Pages/Quizes";
import Profile from "./Pages/Profile";
import EditCategories from "./Pages/EditCategories";
import NotFoundPage from "./Pages/NotFoundPage";
import Dashboard from "./Pages/Dasshboard";

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <MainPage />,
      children: [
        {
          path: "/",
          element: <Home></Home>,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/quizes",
          element: <Quizes></Quizes>,
        },
        {
          path: "/quizes/play-quiz",
          element: <PlayQuiz></PlayQuiz>,
        },
        {
          path: "/auth",
          element: <Authentication></Authentication>,
        },
        {
          path: "/profile",
          element: <Profile></Profile>,
        },
        {
          path: "/admin",
          element: <Admin></Admin>,
        },
        {
          path: "/admin/category",
          element: <Category></Category>,
        },
        {
          path: "/admin/category/:slug",
          element: <EditCategories></EditCategories>,
        },
        {
          path: "/admin/category/create-quizes",
          element: <CreateQiuzes></CreateQiuzes>,
        },
        {
          path: "*",
          element: <NotFoundPage></NotFoundPage>,
        },
      ],
    },

    // {
    //   path: "*",
    //   element: <h1>This page dosen't exist!!!</h1>,
    // },
  ]);

  return (
    <>
      <RouterProvider router={routes}></RouterProvider>
    </>
  );
}

export default App;
