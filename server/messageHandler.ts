// Handles incoming WebSocket messages and related logic
import {
  deepClone,
  emptyPlayerTemplate,
  pickRandomCard,
  nextGameKey,
  removePlayerFromRoom,
  deleteRoomIfEmpty,
} from "./roomManager";
import {
  broadcast,
  broadcastGameContents,
  sendToUuid,
  joinRoom,
} from "./broadcaster";
import type { Connections, Player } from "./broadcaster";
import type { Rooms } from "./roomManager";

import { validateMessagePayload } from "./types/messages";
import type { ChatEntry } from "./types/messages";

/** How many chat messages a room keeps (and sends to players). */
export const MAX_CHAT_HISTORY = 100;
import { allowMessage, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./rateLimiter";

export function handleMessage(
  bytes: Buffer,
  uuid: string,
  connection: any,
  rooms: Rooms,
  players: { [uuid: string]: Player },
  connections: Connections
): void {
  // Simple sanitization utility
  function sanitizeInput(str: any, maxLen = 256): string {
    if (typeof str !== "string") return "";
    // Remove control characters, trim, and limit length
    return str
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, maxLen);
  }
  // Every message counts towards the limit, including malformed ones.
  if (!allowMessage(uuid)) {
    sendToUuid(
      uuid,
      {
        type: "error",
        error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} messages per ${RATE_LIMIT_WINDOW_MS / 1000}s.`,
        uuid,
        time: new Date().toISOString(),
      },
      connections
    );
    return;
  }

  let message: any;
  try {
    message = JSON.parse(bytes.toString());
    // console.log("Message: ", message.type);

    // Message type validation
    const allowedTypes = [
      "chatMessage",
      "demotePlayer2",
      "setGame",
      "requestNewCard",
      "joinRoom",
      "leaveRoom",
    ];
    if (!message.type || !allowedTypes.includes(message.type)) {
      throw new Error("Invalid or missing message type.");
    }

    validateMessagePayload(message);

    let roomKey = message.roomKey;
    if (!roomKey) return;

    // Only joining creates a room; anything else for an unknown room is ignored.
    const room = rooms[roomKey];
    if (!room && message.type !== "joinRoom") return;
    let player = players[uuid];
    if (!player) {
      player = deepClone(emptyPlayerTemplate);
      players[uuid] = player;
    }

    let roomPlayerKeys = room ? Object.keys(room.players) : [];

    switch (message.type) {
      case "chatMessage": {
        const sender = room.players[uuid];
        if (!sender) return;
        // Build the stored entry ourselves: the name the player joined with (so
        // nobody can post as someone else), cleaned text, and the server's clock.
        // Any other fields the client sent are dropped.
        const entry: ChatEntry = {
          sender: sender.username ?? "",
          chatText: sanitizeInput(message.messageContents.chatText, 512),
          timestamp: Date.now(),
        };
        if (!entry.chatText) return;
        room.messageHistory = [...room.messageHistory, entry].slice(-MAX_CHAT_HISTORY);
        broadcast(
          roomKey,
          {
            type: "chatHistory",
            chatHistory: room.messageHistory,
            roomKey: roomKey,
            timeStamp: Date.now(),
          },
          uuid,
          rooms,
          connections
        );
        break;
      }
      case "demotePlayer2": {
        if (uuid !== room.player1Uuid) {
          sendToUuid(
            uuid,
            {
              type: "error",
              error: "Unauthorized: only player 1 can demote player 2.",
              uuid,
              time: new Date().toISOString(),
            },
            connections
          );
          return;
        }
        // Promote the first player who isn't already player 1 or 2. With no one
        // to promote, player 2 stays as is (an empty slot would just be refilled
        // by the next message from a non-player-1 user).
        const replacement = roomPlayerKeys.find(
          (u) => u !== room.player1Uuid && u !== room.player2Uuid
        );
        if (replacement) room.player2Uuid = replacement;
        broadcastGameContents(message.roomKey, rooms, connections);
        break;
      }
      case "setGame":
        if (!room.players[uuid]) return;
        // Once there's a game, only player 1 can replace it. Before that, anyone in
        // the room may deal (every joiner is told there's no game and deals one).
        if (room.allKeys.length > 0 && uuid !== room.player1Uuid) {
          sendToUuid(
            uuid,
            {
              type: "error",
              error: "Unauthorized: only player 1 can start a new game.",
              uuid,
              time: new Date().toISOString(),
            },
            connections
          );
          return;
        }
        room.roomKey = roomKey;
        room.columnsObject = { ...message.columnsObject };
        room.allKeys = message.allKeys.slice(0);
        room.gameKey = nextGameKey(room.gameKey);
        // New game: the server deals everyone in the room a fresh card.
        Object.keys(room.players).forEach((u) => {
          room.players[u].card = pickRandomCard(room.allKeys);
        });

        broadcastGameContents(message.roomKey, rooms, connections);
        break;
      case "requestNewCard": {
        if (!room || !room.players[uuid]) return;
        room.players[uuid].card = pickRandomCard(room.allKeys, room.players[uuid].card);
        broadcastGameContents(roomKey, rooms, connections);
        break;
      }
      case "leaveRoom":
        // The player navigated away from the room: remove them now rather than
        // waiting for a disconnect grace period that would never start.
        if (removePlayerFromRoom(room, uuid)) {
          deleteRoomIfEmpty(rooms, roomKey);
          broadcastGameContents(roomKey, rooms, connections);
        }
        break;
      case "joinRoom": {
        const sanitizedUsername = sanitizeInput(message.username, 64);
        joinRoom(
          {
            roomKey: message.roomKey,
            uuid,
            username: sanitizedUsername,
            card: message.card,
            gameKey: message.gameKey,
          },
          rooms,
          players,
          connections
        );
        break;
      }
      default:
        break;
    }
  } catch (error: any) {
    // Don't echo the raw input back, and only log a short preview of it.
    const errorMsg = {
      type: "error",
      error: error.message || String(error),
      uuid: uuid,
      time: new Date().toISOString(),
    };
    sendToUuid(uuid, errorMsg, connections);
    console.error("Rejected message:", errorMsg.error, "|", bytes.toString().slice(0, 200));
    return;
  }
}
