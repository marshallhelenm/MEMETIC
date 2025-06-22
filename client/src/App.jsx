import "./App.css";
import LandingPage from "./containers/LandingPage";
import PlayGame from "./containers/PlayGame";
import Join from "./components/Join";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Upload from "./containers/Upload";
import ImageAnalyzer from "./containers/ImageAnalyzer";

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
  // {
  //   path: "/upload",
  //   element: <Upload />,
  // },
  // {
  //   path: "/image_analyzer",
  //   element: <ImageAnalyzer />,
  // },
])

function App() {
  return (
    <div className="guessy-background">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
