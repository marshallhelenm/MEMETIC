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

  useEffect(() => {
    if (location.pathname == "/") navigate("/home");
  }, [location, navigate]);

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
