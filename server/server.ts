import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { handleMessage } from "./messageHandler";
import { broadcastGameContents } from "./broadcaster";
import { removePlayer } from "./roomManager";
import { forgetPlayer } from "./rateLimiter";
import type { Rooms } from "./roomManager";
import type { Connections, Player } from "./broadcaster";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});
// Real messages are a few KB at most (setGame is the largest); refuse anything far bigger.
const MAX_MESSAGE_BYTES = 64 * 1024;
const wsServer = new WebSocketServer({ server, path: "/ws", maxPayload: MAX_MESSAGE_BYTES });
const port = Number(process.env.PORT) || 4020;

const connections: Connections = {};
const rooms: Rooms = {};
const players: { [uuid: string]: Player } = {};

// How long a disconnected player keeps their seat (and card) before being removed.
const DISCONNECT_GRACE_MS = Number(process.env.DISCONNECT_GRACE_MS) || 5 * 60 * 1000;
const removalTimers: { [uuid: string]: NodeJS.Timeout } = {};

const roomsWithPlayer = (uuid: string) =>
  Object.keys(rooms).filter((roomKey) => rooms[roomKey].players[uuid]);

const markDisconnected = (uuid: string) => {
  roomsWithPlayer(uuid).forEach((roomKey) => {
    rooms[roomKey].players[uuid].connected = false;
    broadcastGameContents(roomKey, rooms, connections);
  });

  clearTimeout(removalTimers[uuid]);
  removalTimers[uuid] = setTimeout(() => {
    delete removalTimers[uuid];
    if (connections[uuid]) return; // came back in time
    // Removes them from their rooms and hands on any player 1/2 role they held.
    removePlayer(rooms, uuid).forEach((roomKey) => {
      broadcastGameContents(roomKey, rooms, connections);
    });
    delete players[uuid];
    forgetPlayer(uuid);
  }, DISCONNECT_GRACE_MS);
};

wsServer.on("connection", (connection: WebSocket, request: http.IncomingMessage) => {
  const host = request.headers.host || "localhost";
  const requestUrl = new URL(request.url || "/ws", `http://${host}`);
  const uuid = requestUrl.searchParams.get("uuid");

  // Clients create their own player ID and must send it when connecting.
  if (!uuid || uuid === "null" || uuid === "undefined") {
    connection.send(JSON.stringify({ type: "error", error: "Missing player id" }));
    connection.close(4000, "Missing player id");
    return;
  }

  // A newer connection for the same player replaces the old one.
  const previous = connections[uuid] as WebSocket | undefined;
  connections[uuid] = connection;
  if (previous && previous !== connection) previous.close(4001, "Replaced by newer connection");

  // Cancel any pending removal; the client re-joins to resync its state.
  clearTimeout(removalTimers[uuid]);
  delete removalTimers[uuid];

  // Protocol errors (oversized or malformed frames) must not crash the server:
  // without a listener, Node throws on the "error" event. ws closes the socket.
  connection.on("error", (err) => {
    console.warn(`Socket error for ${uuid}:`, err.message);
  });

  connection.on("message", (message: Buffer) => {
    handleMessage(message, uuid, connection, rooms, players, connections);
  });

  connection.on("close", () => {
    // Ignore closes from connections that have already been replaced.
    if (connections[uuid] !== connection) return;
    delete connections[uuid];
    markDisconnected(uuid);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Websocket server is running on port ${port}`);
});
