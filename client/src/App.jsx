import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { WSProvider } from "./contexts/WSContext";

import { GameProvider } from "./contexts/GameContext";

function App() {
  let navigate = useNavigate();
  let location = useLocation();

  useEffect(() => {
    if (location.pathname == "/") navigate("/home");
  }, [location, navigate]);

  return (
    <div className="guessy-background">
      <WSProvider>
        <GameProvider>
          <Outlet />
        </GameProvider>
      </WSProvider>
    </div>
  );
}

export default App;
