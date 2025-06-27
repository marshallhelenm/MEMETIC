import {
  Outlet,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { WSProvider } from "./contexts/WSContext";
import { GuessyProvider } from "./contexts/GuessyContext";
import { useEffect } from "react";

function App() {
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();
  let location = useLocation();
  const currentRoomKey = searchParams.get("roomKey") || undefined;
  const username = searchParams.get("username");

  useEffect(() => {
    if (location.pathname == "/" || !currentRoomKey) {
      navigate("/home");
    } else if (location.pathname == "/play" && !username) {
      navigate("/home");
    }
  }, [location, navigate, currentRoomKey, username]);

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
