import { createContext, useMemo, useState } from "react";
import { useWS } from "./useWS";
import { useSearchParams } from "react-router-dom";
import { handleMessages } from "../utils/MessageHandler";
import { useCallback } from "react";
import { memeSampler } from "../assets/memeCollection";

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

  console.log("GuessyProvider rendered, lastJsonMessage: ", lastJsonMessage);

  const updateRoomObject = useCallback(
    (newRoomObject) => {
      console.log("updateRoomObject", newRoomObject);
      setRoomObject((prevRoomObject) => {
        return {
          ...prevRoomObject,
          ...newRoomObject,
        };
      });
    },
    [setRoomObject]
  );

  const joinRoom = useCallback(
    (username, joinKey = roomKey) => {
      console.log("joinRoom");

      sendJsonMessage({
        type: "joinRoom",
        roomKey: joinKey,
        username,
        returnRoomContents: roomObject ? true : false,
      });
    },
    [sendJsonMessage, roomKey, roomObject]
  );

  const randomCardKey = (keys) => {
    if (!keys) return;
    let min = Math.ceil(0);
    let max = Math.floor(23);
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    return keys[index];
  };

  const createRoom = useCallback(
    (newRoomKey) => {
      console.log("createRoom", newRoomKey);
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
      };

      setRoomObject(newRoomObject);
      localStorage.setItem(`${newRoomKey}-player-card`, requesterCard);
    },
    [sendJsonMessage, uuidRef]
  );

  const cleanUpLocalStorage = useMemo(() => {
    return (roomKey = searchParams.get("roomKey")) => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(roomKey)) {
          localStorage.removeItem(key);
        }
      });
    };
  }, [searchParams]);

  const getUsernameLocal = useMemo(() => {
    return (roomKey = searchParams.get("roomKey")) => {
      const localUsername = localStorage.getItem(`${roomKey}-username`);
      if (!!localUsername && localUsername != "undefined") {
        return localUsername;
      }
    };
  }, [searchParams]);

  const getPlayerCardLocal = useMemo(() => {
    return (roomKey = searchParams.get("roomKey")) => {
      const localPlayerCard = localStorage.getItem(`${roomKey}-player-card`);
      if (!localPlayerCard || localPlayerCard == "undefined") {
        return null;
      } else {
        return localPlayerCard;
      }
    };
  }, [searchParams]);

  const setPlayerCardLocal = useMemo(() => {
    return (card, roomKey = searchParams.get("roomKey")) => {
      localStorage.setItem(`${roomKey}-player-card`, card);
    };
  }, [searchParams]);

  const clearPlayerCardLocal = useMemo(() => {
    return (roomKey = searchParams.get("roomKey")) => {
      localStorage.removeItem(`${roomKey}-player-card`);
    };
  }, [searchParams]);

  const dispatchMessages = useMemo(() => {
    return ({ message, dispatchKey, dispatchUsername }) => {
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
  ]);

  const handleNewRoom = useMemo(() => {
    return (newRoomKey) => {
      dispatchMessages({
        message: { type: "handleNewRoom", roomKey: newRoomKey },
        dispatchKey: newRoomKey,
      });
    };
  }, [dispatchMessages]);

  const assignUsername = useCallback(
    (newUsername) => {
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
    },
    [roomKey, sendJsonMessage, uuidRef, updateRoomObject]
  );

  if (lastJsonMessage) {
    dispatchMessages({
      message: lastJsonMessage,
    });
  }

  const value = useMemo(() => {
    return {
      staticGifs,
      setStaticGifs,
      setRoomObject,
      cleanUpLocalStorage,
      getUsernameLocal,
      getPlayerCardLocal,
      handleNewRoom,
      assignUsername,
      createRoom,
      roomObject,
    };
  }, [
    assignUsername,
    staticGifs,
    setStaticGifs,
    setRoomObject,
    cleanUpLocalStorage,
    getUsernameLocal,
    getPlayerCardLocal,
    handleNewRoom,
    createRoom,
    roomObject,
  ]);

  return (
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };
