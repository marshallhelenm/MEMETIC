import { createContext, useMemo, useState, useEffect } from "react";
import { useWS } from "./useWS";
import { useSearchParams } from "react-router-dom";
import { handleMessages } from "../utils/MessageHandler";
import { memeSampler } from "../assets/memeCollection";
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";

const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [roomObject, setRoomObject] = useState({});
  const [searchParams] = useSearchParams();
  const [staticGifs, setStaticGifs] = useState(
    localStorage.getItem("guessy_gifs") == "true"
  );
  const { uuidRef, setUuidRef, sendJsonMessage, readyState, lastJsonMessage } =
    useWS();
  const { lastJsonMessageChanged } = useTraceUpdate({
    component: "GuessyProvider",
    lastJsonMessage,
  });
  const roomKey = searchParams.get("roomKey");
  const username = searchParams.get("username");

  // ** useMemo functions **
  const updateRoomObject = useMemo(() => {
    return (newRoomObject) => {
      devLog("updateRoomObject", newRoomObject);
      setRoomObject((prevRoomObject) => {
        return {
          ...prevRoomObject,
          ...newRoomObject,
        };
      });
    };
  }, [setRoomObject]);

  const joinRoom = useMemo(() => {
    return (
      username,
      joinKey = roomKey,
      returnRoomContents = roomObject ? true : false
    ) => {
      devLog("joinRoom");

      sendJsonMessage({
        type: "joinRoom",
        roomKey: joinKey,
        username,
        returnRoomContents,
      });
    };
  }, [sendJsonMessage, roomKey, roomObject]);

  const randomCardKey = (keys) => {
    if (!keys) return;
    let min = Math.ceil(0);
    let max = Math.floor(23);
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    return keys[index];
  };

  const createRoom = useMemo(() => {
    return (newRoomKey) => {
      devLog("guessy createRoom", newRoomKey);
      if (newRoomKey.length !== 8) {
        console.warn("Invalid room key length:", newRoomKey);
        return;
      }
      const newMemes = memeSampler();
      const newRoomObject = {
        users: {},
        memeSet: newMemes,
        est: new Date(),
      };
      const requesterCard = randomCardKey(newMemes.allKeys);
      newRoomObject.users[uuidRef.current] = {
        playerCard: requesterCard,
        username: username,
      };
      updateRoomObject(newRoomObject);
      localStorage.setItem(`${newRoomKey}-player-card`, requesterCard);

      sendJsonMessage({
        type: "createRoom",
        newRoomObject: JSON.stringify(newRoomObject),
      });
    };
  }, [sendJsonMessage, uuidRef, username, updateRoomObject]);

  const replaceGame = useMemo(() => {
    return () => {
      devLog("Clearing game, new memes: ", newMemes);
      let newMemes = memeSampler();
      // generate a new set of memes and create a new room object
      let newRoomObject = { memeSet: newMemes, users: {}, est: new Date() };

      // assign each player a new playerCard
      Object.keys(roomObject["users"]).forEach((key) => {
        let newCard = randomCardKey(newMemes.allKeys);
        newRoomObject["users"][key].playerCard = newCard;
        if (key === uuidRef.current) {
          // if it's the current user, update the local storage
          localStorage.setItem(`${roomKey}-player-card`, newCard);
        }
      });

      updateRoomObject(newRoomObject); // update the room object with new memes and player cards

      // clean up local storage
      handleLocalStorage({
        type: "cleanUp",
        roomKey: roomKey,
        searchParams,
      });

      // send the new memes to the server
      sendJsonMessage({
        type: "replaceGame",
        roomKey: roomKey,
        newRoomObject: newRoomObject,
      });
    };
  }, [
    sendJsonMessage,
    uuidRef,
    roomObject,
    roomKey,
    updateRoomObject,
    searchParams,
  ]);

  const assignUsername = useMemo(() => {
    return (newUsername) => {
      devLog("assignUsername", newUsername);
      localStorage.setItem(`${roomKey}-username`, newUsername);
      updateRoomObject({
        users: {
          [uuidRef.current]: {
            username: newUsername,
          },
        },
      });
      sendJsonMessage({
        type: "setUsername",
        roomKey: roomKey,
        username: newUsername,
      });
    };
  }, [roomKey, sendJsonMessage, uuidRef, updateRoomObject]);

  // ** dispatchMessages function **

  const dispatchMessages = useMemo(() => {
    return ({ message, dispatchKey, dispatchUsername }) => {
      devLog("GuessyProvider dispatchMessages", message);
      handleMessages({
        message,
        send: sendJsonMessage,
        roomKey: dispatchKey || roomKey,
        username: dispatchUsername || username,
        roomObject,
        setRoomObject,
        uuidRef,
        setUuidRef,
        joinRoom,
        randomCardKey,
        createRoom,
      });
    };
  }, [
    sendJsonMessage,
    roomKey,
    username,
    roomObject,
    setRoomObject,
    uuidRef,
    setUuidRef,
    joinRoom,
    createRoom,
  ]);

  //  ** value for the context provider **

  const value = useMemo(() => {
    return {
      staticGifs,
      setStaticGifs,
      setRoomObject,
      assignUsername,
      createRoom,
      roomObject,
      replaceGame,
    };
  }, [
    assignUsername,
    staticGifs,
    setStaticGifs,
    setRoomObject,
    createRoom,
    roomObject,
    replaceGame,
  ]);

  // ** run logic **

  useEffect(() => {
    if (lastJsonMessageChanged) {
      dispatchMessages({
        message: lastJsonMessage,
      });
    }
  }, [lastJsonMessage, lastJsonMessageChanged, dispatchMessages]);

  return (
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };
