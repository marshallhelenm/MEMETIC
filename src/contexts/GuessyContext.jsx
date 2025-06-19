import { createContext, useContext, useMemo, useState } from "react";
import { useWS } from "./WSContext";
import { useEffect } from "react";

// 1) CREATE A CONTEXT
const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [username, setUsername] = useState("");
  const [roomKey, setRoomKey] = useState("");
  // const [memeSet, setMemeSet] = useState([]);
  const { sendJsonMessage, uuid } = useWS()

  const value = useMemo(() => {
    function handleLogin(username){
      if (username.length >= 2) {
        setUsername(username)
        sendJsonMessage({type: "login", username})
      }
    }
    function setRoomContents(key, memes){
      setRoomKey(key)
      sendJsonMessage({type: "setRoomContents", roomKey: key, memeSet: memes})
    }
    function joinRoom(key){
      console.log("Guessy Context joinRoom");
      
      setRoomKey(key)
      sendJsonMessage({type: "joinRoom", roomKey: key, user: uuid})
    }
    function leaveRoom(key, uuid){
      setRoomKey(key)
      sendJsonMessage({type: "leaveRoom", roomKey: key, user: uuid})
    }

    return {
      roomKey,
      username,
      // memeSet,
      onLogin: handleLogin,
      setRoomContents,
      joinRoom,
      leaveRoom
    };
  }, [roomKey, username, sendJsonMessage, uuid]);

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