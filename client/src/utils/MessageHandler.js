import { useEffect, useMemo } from "react";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";
import { handleLocalStorage } from "./LocalStorageHandler";
import { useRoomParser } from "../hooks/useRoomParser";

function MessageHandler() {
  const { roomKey, roomObject, setRoomObject, randomCardKey, createRoom } =
    useGuessy();
  const { lastJsonMessage, sendJsonMessage, uuid, setUuid } = useWS();
  const { lastJsonMessageChanged } = useTraceUpdate({ lastJsonMessage });
  const { validRoomObject } = useRoomParser({ roomObject, uuid });

  const processRoomContents = useMemo(() => {
    return (roomContents) => {
      if (!roomContents) {
        devLog(["no roomContents to process!", roomContents]);
        return;
      }
      if (typeof roomContents === "string") {
        roomContents = JSON.parse(roomContents);
      }
      devLog(["processRoomContents", typeof roomContents, roomContents]);

      setRoomObject((prev) => {
        return { ...prev, ...roomContents };
      });
      let card;
      if (roomContents.users) card = roomContents.users[uuid]?.playerCard;
      if (!card) {
        card = handleLocalStorage({ type: "getPlayerCard", roomKey });
        if (!card) {
          assignRandomPlayerCard(roomContents.memeSet.allKeys);
        }
      } else {
        localStorage.setItem(`guessy-${roomKey}-player-card`, card);
      }
    };
  }, [assignRandomPlayerCard, roomKey, setRoomObject, uuid]);

  // **Username Functions**
  function sendUsername(newUsername) {
    sendJsonMessage({
      type: "setUsername",
      roomKey: roomKey,
      newUsername,
    });
  }

  function assignUsername(newName) {
    localStorage.setItem(`${roomKey}-username`, newName);
    sendUsername(newName);
  }

  // **PlayerCard functions**

  const sendPlayerCard = useMemo(() => {
    return (card) => {
      sendJsonMessage({
        type: "setPlayerCard",
        roomKey: roomKey,
        card,
      });
    };
  }, [sendJsonMessage, roomKey]);

  const assignRandomPlayerCard = useMemo(() => {
    return (keys) => {
      let newCard = randomCardKey(keys);
      devLog(["assignRandomPlayerCard", newCard]);
      sendPlayerCard(newCard);
      localStorage.setItem(`guessy-${roomKey}-player-card`, newCard);
    };
  }, [randomCardKey, sendPlayerCard, roomKey]);

  const clearPlayerCards = () => {
    sendJsonMessage({ type: "clearPlayerCards" });
  };

  //   **Message Handling**
  const handleIncomingMessage = useMemo(() => {
    return (message) => {
      if (typeof message == "string") {
        message = JSON.parse(message);
      } else if (typeof message !== "object") {
        console.warn(
          "Message Handler: Invalid message received",
          typeof message,
          message
        );
        return;
      }

      if (!message) return;

      devLog(["MessageHandler handling message: ", message]);

      switch (message["type"]) {
        case "noGameAlert":
          createRoom(message.roomKey);
          break;
        case "replaceGame":
          if (!message.roomKey) return;
          processRoomContents(message.newRoomObject);
          break;
        case "requestRoomKey":
          sendJsonMessage({
            type: "joinRoom",
            roomKey: message.roomKey,
          });
          break;
        case "roomContents":
          processRoomContents(message.room);
          break;
        case "usersUpdate":
          if (!validRoomObject) return;
          console.log("valid room object in usersUpdate");

          // setRoomObject((prevRoomObject) => {
          //   let newRoomObject = { ...prevRoomObject };
          //   Object.keys(message.users).forEach((key) => {
          //     let messageUser = message.users[key];
          //     if (messageUser.playerCard && messageUser.playerCard != "undefined") {
          //       if (!newRoomObject.users) newRoomObject.users = {};
          //       newRoomObject.users[key].playerCard = messageUser.playerCard;
          //     }
          //     if (messageUser.username && messageUser.username != "undefined") {
          //       newRoomObject.users[key].username = messageUser.username;
          //     }
          //   });
          //   console.log("newRoomObject in usersUpdate: ", newRoomObject);

          //   return newRoomObject;
          // });
          break;
        case "uuid":
          setUuid(message.uuid);
          break;
        default:
          devLog(["Unhandled message type:", message["type"], message]);
      }
    };
  }, [
    createRoom,
    processRoomContents,
    sendJsonMessage,
    setUuid,
    validRoomObject,
  ]);

  useEffect(() => {
    if (lastJsonMessageChanged) handleIncomingMessage(lastJsonMessage);
  }, [handleIncomingMessage, lastJsonMessageChanged, lastJsonMessage]);
}

export default MessageHandler;
