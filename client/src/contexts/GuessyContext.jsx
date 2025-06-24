import { createContext, useContext, useMemo, useState } from "react";
import { useWS } from "./useWS";
import { memeSampler } from "../assets/memeCollection";

const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [roomKey, setRoomKey] = useState("");
  const [playerCard, setPlayerCard] = useState("");
  const [username, setUsername] = useState("");
  const [staticGifs, setStaticGifs] = useState(
    localStorage.getItem("guessy_gifs") == "true"
  );
  const { sendJsonMessage } = useWS();

  const value = useMemo(() => {
    function setRoomContents(key, memes) {
      setRoomKey(key);
      sendJsonMessage({
        type: "setRoomContents",
        roomKey: key,
        memeSet: memes,
        username,
      });
    }
    function getRoomContents(key) {
      setRoomKey(key);
      sendJsonMessage({ type: "getRoomContents", roomKey: key });
    }
    function joinRoom(roomKey) {
      setRoomKey(roomKey);
      sendJsonMessage({ type: "joinRoom", roomKey, username });
    }
    function sendUsername(newUsername) {
      setUsername(newUsername);
      sendJsonMessage({ type: "setUsername", roomKey, newUsername });
    }
    function handleNewGame(roomKey) {
      const new_memes = memeSampler();
      cleanUpLocalStorage(roomKey);
      setRoomContents(roomKey, new_memes);
    }
    function cleanUpLocalStorage(roomKey) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(roomKey)) {
          localStorage.removeItem(key);
        }
      });
    }
    function randomCardKey(keys) {
      if (!keys) return;
      let min = Math.ceil(0);
      let max = Math.floor(23);
      let index = Math.floor(Math.random() * (max - min + 1)) + min;
      return keys[index];
    }
    function handlePlayerCard(keys) {
      let cardKey = localStorage.getItem(`${roomKey}-player-card`);
      if (!cardKey || cardKey == "undefined") {
        pickNewPlayerCard();
      }
      return cardKey;
    }
    function pickNewPlayerCard() {
      let cardKey = randomCardKey();
      localStorage.setItem(`${roomKey}-player-card`, cardKey);
      setPlayerCard(cardKey);
    }
    function getUsernameLocal() {
      const localUsername = localStorage.getItem(`${roomKey}-username`);
      if (localUsername == "undefined") {
        setUsername(null);
        return null;
      } else {
        setUsername(localUsername);
        return localUsername;
      }
    }
    function assignUsername(newName) {
      localStorage.setItem(`${roomKey}-username`, newName);
      setUsername(newName);
      sendUsername(newName);
    }

    return {
      roomKey,
      setRoomContents,
      joinRoom,
      staticGifs,
      setStaticGifs,
      cleanUpLocalStorage,
      handleNewGame,
      getRoomContents,
      handlePlayerCard,
      pickNewPlayerCard,
      playerCard,
      sendUsername,
      getUsernameLocal,
      assignUsername,
      username,
    };
  }, [
    roomKey,
    username,
    setUsername,
    sendJsonMessage,
    staticGifs,
    setStaticGifs,
    playerCard,
  ]);

  return (
    // 2) PROVIDE VALUE TO CHILD COMPONENTS
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };
