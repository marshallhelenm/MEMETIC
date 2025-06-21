import { createContext, useContext, useMemo, useState } from "react";
import { useWS } from "./WSContext";
import { memeSampler } from "../assets/memeCollection";

// 1) CREATE A CONTEXT
const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [username] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [staticGifs, setStaticGifs] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [connectionError, setConnectionError] = useState(false)
  const { sendJsonMessage, uuid } = useWS()

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
      connectionAttempts,
      setConnectionAttempts,
      connectionError, 
      setConnectionError
    };
  }, [roomKey, username, sendJsonMessage, uuid, staticGifs, setStaticGifs, connectionAttempts, setConnectionAttempts, connectionError, setConnectionError]);

  return (
    // 2) PROVIDE VALUE TO CHILD COMPONENTS
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

function useGuessy() {
  const context = useContext(GuessyContext);
  if (context === undefined)
    throw new Error("GuessyContext was used outside of the GuessyProvider");
  return context;
}

export { GuessyProvider, useGuessy };