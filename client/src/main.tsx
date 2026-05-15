import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./themes/index.css";
import "./themes/App.css";

import App from "./App.js";
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Join = lazy(() => import("./pages/Join.jsx"));
const Upload = lazy(() => import("./pages/Upload.jsx"));
const ImageAnalyzer = lazy(() => import("./pages/ImageAnalyzer.jsx"));
const NameForm = lazy(() => import("./pages/NameForm.jsx"));
const PlayPage = lazy(() => import("./pages/PlayPage/PlayPage.js"));

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
