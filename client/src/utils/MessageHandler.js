import { memeSampler } from "../assets/memeCollection";

const handleMessages = ({
  message,
  send,
  roomKey,
  setRoomObject,
  uuidRef,
  setUuidRef,
  joinRoom,
  randomCardKey,
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

  const getRoomContents = () => {
    send({ type: "getRoomContents", roomKey: roomKey });
  };

  const handleNewRoom = (newRoomKey) => {
    console.log("messageHandler handleNewRoom", newRoomKey);
    if (newRoomKey.length !== 8) {
      console.warn("Invalid room key length:", newRoomKey);
      return;
    }
    joinRoom(newRoomKey);
    const new_memes = memeSampler();
    send({
      type: "setRoomContents",
      roomKey: newRoomKey,
      memeSet: new_memes,
    });
    let newPlayerCard = randomCardKey(new_memes["allKeys"]);
    sendPlayerCard(newPlayerCard);
    localStorage.setItem(`${roomKey}-player-card`, newPlayerCard);
  };

  const handleNewGame = (gameRoomKey) => {
    console.log("handleNewGame");
    joinRoom(gameRoomKey);
    const new_memes = memeSampler();
    send({
      type: "setRoomContents",
      roomKey: gameRoomKey,
      memeSet: new_memes,
    });
    assignRandomPlayerCard(new_memes["allKeys"]);
  };

  const processRoomContents = (roomContents) => {
    console.log("processRoomContents", roomContents);

    setRoomObject(JSON.parse(roomContents));
    let card;
    if (roomContents.users)
      card = roomContents.users[uuidRef.current]?.playerCard;
    if (!card) {
      assignRandomPlayerCard(roomContents["allKeys"]);
    } else {
      localStorage.setItem(`${roomKey}-player-card`, card);
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

  const assignPlayerCard = (card) => {
    sendPlayerCard(card);
    localStorage.setItem(`${roomKey}-player-card`, card);
  };

  const assignRandomPlayerCard = (keys) => {
    console.log("assignRandomPlayerCard", keys);

    let newCard = randomCardKey(keys);
    sendPlayerCard(newCard);
    localStorage.setItem(`${roomKey}-player-card`, newCard);
  };

  //   const handlePlayerCard = () => {
  //     let card = this.getPlayerCardLocal();
  //     if (!!roomObject && !card) assignRandomPlayerCard(roomObject["allKeys"]);
  //   };

  const clearPlayerCards = () => {
    send({ type: "clearPlayerCards" });
  };

  //   **Message Handling**
  if (!message) return;
  switch (message["type"]) {
    // case "assignUsername":
    //   console.log("Message Handler: assignUsername", message.username);
    //   assignUsername(message.newUsername);
    //   break;
    case "noGameAlert":
      console.log("Message Handler: noGameAlert");
      handleNewGame(message.roomKey);
      break;
    case "handleNewRoom":
      console.log("Message Handler: handleNewRoom", message.roomKey);
      handleNewRoom(message.roomKey);
      break;
    case "uuid":
      console.log("Message Handler: uuid", message.uuid);
      setUuidRef(message.uuid);
      break;
    case "requestRoomKey":
      console.log("Message Handler: requestRoomKey");
      send({
        type: "joinRoom",
        roomKey: message.roomKey,
      });
      break;
    case "roomContents":
      console.log("Received room contents:", message.room);
      processRoomContents(message.room);
      break;
    default:
      console.log("Unhandled message type:", message["type"], message);
  }
};
export { handleMessages };
