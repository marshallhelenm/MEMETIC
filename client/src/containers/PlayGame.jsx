import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import Board from "./Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../components/PlayGameHeader";
import ConnectionError from "../components/ConnectionError";
import { useGuessy } from "../contexts/GuessyContext";
import { useWS } from "../contexts/WSContext";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams] = useSearchParams();
  const [memeCollection, setMemeCollection] = useState([])
  const [loading, setLoading] = useState(true)
  const roomKey = searchParams.get("roomKey")
  const {joinRoom, cleanUpLocalStorage, handleNewGame, getRoomContents} = useGuessy()
  const {lastJsonMessage, serverReady, connectionAttempts, setConnectionAttempts, connectionError, setConnectionError} = useWS()


  useEffect(()=>{
    if(connectionError) return;
    if (!serverReady){
      setConnectionAttempts(connectionAttempts + 1)
      if (connectionAttempts > 20) {
        setConnectionError(true)
        return
      }
    } else {
      joinRoom(roomKey)
    }
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
  }, [roomKey, joinRoom, lastJsonMessage, cleanUpLocalStorage, getRoomContents, handleNewGame, serverReady, connectionAttempts, setConnectionAttempts, connectionError, setConnectionError])

  if (connectionError && !serverReady){
    return <ConnectionError />
  } else if (roomKey.length != 8){
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
