const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;
const { handleMessage } = require("./messageHandler");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};
const players = {};

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
  const room = rooms[roomKey];
  if (!room) return;
  Object.keys(room.players).forEach((uuid) => {
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
  const uuid = uuidv4();
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
    // player template assignment handled in messageHandler if needed
    console.log("connection established with uuid: ", uuid);
  }

  connection.on("message", (message) => {
    if (!uuid) {
      sendNewUuid(connection);
    } else {
      handleMessage(message, uuid, connection, rooms, players, connections);
    }
  });

  connection.on("close", () => {
    delete connections[uuid];
    Object.keys(rooms).forEach((roomKey) => {
      let room = rooms[roomKey];
      if (room.players[uuid]) {
        delete room.players[uuid];
        // Use broadcaster module for this if needed
        const { broadcastGameContents } = require("./broadcaster");
        broadcastGameContents(roomKey, rooms, connections);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
