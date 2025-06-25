import { Link } from "react-router-dom";
import "../App.css";
import { useGuessy } from "../contexts/useGuessy";
import GuessyButton from "./GuessyButton";

function NewGame () {
  const {handleNewGame} = useGuessy()
  function generateRoomKey() {
    var newRoomKey = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 8; i++ ) {
        newRoomKey += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return newRoomKey;
  }
  const newRoomKey = generateRoomKey()
  
  return (
    <Link
      to={`/name_thyself?roomKey=${newRoomKey}`}
      onClick={() => handleNewGame(newRoomKey)}
    >
      <GuessyButton>New Game</GuessyButton>
    </Link>
  );
}

export default NewGame;


