import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import "../App.css";
import Logo from "../components/Logo";
import NewGame from "./NewGame";

//the page you see while actually playing the game
function PlayGame() {
  return (
    <div>
        <Logo />
        <h3 className="roomkey-header">Invalid Room Key</h3>
        <NewGame />
        <Link to="/join">
          <Button>
            Join game
          </Button>
        </Link>
    </div>
  );
}

export default PlayGame;
