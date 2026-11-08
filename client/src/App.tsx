import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { WSProvider } from "./contexts/WSContext";
import { GameProvider } from "./contexts/GameContext";
import { LayoutProvider } from "./contexts/LayoutContext";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") navigate("/home");
  }, [location, navigate]);

  return (
    <div className="guessy-background">
      <LayoutProvider>
        <WSProvider>
          <GameProvider>
            <Outlet />
          </GameProvider>
        </WSProvider>
      </LayoutProvider>
    </div>
  );
};

export default App;
