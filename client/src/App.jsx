import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { WSProvider } from "./contexts/WSContext";
import { GuessyProvider } from "./contexts/GuessyContext";
import { useEffect } from "react";

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
          <Outlet />
        </GuessyProvider>
      </WSProvider>
    </div>
  );
}

export default App;
