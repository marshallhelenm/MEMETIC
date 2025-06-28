const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};
const emptyRoomTemplate = {
  roomKey: undefined,
  columnsObject: {},
  allKeys: [],
  player1: {
    uuid: undefined,
    username: undefined,
    card: undefined,
  },
  player2: {
    uuid: undefined,
    username: undefined,
    card: undefined,
  },
  observers: [],
};

const handleMessage = (bytes, uuid) => {
  let message;
  try {
    message = JSON.parse(bytes.toString());
  } catch (error) {
    console.error("Error parsing message:", error);
    return;
  }

  console.log(
    "Message: ",
    message.type,
    "from UUID:",
    uuid
    // "with data:",
    // message
  );
  let roomKey = message.roomKey;
  let room = rooms[roomKey];
  let player1 = room.player1;
  let player2 = room.player2;
  switch (message.type) {
    case "clearPlayerCards":
      clearPlayerCards(message.roomKey, uuid);
      break;
    case "createRoom":
      console.log("creating Room", message.roomKey);
      if (!message.roomKey) return;
      const newRoom = rooms[message.roomKey];
      newRoom = {
        ...emptyRoomTemplate,
        ...message.newRoomObject,
      };
      break;
    case "getRoomContents":
      sendRoomContentsToUuid(message.roomKey, uuid);
      break;
    case "joinRoom":
      // joinRoom params: { roomKey, uuid, username, playerCard, returnRoomContents }
      joinRoom({
        roomKey: message.roomKey,
        uuid,
        username: message.username,
        playerCard: message.playerCard,
        returnRoomContents: message.returnRoomContents,
      });
      break;
    case "replaceGame":
      const newRoomObject = JSON.parse(message.newRoomObject);
      console.log("replaceGame", message.roomKey, newRoomObject);
      if (!message.roomKey) {
        return;
      }
      const existingRoom = rooms[message.roomKey];
      rooms[message.roomKey] = { ...existingRoom, ...newRoomObject };
      const outgoingMessage = {
        type: "replaceGame",
        roomKey: message.roomKey,
        room: JSON.stringify(rooms[message.roomKey]),
      };
      broadcast(message.roomKey, message, uuid);
      break;
    case "requestUuid":
      console.log("requestUuid for UUID:", uuid);
      sendToUuid(uuid, { type: "uuid", uuid: uuid });
      break;
    case "setPlayerCard":
      if (!room) return;
      if (player1.uuid === uuid) {
        player1.card = message.playerCard;
      } else if (player2.uuid === uuid) {
        player2.card = message.playerCard;
      } else {
        // they're just an observer so don't set a card
        return;
      }
      broadcastUsers(message.roomKey, uuid);
      break;
    case "setUsername":
      console.log("setUsername", message.username);
      if (!room) return;
      if (player1.uuid === uuid) {
        player1.username = message.username;
      } else if (player2.uuid === uuid) {
        player2.username = message.username;
      } else {
        // they're just an observer so don't set a username
        return;
      }
      broadcastUsers(roomKey, uuid);
      break;
    default:
      break;
  }
};

const sendToUuid = (uuid, message) => {
  if (!connections[uuid]) {
    console.warn(`No connection found for UUID: ${uuid}`);
    return;
  }
  console.log(`Sending message to UUID: ${uuid}`, message);
  if (typeof message === "string") {
    connections[uuid].send(message);
  } else {
    connections[uuid].send(JSON.stringify(message));
  }
};

const sweepRoom = (roomKey) => {
  let room = rooms[roomKey];
  if (!room) return;
  let player1 = room.player1;
  if (!connections[player1.uuid]) {
    player1.card = undefined;
    player1.uuid = undefined;
  }
  let player2 = room.player2;
  if (!connections[player2.uuid]) {
    player2.card = undefined;
    player2.uuid = undefined;
  }
};

const sendRoomContentsToUuid = (roomKey, uuid) => {
  const room = rooms[roomKey];
  sendToUuid(uuid, { type: "roomContents", room: JSON.stringify(room) });
};

const broadcastUsers = (roomKey, uuid) => {
  let room = rooms[roomKey];
  broadcast(
    roomKey,
    {
      type: "usersUpdate",
      player1: room.player1,
      player2: room.player2,
    },
    uuid
  );
};

const noGameAlert = (roomKey, uuid, info) => {
  console.log("No game alert for room:", roomKey);
  const message = {
    type: "noGameAlert",
    roomKey: roomKey,
    info: info,
  };
  sendToUuid(uuid, message);
};

const broadcast = (roomKey, message, uuidToExclude = null) => {
  const room = rooms[roomKey];
  if (!room) return;
  sweepRoom(roomKey);
  let player1 = room.player1;
  let player2 = room.player2;
  let recipients = [player1.uuid, player2.uuid, ...room.observers];
  recipients.forEach((u) => {
    if (!uuidToExclude && u === uuidToExclude) return;
    if (!connections[u]) return;
    // If the user is not connected, skip sending the message
    sendToUuid(u, message);
  });
};

const joinRoom = ({
  roomKey,
  uuid,
  username,
  playerCard,
  returnRoomContents,
}) => {
  const room = rooms[roomKey];
  console.log("joinRoom", roomKey);

  if (!room) {
    console.warn("Room does not exist:", roomKey);
    noGameAlert(roomKey, uuid, "Room does not exist");
    return;
  }

  sweepRoom(roomKey);
  let player1 = room.player1;
  let player2 = room.player2;
  if (player1.uuid && player2.uuid) {
    console.log("room full");
    room.observers.push(uuid);
    // this connection is already in there or will just be an observer
    returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
  } else if (player1.uuid === uuid || player2.uuid === uuid) {
    console.log("user already in room");
    // this connection is already in there
    returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
  } else {
    // user is not in server's room data. add them!
    // TODO: remove user from observers if they're in there
    if (!player1.uuid) {
      let player = player1;
    } else if (!player2.uuid) {
      let player = player2;
    } else {
      // shouldn't be possible to get here. Room full!
      room.observers.push(uuid);
      returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
      return;
    }
    player.uuid = uuid;
    if (username && username != "undefined") {
      player.username = username;
    }
    if (playerCard && playerCard != "undefined") {
      player.card = playerCard;
    }
    if (returnRoomContents && Object.keys(room.columnSet).length > 0) {
      sendRoomContentsToUuid(roomKey, uuid);
    }
    if (!Object.keys(room.memeSet).length > 0) {
      noGameAlert(roomKey, uuid, "No game in progress", room.memeSet);
    }
    broadcastUsers(roomKey, uuid);
  }
};

// *server management

const handleClose = (uuid) => {
  delete connections[uuid];
};

wsServer.on("connection", (connection, request) => {
  const uuid = uuidv4();
  connections[uuid] = connection;
  console.log(`New connection established with UUID: ${uuid}`);
  sendToUuid(uuid, { type: "uuid", uuid: uuid });

  connection.on("message", (message) => {
    handleMessage(message, uuid);
  });
  connection.on("close", () => {
    handleClose(uuid);
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
