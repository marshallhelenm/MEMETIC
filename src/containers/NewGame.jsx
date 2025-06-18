import { Link } from "react-router-dom";
import "../App.css";
import { Button } from "semantic-ui-react";

function NewGame () {
  function generateRoomKey() {
    var newRoomKey = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 8; i++ ) {
        newRoomKey += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return newRoomKey;
  }
  
  return (
    <Link to={`/play?roomKey=${generateRoomKey()}`}>
      <Button>New Game</Button>
    </Link>
  );
}

export default NewGame;


