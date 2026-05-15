import { Link } from "react-router-dom";
import Logo from "../../components/Logo.js";
import NewGame from "../../components/NewGame.js";
import GuessyButton from "../../components/GuessyButton.js";

const InvalidRoomKey: React.FC = () => {
  return (
    <div>
      <Logo />
      <h3 className="heading">Invalid Room Key</h3>
      <NewGame />
      <Link to="/join">
        <GuessyButton>Join game</GuessyButton>
      </Link>
    </div>
  );
};

export default InvalidRoomKey;
