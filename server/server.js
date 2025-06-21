const http = require('http')
const {WebSocketServer} = require("ws")
const uuidv4 = require("uuid").v4;
const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const users = {};
const rooms = {};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];

  switch (message.type) {
    case "setRoomContents":
      setRoomContents(uuid, message.roomKey, JSON.stringify(message.memeSet));
      broadcastRoom(message.roomKey);
      break;
    case "getRoomContents":
      returnRoomContents(message.roomKey, uuid);
      break;
    case "joinRoom":
      joinRoom(message.roomKey, uuid);
      break;
    default:
      break;
  }
};
const handleClose = (uuid) => {
  delete connections[uuid];
  delete users[uuid];
};

const sweepRoom = (roomKey) => {
  if (!rooms[roomKey]) return;
  const roomUsers = rooms[roomKey]["users"];
  roomUsers.forEach((u) => {
    if (!connections[u]) {
      const index = roomUsers.indexOf(u);
      if (index > -1) {
        roomUsers.splice(index, 1);
      }
    }
  });
};

const returnRoomContents = (roomKey, uuid) => {
  const room = rooms[roomKey];
  const connection = connections[uuid];
  const message = JSON.stringify(room);
  connection.send(message);
};

const noGameAlert = (roomKey, uuid) => {
  const connection = connections[uuid];
  const message = JSON.stringify({
    alert: "no game in room",
    roomKey: roomKey,
  });
  connection.send(message);
};

const getOrMakeRoom = (roomKey) => {
  if (!rooms[roomKey]) {
    rooms[roomKey] = {
      users: [],
      memeSet: [],
      est: new Date(),
    };
  }
  return rooms[roomKey];
};

const setRoomContents = (uuid, roomKey, memeSet) => {
  sweepRoom(roomKey);
  joinRoom(roomKey, uuid);
  rooms[roomKey]["memeSet"] = memeSet;
};

const broadcastRoom = (roomKey) => {
  const room = rooms[roomKey];
  if (!room) return;
  sweepRoom(roomKey);
  room["users"]?.forEach((u) => {
    const connection = connections[u];
    const message = JSON.stringify(room);
    connection.send(message);
  });
};

const joinRoom = (roomKey, uuid) => {
  let room = getOrMakeRoom(roomKey);
  sweepRoom(roomKey);
  const roomUsers = room["users"];
  if (!roomUsers.includes(uuid)) {
    rooms[roomKey]["users"] = [...roomUsers, uuid];
    if (room["memeSet"].length > 0) {
      returnRoomContents(roomKey, uuid);
    } else {
      noGameAlert(roomKey, uuid);
    }
  }
};

wsServer.on("connection", (connection, request) => {
  console.log("connection established");
  const { username, roomKey } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  connections[uuid] = connection;
  users[uuid] = {
    username,
    state: {},
  };

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

