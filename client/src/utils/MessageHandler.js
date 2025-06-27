// import { memeSampler } from "../assets/memeCollection";
import { devLog } from "../utils/Helpers";
import { handleLocalStorage } from "./LocalStorageHandler";

// IMPORTANT: This function is to handle INCOMING messages from the WebSocket.

const handleMessages = ({
  message,
  send,
  roomKey,
  setRoomObject,
  uuid,
  setUuid,
  joinRoom,
  randomCardKey,
  createRoom,
}) => {
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

  const processRoomContents = (roomContents) => {
    // devLog(["processRoomContents", typeof roomContents, roomContents]);
    if (!roomContents) {
      devLog(["no roomContents to process!", roomContents]);
      return;
    }
    if (typeof roomContents === "string")
      roomContents = JSON.parse(roomContents);
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

  // **Username Functions**
  const sendUsername = (newUsername) => {
    send({
      type: "setUsername",
      roomKey: roomKey,
      newUsername,
    });
  };

  const assignUsername = (newName) => {
    localStorage.setItem(`${roomKey}-username`, newName);
    sendUsername(newName);
  };

  // **PlayerCard functions**

  const sendPlayerCard = (card) => {
    send({
      type: "setPlayerCard",
      roomKey: roomKey,
      card,
    });
  };

  const assignRandomPlayerCard = (keys) => {
    let newCard = randomCardKey(keys);
    devLog(["assignRandomPlayerCard", newCard]);
    sendPlayerCard(newCard);
    localStorage.setItem(`guessy-${roomKey}-player-card`, newCard);
  };

  const clearPlayerCards = () => {
    send({ type: "clearPlayerCards" });
  };

  //   **Message Handling**
  if (!message) return;
  switch (message["type"]) {
    case "noGameAlert":
      devLog(["Message Handler: noGameAlert: ", message.info]);
      createRoom(message.roomKey);
      break;
    case "replaceGame":
      devLog(["Message Handler: replaceGame", message]);
      if (!message.roomKey) return;
      processRoomContents(JSON.parse(message.newRoomObject));
      break;
    case "requestRoomKey":
      devLog(["Message Handler: requestRoomKey"]);
      send({
        type: "joinRoom",
        roomKey: message.roomKey,
      });
      break;
    case "roomContents":
      devLog(["Received room contents:", message.room]);
      processRoomContents(message.room);
      break;
    case "usersUpdate":
      devLog(["usersUpdate: ", message.users]);
      setRoomObject((prevRoomObject) => {
        let newRoomObject = { ...prevRoomObject };
        Object.keys(message.users).forEach((key) => {
          let messageUser = message.users[key];
          if (messageUser.playerCard && messageUser.playerCard != "undefined") {
            newRoomObject.users[key].playerCard = messageUser.playerCard;
          }
          if (messageUser.username && messageUser.username != "undefined") {
            newRoomObject.users[key].username = messageUser.username;
          }
        });
        return newRoomObject;
      });
      break;
    case "uuid":
      devLog(["Message Handler: uuid", message.uuid]);
      setUuid(message.uuid);
      break;
    default:
      devLog(["Unhandled message type:", message["type"], message]);
  }
};
export { handleMessages };
