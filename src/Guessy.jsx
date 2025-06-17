import "./App.css";
import LandingPage from "./containers/LandingPage";
import NewGame from "./containers/NewGame";
import PlayGame from "./containers/PlayGame/PlayGame";
import Chat from "./components/Chat/Chat";
import Join from "./components/Join/Join";
import { createBrowserRouter, RouterProvider } from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/new_game",
    element: <NewGame />,
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
  //   path: "/chat",
  //   element: <Chat />,
  // },
])
const Guessy = () => {
  return <RouterProvider router={router} />
};

export default Guessy;
