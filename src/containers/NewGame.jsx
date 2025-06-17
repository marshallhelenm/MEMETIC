import { Link } from "react-router-dom";
import "../App.css";
import { Button } from "semantic-ui-react";

function NewGame () {
  function generateRoomKey() {
    let room = Math.random().toString(36).substring(7);
    localStorage.setItem("roomkey", room);
    return room;
  }
  
  return (
    <Link to={`/play?roomKey=${generateRoomKey()}`}>
      <Button>New Game</Button>
    </Link>
  );
}

export default NewGame;


