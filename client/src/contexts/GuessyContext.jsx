import { createContext, useMemo, useState, useEffect } from "react";
import { useWS } from "./useWS";
import { useSearchParams } from "react-router-dom";
import { handleMessages } from "../utils/MessageHandler";
import { memeSampler } from "../assets/memeCollection";
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog, waitUntil } from "../utils/Helpers";

const GuessyContext = createContext();

function GuessyProvider({ children }) {
  const [roomObject, setRoomObject] = useState({});
  const [searchParams] = useSearchParams();
  const [staticGifs, setStaticGifs] = useState(
    localStorage.getItem("guessy_gifs") == "true"
  );
  const { uuid, setUuid, sendJsonMessage, readyState, lastJsonMessage } =
    useWS();
  const { lastJsonMessageChanged } = useTraceUpdate(
    {
      component: "GuessyProvider",
      lastJsonMessage,
    },
    false
  );
  const roomKey = searchParams.get("roomKey");
  const username = searchParams.get("username");

  // ** useMemo functions **
  const updateRoomObject = useMemo(() => {
    return (newRoomObject) => {
      // devLog(["updateRoomObject", newRoomObject]);
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

  const requestUuid = useMemo(() => {
    return () => {
      devLog("requestUuid");
      sendJsonMessage({
        type: "requestUuid",
      });
    };
  }, [sendJsonMessage]);

  const createRoom = useMemo(() => {
    return async function (newRoomKey) {
      devLog(["createRoom called with newRoomKey:", newRoomKey]);
      const newMemes = memeSampler();
      const newRoomObject = {
        users: {},
        memeSet: newMemes,
        est: new Date(),
      };
      const requesterCard = randomCardKey(newMemes.allKeys);

      let start = Date.now();
      let uuidExists = await waitUntil(typeof uuid === "string", () => {
        requestUuid();
      });
      devLog(["waitUntil for uuid", uuid, "took", Date.now() - start, "ms"]);
      if (uuidExists) {
        devLog(["uuid exists, continue with createRoom:", uuid]);
        newRoomObject.users[uuid] = {
          playerCard: requesterCard,
          username: username,
        };
      }
      updateRoomObject(newRoomObject);
      localStorage.setItem(`${newRoomKey}-player-card`, requesterCard);

      sendJsonMessage({
        type: "createRoom",
        roomKey: newRoomKey,
        ...newRoomObject,
      });
    };
  }, [sendJsonMessage, uuid, username, updateRoomObject, requestUuid]);

  const replaceGame = useMemo(() => {
    return () => {
      devLog(["Clearing game, new memes: ", newMemes]);
      let newMemes = memeSampler();
      // generate a new set of memes and create a new room object
      let newRoomObject = { memeSet: newMemes, users: {}, est: new Date() };

      // assign each player a new playerCard
      Object.keys(roomObject["users"]).forEach((key) => {
        let newCard = randomCardKey(newMemes.allKeys);
        newRoomObject["users"][key].playerCard = newCard;
        if (key === uuid) {
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
    uuid,
    roomObject,
    roomKey,
    updateRoomObject,
    searchParams,
  ]);

  const assignUsername = useMemo(() => {
    return (newUsername) => {
      devLog(["assignUsername", newUsername]);
      localStorage.setItem(`${roomKey}-username`, newUsername);
      updateRoomObject({
        users: {
          [uuid]: {
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
  }, [roomKey, sendJsonMessage, uuid, updateRoomObject]);

  // ** dispatchMessages function **

  const dispatchMessages = useMemo(() => {
    return ({ message, dispatchKey, dispatchUsername }) => {
      // devLog(["GuessyProvider dispatchMessages", message]);
      handleMessages({
        message,
        send: sendJsonMessage,
        roomKey: dispatchKey || roomKey,
        username: dispatchUsername || username,
        roomObject,
        setRoomObject,
        uuid,
        setUuid,
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
    uuid,
    setUuid,
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
