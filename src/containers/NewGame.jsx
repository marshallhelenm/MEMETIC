import { Link } from "react-router-dom";
import "../App.css";
import { Button } from "semantic-ui-react";

function NewGame () {
  function generateRoomKey() {
    return Math.random().toString(36).substring(8);
  }
  
  return (
    <Link to={`/play?roomKey=${generateRoomKey()}`}>
      <Button>New Game</Button>
    </Link>
  );
}

export default NewGame;


