const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;
// const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  console.log("Message: ", message.type, "from UUID:", uuid);

  switch (message.type) {
    case "setRoomContents":
      if (!message.roomKey) requestRoomKey(uuid);
      setRoomContents(
        uuid,
        message.roomKey,
        JSON.stringify(message.memeSet),
        message.username
      );
      broadcast(
        message.roomKey,
        {
          type: "roomContents",
          room: JSON.stringify(rooms[message.roomKey]),
        },
        uuid
      );
      break;
    case "getRoomContents":
      sendRoomContentsToUuid(message.roomKey, uuid);
      break;
    case "joinRoom":
      joinRoom(
        message.roomKey,
        uuid,
        message.username,
        message.returnRoomContents
      );
      break;
    case "createRoom":
      if (!message.roomKey) {
        return;
      }
      rooms[message.roomKey] = {
        users: {},
        memeSet: message.memeSet,
        est: new Date(),
      };
      rooms[message.roomKey]["users"][uuid] = {
        card: message.requesterCard,
        username: message.username,
      };
      break;
    case "setUsername":
      console.log("setUsername", message.username);
      if (!rooms[message.roomKey]) return;
      rooms[message.roomKey]["users"][uuid]["username"] = message.username;
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

const noGameAlert = (roomKey, uuid, info) => {
  console.log("No game alert for room:", roomKey);
  const message = JSON.stringify({
    type: "noGameAlert",
    roomKey: roomKey,
    info: info,
  });
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

const setRoomContents = (uuid, roomKey, memeSet, username) => {
  sweepRoom(roomKey);
  joinRoom(roomKey, uuid, username);
  rooms[roomKey]["memeSet"] = memeSet;
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

const joinRoom = (roomKey, uuid, username, returnRoomContents) => {
  const room = rooms[roomKey];
  console.log("joinRoom", roomKey, uuid, username, returnRoomContents);

  if (!room) {
    console.warn("Room does not exist:", roomKey);
    noGameAlert(roomKey, uuid, "Room does not exist");
    return;
  }

  sweepRoom(roomKey);
  const roomUsers = Object.keys(room["users"]);
  if (!roomUsers.includes(uuid)) {
    rooms[roomKey]["users"][uuid] = {
      username: username,
      card: "",
    };
    if (username) {
      rooms[roomKey]["users"][uuid]["username"] = username;
    }
    if (returnRoomContents) {
      console.log(
        "Returning room contents to UUID:",
        uuid,
        "room[memeSet]:",
        room["memeSet"]
      );

      if (room["memeSet"].length > 0) {
        sendRoomContentsToUuid(roomKey, uuid);
      } else {
        noGameAlert(roomKey, uuid, "No game in progress");
      }
    }
  }
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
