import "./App.css";
import LandingPage from "./containers/LandingPage";
import PlayGame from "./containers/PlayGame";
import Join from "./components/Join";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
])

function App() {
  return (
    <div className="guessy-background">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
