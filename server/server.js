const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};
const players = {};

const emptyRoomTemplate = {
  roomKey: undefined,
  columnsObject: {},
  allKeys: [],
  players: {},
  player1Uuid: null,
  player2Uuid: null,
};

const emptyPlayerTemplate = {
  uuid: undefined,
  username: undefined,
};

// ** Message Handling
const handleMessage = (bytes, uuid, connection) => {
  let message;
  try {
    message = JSON.parse(bytes.toString());
    console.log("Message: ", message.type);
    // console.log("Message: ", message.type, "with data:", message);

    let roomKey = message.roomKey;
    if (!roomKey) return;

    let room = rooms[roomKey];
    if (!room) {
      room = { ...emptyRoomTemplate };
    }
    if (!room.player1Uuid) {
      room.player1Uuid = uuid;
    } else if (!room.player2Uuid && room.player1Uuid != uuid) {
      room.player2Uuid = uuid;
    }
    let player = players[uuid];
    if (!player) player = { ...emptyPlayerTemplate };

    switch (message.type) {
      case "acceptUuid":
        connections[uuid] = connection;
        if (!player) players[uuid] = { ...emptyPlayerTemplate };
        console.log(`New connection established with UUID: ${uuid}`);
        break;
      case "setGame":
        if (!room) {
          room = { ...emptyRoomTemplate };
        }
        room.roomKey = roomKey;
        room.columnsObject = { ...message.columnsObject };
        room.allKeys = message.allKeys.slice(0);
        room.gameKey = message.gameKey;

        broadcastGameContents(message.roomKey);
        break;
      case "joinRoom":
        joinRoom({
          roomKey: message.roomKey,
          uuid,
          username: message.username,
        });
        break;
      case "requestUuid":
        sendToUuid(uuid, { type: "uuid", uuid: uuid });
        break;
      default:
        break;
    }
  } catch (error) {
    sendToUuid(uuid, JSON.stringify(error));
    console.error("Error parsing message:", error);
    return;
  }
};

const joinRoom = ({ roomKey, uuid, username }) => {
  const room = rooms[roomKey];
  if (!room) {
    rooms[roomKey] = { ...emptyRoomTemplate };
    noGameAlert(roomKey, uuid);
    return;
  }
  const player = players[uuid];
  if (!player) players[uuid] = { ...emptyPlayerTemplate };

  Object.keys(room.players).forEach((u) => {
    // sweep up room
    if (u != uuid && !connections[u]) {
      delete room.players[u];
      delete players[u];
    }
  });

  // add em
  if (!room.players[uuid]) room.players[uuid] = player.username;

  player.uuid = uuid;
  if (username && username != "undefined") {
    player.username = username;
  }

  const validRoom =
    room.columnsObject &&
    Object.keys(room.columnsObject).length > 0 &&
    room.allKeys.length == 24;

  if (validRoom) {
    broadcastGameContents(roomKey);
  } else {
    // if there is no valid room, send a noGameAlert
    noGameAlert(roomKey, uuid);
  }
};

// ** broadcast methods

const sendToUuid = (uuid, message) => {
  if (!connections[uuid]) {
    console.warn(`No connection found for UUID: ${uuid}`);
    return;
  }
  if (typeof message === "string") {
    connections[uuid].send(message);
  } else {
    console.log("sendToUuid: ", uuid, message.type);

    connections[uuid].send(JSON.stringify(message));
  }
};

const broadcast = (roomKey, message, uuidToExclude = null) => {
  const room = rooms[roomKey];
  if (!room) return;

  Object.keys(room.players).forEach((u) => {
    // only send if (there is no uuid to exclude, or there is but it's not the current one) AND there is a connection for this uuid
    if ((!uuidToExclude || u != uuidToExclude) && connections[u])
      sendToUuid(u, message);
  });
};

const sendGameContentsToUuid = (roomKey, uuid) => {
  const room = rooms[roomKey];
  sendToUuid(uuid, {
    type: "gameContents",
    allKeys: room.allKeys,
    columnsObject: room.columnsObject,
    players: room.players,
    gameKey: room.gameKey,
    player1Uuid: room.player1Uuid,
    player2Uuid: room.player2Uuid,
  });
};

const broadcastGameContents = (roomKey) => {
  Object.keys(rooms[roomKey].players).forEach((uuid) => {
    sendGameContentsToUuid(roomKey, uuid);
  });
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

// *server management

const sendNewUuid = (connection) => {
  console.log("sending new uuid");
  uuid = uuidv4();
  connection.send(JSON.stringify({ type: "uuid", uuid: uuid }));
};

wsServer.on("connection", (connection, request) => {
  const searchParams = new URLSearchParams(request.url.slice(1));
  let uuid = searchParams.get("uuid");
  console.log("received uuid: ", uuid);

  if (!uuid || uuid == "null" || uuid == "undefined") {
    sendNewUuid(connection);
  } else {
    connections[uuid] = connection;
    let player = players[uuid];
    if (!player) players[uuid] = { ...emptyPlayerTemplate };
    console.log("connection established with uuid: ", uuid);
  }

  connection.on("message", (message) => {
    if (!uuid) {
      sendNewUuid(connection);
    } else {
      handleMessage(message, uuid, connection);
    }
  });

  connection.on("close", () => {
    delete connections[uuid];
    Object.keys(rooms).forEach((roomKey) => {
      let room = rooms[roomKey];
      if (room.players[uuid]) {
        delete room.players[uuid];
        broadcastGameContents(roomKey);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
