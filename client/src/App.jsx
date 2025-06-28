import {
  Outlet,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useEffect } from "react";

import { WSProvider } from "./contexts/WSContext";
import { GuessyProvider } from "./contexts/GuessyContext";

import MessageReceiver from "./utils/MessageReceiver";

function App() {
  let navigate = useNavigate();
  let location = useLocation();
  const [searchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey");
  const username = searchParams.get("username");

  useEffect(() => {
    if (
      location.pathname == "/" ||
      (location.pathname != "/home" && !roomKey)
    ) {
      navigate("/home");
    } else if (location.pathname == "/play" && !username) {
      navigate("/home");
    }
  }, [location, navigate, roomKey, username]);

  return (
    <div className="guessy-background">
      <WSProvider>
        <GuessyProvider>
          <MessageReceiver />
          <Outlet />
        </GuessyProvider>
      </WSProvider>
    </div>
  );
}

export default App;
