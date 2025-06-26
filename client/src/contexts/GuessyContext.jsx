import { createContext, useMemo, useState, useEffect } from "react";
import { useWS } from "./useWS";
import { useSearchParams } from "react-router-dom";
import { handleMessages } from "../utils/MessageHandler";
import { memeSampler } from "../assets/memeCollection";
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [roomObject, setRoomObject] = useState({});
  const [searchParams] = useSearchParams();
  const [staticGifs, setStaticGifs] = useState(
    localStorage.getItem("guessy_gifs") == "true"
  );
  const { uuidRef, setUuidRef, sendJsonMessage, readyState, lastJsonMessage } =
    useWS();

  const roomKey = searchParams.get("roomKey");
  const username = searchParams.get("username");
  const { lastJsonMessageChanged } = useTraceUpdate({
    component: "GuessyProvider",
    lastJsonMessage,
  });

  const updateRoomObject = useMemo(() => {
    return (newRoomObject) => {
      console.log("updateRoomObject", newRoomObject);
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
      console.log("joinRoom");

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
      console.log("guessy createRoom", newRoomKey);
      if (newRoomKey.length !== 8) {
        console.warn("Invalid room key length:", newRoomKey);
        return;
      }
      const newMemes = memeSampler();
      const requesterCard = randomCardKey(newMemes.allKeys);

      sendJsonMessage({
        type: "createRoom",
        roomKey: newRoomKey,
        memeSet: newMemes,
        requesterCard,
        uuid: uuidRef.current,
      });

      const newRoomObject = {
        users: {},
        memeSet: newMemes,
        est: new Date(),
      };
      newRoomObject.users[uuidRef.current] = {
        playerCard: requesterCard,
        username: username,
      };

      updateRoomObject(newRoomObject);
      localStorage.setItem(`${newRoomKey}-player-card`, requesterCard);
    };
  }, [sendJsonMessage, uuidRef, username, updateRoomObject]);

  const assignUsername = useMemo(() => {
    return (newUsername) => {
      console.log("assignUsername", newUsername);
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
      console.log("GuessyProvider dispatchMessages", message);
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
    };
  }, [
    assignUsername,
    staticGifs,
    setStaticGifs,
    setRoomObject,
    createRoom,
    roomObject,
  ]);

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
