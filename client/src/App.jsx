import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { WSProvider } from "./contexts/WSContext";
import { GuessyProvider } from "./contexts/GuessyContext";

import MessageHandler from "./utils/MessageHandler";
import { useGuessy } from "./contexts/useGuessy";

function App() {
  let navigate = useNavigate();
  let location = useLocation();
  const { roomKey, username } = useGuessy();

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
          <MessageHandler />
          <Outlet />
        </GuessyProvider>
      </WSProvider>
    </div>
  );
}

export default App;
