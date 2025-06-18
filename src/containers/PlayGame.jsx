import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "semantic-ui-react";
import "../App.css";
import Board from "./Board";
import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import InvalidRoomKey from "./InvalidRoomKey";
import { memeSampler } from "../assets/memeCollection";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey")
  const [memeCollection, setMemeCollection] = useState([])


  useEffect(()=>{
    const memes = JSON.parse(localStorage.getItem(`guessy-${roomKey}`));
    if (memes) {
      setMemeCollection(memes);
    } else {
      let new_memes = memeSampler()
      localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes))
      setMemeCollection(new_memes)
    }
  }, [roomKey])

  function handleClearGame(){
    let new_memes = memeSampler()
    localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes) )
    setMemeCollection(new_memes)
  }

  if (roomKey.length != 8){
    return <InvalidRoomKey />
  }

  return (
    <div className="play-game">
      <div className="play-header">
        <Logo spin={false} />
        <h3 className="roomkey-header">Room Key: {roomKey}</h3>
        <div className="column-md-6">
          <QuestionsModal />
        </div>
        <div className="column-md-6">
          <Button onClick={handleClearGame}>New Game</Button>;
        </div>
      </div>
      <Board items={memeCollection} roomKey={roomKey} />
    </div>
  );
}

export default PlayGame;
