import { Link } from "react-router-dom";
import "../App.css";
import Logo from "../components/Logo";
import NewGame from "../components/NewGame";
import GuessyButton from "../components/GuessyButton";

//the page you see while actually playing the game
function PlayGame() {
  return (
    <div>
        <Logo />
        <h3 className="heading">Invalid Room Key</h3>
        <NewGame />
        <Link to="/join">
          <GuessyButton>
            Join game
          </GuessyButton>
        </Link>
    </div>
  );
}

export default PlayGame;
