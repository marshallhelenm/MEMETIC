import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import Board from "./Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../components/PlayGameHeader";
import { useGuessy } from "../contexts/GuessyContext";
import { useWS } from "../contexts/WSContext";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey")
  const [memeCollection, setMemeCollection] = useState([])
  const {joinRoom, cleanUpLocalStorage} = useGuessy()
  const {lastJsonMessage} = useWS()


  useEffect(()=>{
    joinRoom(roomKey)
    const memes = JSON.parse(localStorage.getItem(`guessy-${roomKey}`));
    if (memes) {
      setMemeCollection(memes);
    } else {
      if (!lastJsonMessage) return; // TODO: make this display an 'error connecting, try again' thingy instead of an empty screen
      const new_memes = JSON.parse(lastJsonMessage.memeSet)
      setMemeCollection(new_memes)
      cleanUpLocalStorage(roomKey)
      localStorage.setItem(`guessy-${roomKey}`, JSON.stringify({
        memes: new_memes,
        est: lastJsonMessage.est
      }))
    }
  }, [roomKey, joinRoom, lastJsonMessage, cleanUpLocalStorage])

  if (roomKey.length != 8){
    return <InvalidRoomKey />
  }

  return (
    <div className="play-game">
      <PlayGameHeader setMemeCollection={setMemeCollection} roomKey={roomKey}  />
      <Board itemKeys={memeCollection} roomKey={roomKey} />
    </div>
  );
}

export default PlayGame;
