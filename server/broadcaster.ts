// Broadcast and send utilities, plus joinRoom logic
import { deepClone, emptyRoomTemplate, emptyPlayerTemplate, ensureCard, fillRoles } from "./roomManager";
import type { Rooms, Player } from "./roomManager";

// Types for connections and rooms
export interface Connections {
  [uuid: string]: { send: (msg: string) => void };
}

export type { Player } from "./roomManager";

export function sendToUuid(uuid: string, message: any, connections: Connections): void {
  if (!connections[uuid]) {
    console.warn(`No connection found for UUID: ${uuid}`);
    return;
  }
  if (typeof message === "string") {
    connections[uuid].send(message);
  } else {
    // console.log("sendToUuid: ", uuid, message.type);
    connections[uuid].send(JSON.stringify(message));
  }
}

export function broadcast(
  roomKey: string,
  message: any,
  uuidToExclude: string | undefined,
  rooms: Rooms,
  connections: Connections
): void {
  const room = rooms[roomKey];
  if (!room) return;
  Object.keys(room.players).forEach((u) => {
    if ((!uuidToExclude || u !== uuidToExclude) && connections[u])
      sendToUuid(u, message, connections);
  });
}

export function sendGameContentsToUuid(
  roomKey: string,
  uuid: string,
  rooms: Rooms,
  connections: Connections
): void {
  const room = rooms[roomKey];
  sendToUuid(
    uuid,
    {
      type: "gameContents",
      allKeys: room.allKeys,
      columnsObject: room.columnsObject,
      players: room.players,
      gameKey: room.gameKey,
      player1Uuid: room.player1Uuid,
      player2Uuid: room.player2Uuid,
      chatHistory: room.messageHistory,
    },
    connections
  );
}

export function broadcastGameContents(
  roomKey: string,
  rooms: Rooms,
  connections: Connections
): void {
  const room = rooms[roomKey];
  if (!room) return;
  Object.keys(room.players).forEach((uuid) => {
    // Disconnected players (in their grace period) catch up when they re-join.
    if (connections[uuid]) sendGameContentsToUuid(roomKey, uuid, rooms, connections);
  });
}

export function noGameAlert(
  roomKey: string,
  uuid: string,
  info: any,
  connections: Connections
): void {
  // console.log("No game alert for room:", roomKey);
  const message = {
    type: "noGameAlert",
    roomKey: roomKey,
    info: info,
  };
  sendToUuid(uuid, message, connections);
}

export function joinRoom(
  {
    roomKey,
    uuid,
    username,
    card,
    gameKey,
  }: { roomKey: string; uuid: string; username?: string; card?: any; gameKey?: any },
  rooms: Rooms,
  players: { [uuid: string]: Player },
  connections: Connections
): void {
  if (!rooms[roomKey]) rooms[roomKey] = deepClone(emptyRoomTemplate);
  const room = rooms[roomKey];
  let player = players[uuid];
  if (!player) {
    players[uuid] = deepClone(emptyPlayerTemplate);
    player = players[uuid];
  }

  // Ensure room.players is always an object
  if (!room.players) room.players = {};

  let roomPlayer = room.players[uuid];
  if (!roomPlayer) {
    room.players[uuid] = deepClone(emptyPlayerTemplate);
    roomPlayer = room.players[uuid];
  }

  player.uuid = uuid;
  roomPlayer.uuid = uuid;
  roomPlayer.connected = true;
  // Joining is the only way to take an empty player 1 or 2 slot.
  fillRoles(room);

  if (username && username !== "undefined") {
    player.username = username;
    roomPlayer.username = username;
  }

  const validRoom =
    room.columnsObject &&
    Object.keys(room.columnsObject).length > 0 &&
    room.allKeys.length === 24;

  if (validRoom) {
    // Joining (or re-joining after a reconnect) keeps an existing card;
    // only players without one for this game get dealt a new one.
    // If the server has no card for this player but the client remembers one
    // from the current game (e.g. after a server restart), use it.
    if (
      !roomPlayer.card &&
      card != null &&
      gameKey == room.gameKey &&
      room.allKeys.includes(card)
    ) {
      roomPlayer.card = card;
    }
    ensureCard(room, uuid);
    broadcastGameContents(roomKey, rooms, connections);
  } else {
    noGameAlert(roomKey, uuid, undefined, connections);
  }
}
