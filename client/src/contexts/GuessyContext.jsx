import { createContext, useContext, useMemo, useState } from "react";
import { useWS } from "./useWS";
import { memeSampler } from "../assets/memeCollection";

const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [username] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [staticGifs, setStaticGifs] = useState(localStorage.getItem('guessy_gifs') == "true")
  const { sendJsonMessage, uuid, connectionAttempts, connectionError } = useWS()

  const value = useMemo(() => {
    function setRoomContents(key, memes){
      setRoomKey(key)
      sendJsonMessage({type: "setRoomContents", roomKey: key, memeSet: memes})
    }
    function getRoomContents(key){
      setRoomKey(key)
      sendJsonMessage({type: "getRoomContents", roomKey: key})
    }
    function joinRoom(key){
      setRoomKey(key)
      sendJsonMessage({type: "joinRoom", roomKey: key, user: uuid})
    }
    function handleNewGame(roomKey){
      const new_memes = memeSampler()
      cleanUpLocalStorage(roomKey)
      setRoomContents(roomKey, new_memes)
    }

    function cleanUpLocalStorage(roomKey){
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(roomKey)) {
          localStorage.removeItem(key);
        }
      });
    }

    return {
      roomKey,
      username,
      setRoomContents,
      joinRoom,
      staticGifs,
      setStaticGifs,
      cleanUpLocalStorage,
      handleNewGame,
      getRoomContents,
    };
  }, [roomKey, username, sendJsonMessage, uuid, staticGifs, setStaticGifs]);

  return (
    // 2) PROVIDE VALUE TO CHILD COMPONENTS
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };