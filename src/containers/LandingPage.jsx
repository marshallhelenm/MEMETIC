import "../App.css";
import { Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import NewGame from "./NewGame";

//The first page you see. Holds options to join a game or start a new game.
function LandingPage() {
  return (
      <div>
        <Logo spin={true} />
        <h1>Guessy</h1>
        <NewGame />
        <Link to="/join">
          <Button>
            Join game
          </Button>
        </Link>
      </div>
  );
}

export default LandingPage;
