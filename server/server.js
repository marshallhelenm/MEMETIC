const http = require('http')
const {WebSocketServer} = require("ws")
const uuidv4 = require("uuid").v4;
// const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  console.log("Message: ", message);

  switch (message.type) {
    case "setRoomContents":
      setRoomContents(
        uuid,
        message.roomKey,
        JSON.stringify(message.memeSet),
        message.username
      );
      broadcastRoom(message.roomKey);
      break;
    case "getRoomContents":
      returnRoomContents(message.roomKey, uuid);
      break;
    case "joinRoom":
      joinRoom(message.roomKey, uuid, message.username);
      break;
    case "setUsername":
      setUsername(message.roomKey, uuid, message.username);
      break;
    case "setPlayerCard":
      setPlayerCard(message.roomKey, uuid, message.playerCard);
      break;
    case "clearPlayerCards":
      clearPlayerCards(message.roomKey, uuid);
      break;
    default:
      break;
  }
};

const handleClose = (uuid) => {
  delete connections[uuid];
};

const sendToUuid = (uuid, message) => {
  connections[uuid].send(JSON.stringify(message));
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

const returnRoomContents = (roomKey, uuid) => {
  const room = rooms[roomKey];
  sendToUuid(uuid, { type: "roomContents", room: JSON.stringify(room) });
};

const noGameAlert = (roomKey, uuid) => {
  const message = JSON.stringify({
    type: "noGameAlert",
    roomKey: roomKey,
  });
  sendToUuid(uuid, message);
};

const getOrMakeRoom = (roomKey) => {
  if (!rooms[roomKey]) {
    rooms[roomKey] = {
      users: {},
      memeSet: [],
      est: new Date(),
    };
  }
  return rooms[roomKey];
};

const setRoomContents = (uuid, roomKey, memeSet, username) => {
  sweepRoom(roomKey);
  joinRoom(roomKey, uuid, username);
  rooms[roomKey]["memeSet"] = memeSet;
};

const broadcastRoom = (roomKey) => {
  const room = rooms[roomKey];
  if (!room) return;
  sweepRoom(roomKey);
  if (!room["users"]) return;
  Object.keys(room["users"]).forEach((u) => {
    const message = {
      type: "roomContents",
      room: JSON.stringify(room),
    };
    sendToUuid(uuid, message);
  });
};

const joinRoom = (roomKey, uuid, username) => {
  let room = getOrMakeRoom(roomKey);
  sweepRoom(roomKey);
  const roomUsers = Object.keys(room["users"]);
  if (!roomUsers.includes(uuid)) {
    rooms[roomKey]["users"][uuid] = {
      username: username,
      card: "",
    };
    if (room["memeSet"].length > 0) {
      returnRoomContents(roomKey, uuid);
    } else {
      noGameAlert(roomKey, uuid);
    }
  }
};

const setUsername = (roomKey, uuid, username) => {
  if (!rooms[roomKey]) return;
  if (!rooms[roomKey]["users"][uuid]) {
    rooms[roomKey]["users"][uuid] = {};
  }
  rooms[roomKey]["users"][uuid]["username"] = username;
};

const setPlayerCard = (roomKey, uuid, playerCard) => {
  if (!rooms[roomKey]) return;
  if (!rooms[roomKey]["users"][uuid]) {
    rooms[roomKey]["users"][uuid] = {};
  }
  rooms[roomKey]["users"][uuid]["playerCard"] = playerCard;
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
  sendToUuid(uuid, { type: "uuid", uuid: uuid });

  connection.on("message", (message) => {
    handleMessage(message, uuid);
  });
  connection.on("close", () => {
    handleClose(uuid);
  });
});

server.listen(port, ()=>{
    console.log(`Websocket server is running on port ${port}`)
})

