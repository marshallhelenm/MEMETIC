const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;

const devLog = require("../client/src/utils/Helpers").devLog;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};

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

  switch (message.type) {
    case "clearPlayerCards":
      clearPlayerCards(message.roomKey, uuid);
      break;
    case "createRoom":
      console.log(
        "creating Room",
        message.roomKey
        // "users: ",
        // JSON.stringify(message.users)
      );
      if (!message.roomKey) return;
      rooms[message.roomKey] = {
        users: message.users || {},
        memeSet: message.memeSet || {},
        est: message.est || Date.now(),
      };
      // console.log("Created room:", message.roomKey, rooms[message.roomKey]);
      break;
    case "getRoomContents":
      sendRoomContentsToUuid(message.roomKey, uuid);
      break;
    case "joinRoom":
      // (roomKey, uuid, username, returnRoomContents)
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
      broadcast(outgoingMessage.roomKey, message, uuid);
      break;
    case "requestUuid":
      console.log("requestUuid for UUID:", uuid);
      sendToUuid(uuid, { type: "uuid", uuid: uuid });
      break;
    case "setPlayerCard":
      if (!rooms[message.roomKey]) return;
      if (!rooms[message.roomKey]["users"][uuid]) {
        rooms[message.roomKey]["users"][uuid] = {};
      }
      rooms[message.roomKey]["users"][uuid]["playerCard"] = message.playerCard;
      broadcastUsers(message.roomKey, uuid);
      break;
    case "setRoomContents":
    // if (!message.roomKey) requestRoomKey(uuid);
    // setRoomContents(
    //   {uuid,
    //   roomKey: message.roomKey,
    //   memeSet: JSON.stringify(message.memeSet),
    //   username:message.username,
    //   message.playerCard}
    // );
    // broadcast(
    //   message.roomKey,
    //   {
    //     type: "roomContents",
    //     room: JSON.stringify(rooms[message.roomKey]),
    //   },
    //   uuid
    // );
    // break;
    case "setUsername":
      console.log("setUsername", message.username);
      if (!rooms[message.roomKey]) return;
      let user = rooms[message.roomKey]["users"][uuid];
      if (!user) {
        rooms[message.roomKey]["users"][uuid] = {
          username: undefined,
          playerCard: undefined,
        };
      }
      user["username"] = message.username;
      broadcastUsers(message.roomKey, uuid);
      break;
    default:
      break;
  }
};

const handleClose = (uuid) => {
  delete connections[uuid];
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

const requestRoomKey = (uuid) => {
  sendToUuid(uuid, { type: "requestRoomKey" });
};

const sweepRoom = (roomKey) => {
  if (!rooms[roomKey]) return;
  const roomUsers = rooms[roomKey]["users"];
  Object.keys(roomUsers).forEach((u) => {
    if (!connections[u]) {
      delete roomUsers[u];
    }
  });
};

const sendRoomContentsToUuid = (roomKey, uuid) => {
  const room = rooms[roomKey];
  sendToUuid(uuid, { type: "roomContents", room: JSON.stringify(room) });
};

const broadcastUsers = (roomKey, uuid) => {
  broadcast(
    roomKey,
    { type: "usersUpdate", users: rooms[roomKey]["users"] },
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

const noRoomAlert = (roomKey, uuid) => {
  console.log("No room alert for room:", roomKey);
  const message = JSON.stringify({
    type: "noRoomAlert",
    roomKey: roomKey,
  });
  sendToUuid(uuid, message);
};

const broadcast = (roomKey, message, excludeUuid = null) => {
  const room = rooms[roomKey];
  if (!room) return;
  sweepRoom(roomKey);
  if (!room["users"]) return;
  Object.keys(room["users"]).forEach((u) => {
    if (!excludeUuid && u === excludeUuid) return;
    if (!connections[u]) return;
    // If the user is not connected, skip sending the message
    if (!room["users"][u]) return;
    // If the user is not in the room, skip sending the message
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
  console.log(
    "joinRoom",
    roomKey,
    "users: ",
    rooms[roomKey] && rooms[roomKey]["users"]
  );

  if (!room) {
    console.warn("Room does not exist:", roomKey);
    noGameAlert(roomKey, uuid, "Room does not exist");
    return;
  }

  sweepRoom(roomKey);
  const roomUsers = rooms[roomKey]["users"];
  if (Object.keys(roomUsers).length > 2) {
    console.log("room full");
    // this connection is already in there or will just be an observer
    sendRoomContentsToUuid(roomKey, uuid);
  } else if (!roomUsers[uuid]) {
    // user is not in server's room data. add them!
    roomUsers[uuid] = {};
    if (username) {
      roomUsers[uuid]["username"] = username;
    }
    if (playerCard && playerCard != "undefined") {
      roomUsers[uuid]["playerCard"] = playerCard;
    }
    if (returnRoomContents && Object.keys(room.memeSet).length > 0) {
      sendRoomContentsToUuid(roomKey, uuid);
    }
    if (!Object.keys(room.memeSet).length > 0) {
      noGameAlert(roomKey, uuid, "No game in progress", room.memeSet);
    }
    broadcastUsers(roomKey, uuid);
  }
};

const clearPlayerCards = (roomKey) => {
  if (!rooms[roomKey]) return;
  const roomUsers = rooms[roomKey]["users"];
  Object.keys(roomUsers).forEach((u) => {
    roomUsers[u].playerCard = undefined;
    sendToUuid(u, { type: "clearPlayerCard" });
  });
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
