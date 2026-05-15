import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { handleMessage } from "./messageHandler";
import { broadcastGameContents } from "./broadcaster";
import type { Rooms } from "./roomManager";
import type { Connections, Player } from "./broadcaster";

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8080;

const connections: Connections = {};
const rooms: Rooms = {};
const players: { [uuid: string]: Player } = {};

// *server management
const sendNewUuid = (connection: WebSocket) => {
  console.log("sending new uuid");
  const uuid = uuidv4();
  connection.send(JSON.stringify({ type: "uuid", uuid: uuid }));
};

wsServer.on("connection", (connection: WebSocket, request: http.IncomingMessage) => {
  const searchParams = new URLSearchParams(request.url ? request.url.slice(1) : "");
  let uuid = searchParams.get("uuid");
  console.log("received uuid: ", uuid);

  if (!uuid || uuid === "null" || uuid === "undefined") {
    sendNewUuid(connection);
  } else {
    connections[uuid] = connection;
    let player = players[uuid];
    // player template assignment handled in messageHandler if needed
    console.log("connection established with uuid: ", uuid);
  }

  connection.on("message", (message: Buffer) => {
    if (!uuid) {
      sendNewUuid(connection);
    } else {
      handleMessage(message, uuid!, connection, rooms, players, connections);
    }
  });

  connection.on("close", () => {
    if (!uuid) return;
    delete connections[uuid];
    Object.keys(rooms).forEach((roomKey) => {
      let room = rooms[roomKey];
      if (room.players[uuid!]) {
        delete room.players[uuid!];
        broadcastGameContents(roomKey, rooms, connections);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
