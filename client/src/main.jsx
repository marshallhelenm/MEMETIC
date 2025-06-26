import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import "./App.css";
import App from "./App.jsx";
import LandingPage from "./pages/LandingPage";
import PlayGame from "./pages/PlayGame";
import Join from "./components/Join";
import Upload from "./pages/Upload";
import ImageAnalyzer from "./pages/ImageAnalyzer";
import NameForm from "./pages/NameForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/home",
        element: <LandingPage />,
      },
      {
        path: "/play",
        element: <PlayGame />,
      },
      {
        path: "/join",
        element: <Join />,
      },
      {
        path: "/name_thyself",
        element: <NameForm />,
      },
      {
        path: "/upload",
        element: <Upload />,
      },
      {
        path: "/image_analyzer",
        element: <ImageAnalyzer />,
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
