import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import "./App.css";
import App from "./App.jsx";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Join = lazy(() => import("./pages/Join"));
const Upload = lazy(() => import("./pages/Upload"));
const ImageAnalyzer = lazy(() => import("./pages/ImageAnalyzer"));
const NameForm = lazy(() => import("./pages/NameForm"));
const PlayPage = lazy(() => import("./pages/PlayPage/PlayPage"));

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
        element: <PlayPage />,
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
