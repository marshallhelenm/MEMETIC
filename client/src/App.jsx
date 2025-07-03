import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { WSProvider } from "./contexts/WSContext";

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
        <MessageReceiver />
        <Outlet />
      </WSProvider>
    </div>
  );
}

export default App;
