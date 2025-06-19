import { Link } from "react-router-dom";
import "../App.css";
import { Button } from "semantic-ui-react";
import { useGuessy } from "../contexts/GuessyContext";
import { memeSampler } from "../assets/memeCollection";

function NewGame () {
  const {setRoomContents} = useGuessy()
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

  function handleNewGame(){
    const new_memes = memeSampler()
    console.log("handleNewGame, new_memes: ", new_memes);
    
    setRoomContents(newRoomKey, new_memes)
  }
  
  return (
    <Link to={`/play?roomKey=${newRoomKey}`} onClick={handleNewGame}>
      <Button>New Game</Button>
    </Link>
  );
}

export default NewGame;


