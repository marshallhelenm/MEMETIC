import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import Board from "./Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../components/PlayGameHeader";
import ConnectionError from "../components/ConnectionError";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams] = useSearchParams();
  const [memeCollection, setMemeCollection] = useState([])
  const [loading, setLoading] = useState(true)
  const roomKey = searchParams.get("roomKey")
  const {joinRoom, handleNewGame} = useGuessy()
  const {lastJsonMessage, serverReady } = useWS()


  useEffect(()=>{
    joinRoom(roomKey)
    if (!lastJsonMessage) {
      return
    } else if (lastJsonMessage['alert'] == 'no game in room') {
      handleNewGame(roomKey)
      return
    } else {
      const new_memes = lastJsonMessage['memeSet']
      setMemeCollection(new_memes)
      setLoading(false)
    }
  }, [roomKey, joinRoom, lastJsonMessage, handleNewGame])

  if (roomKey.length != 8){
    return <InvalidRoomKey />
  } else {
    return (
      <div className="play-game">
        <PlayGameHeader setMemeCollection={setMemeCollection} roomKey={roomKey}  />
        <Board itemKeys={memeCollection} roomKey={roomKey} loading={loading} />
      </div>
    );
  }
}

export default PlayGame;
