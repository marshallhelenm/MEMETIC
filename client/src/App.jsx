import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { WSProvider } from "./contexts/WSContext";

import { GameProvider } from "./contexts/GameContext";
import { PlayersProvider } from "./contexts/PlayersContext";

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
          <PlayersProvider>
            <Outlet />
          </PlayersProvider>
        </GameProvider>
      </WSProvider>
    </div>
  );
}

export default App;
