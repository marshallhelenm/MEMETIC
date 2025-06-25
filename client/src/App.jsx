import "./App.css";
import LandingPage from "./pages/LandingPage";
import PlayGame from "./pages/PlayGame";
import Join from "./components/Join";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Upload from "./pages/Upload";
import ImageAnalyzer from "./pages/ImageAnalyzer";
import NameForm from "./pages/NameForm";

const router = createBrowserRouter([
  {
    path: "/",
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
  // {
  //   path: "/upload",
  //   element: <Upload />,
  // },
  // {
  //   path: "/image_analyzer",
  //   element: <ImageAnalyzer />,
  // },
]);

function App() {
  return (
    <div className="guessy-background">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
