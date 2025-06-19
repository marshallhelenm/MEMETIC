import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "semantic-ui-react";
import "../App.css";
import Board from "./Board";
import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import InvalidRoomKey from "./InvalidRoomKey";
import { memeSampler } from "../assets/memeCollection";
import { useGuessy } from "../contexts/GuessyContext";
import { useWS } from "../contexts/WSContext";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey")
  const [memeCollection, setMemeCollection] = useState([])
  const {setRoomContents, joinRoom} = useGuessy()
  const {lastJsonMessage} = useWS()


  useEffect(()=>{
    joinRoom(roomKey)
    const memes = JSON.parse(localStorage.getItem(`guessy-${roomKey}`));
    if (memes) {
      setMemeCollection(memes);
    } else {
      console.log("getRoomContents: ", lastJsonMessage);
      const new_memes = JSON.parse(lastJsonMessage.memeSet)
      setMemeCollection(new_memes)
      localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes))
    }
  }, [roomKey, joinRoom, lastJsonMessage])

  function handleClearGame(){
    let new_memes = memeSampler()
    setMemeCollection(new_memes)
    setRoomContents(roomKey, new_memes)
    localStorage.setItem(`guessy-${roomKey}`, JSON.stringify(new_memes) )
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
          {/* TODO: implement confirmation modal for clearing the game */}
          <Button onClick={handleClearGame}>New Game</Button>;
        </div>
      </div>
      <Board items={memeCollection} roomKey={roomKey} />
    </div>
  );
}

export default PlayGame;
