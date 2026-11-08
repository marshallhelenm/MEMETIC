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
  let message: any;
  try {
    message = JSON.parse(bytes.toString());
    // console.log("Message: ", message.type);

    // Message type validation
    const allowedTypes = [
      "chatMessage",
      "demotePlayer2",
      "setGame",
      "setPlayerCard",
      "requestNewCard",
      "joinRoom",
      "leaveRoom",
    ];
    if (!message.type || !allowedTypes.includes(message.type)) {
      throw new Error("Invalid or missing message type. Message: " + bytes.toString());
    }

    validateMessagePayload(message, bytes);

    // Basic in-memory rate limiting per user (after validation, before state access)
    const RATE_LIMIT_WINDOW_MS = 5000; // 5 seconds
    const RATE_LIMIT_MAX = 10; // max messages per window
    if (!(handleMessage as any).rateLimitMap) (handleMessage as any).rateLimitMap = {};
    const rateLimitMap = (handleMessage as any).rateLimitMap as Record<string, number[]>;
    const now = Date.now();
    if (!rateLimitMap[uuid]) {
      rateLimitMap[uuid] = [];
    }
    // Remove timestamps outside the window
    rateLimitMap[uuid] = rateLimitMap[uuid].filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS
    );
    if (rateLimitMap[uuid].length >= RATE_LIMIT_MAX) {
      const errorMsg = {
        type: "error",
        error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} messages per ${RATE_LIMIT_WINDOW_MS / 1000}s.`,
        uuid: uuid,
        time: new Date().toISOString(),
      };
      sendToUuid(uuid, errorMsg, connections);
      return;
    }
    rateLimitMap[uuid].push(now);

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
      case "chatMessage":
        connections[uuid] = connection;
        const sanitizedMsg = sanitizeInput(message.messageContents.chatText, 512);
        room.messageHistory = [...room.messageHistory, { ...message.messageContents, chatText: sanitizedMsg }];
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
      case "setPlayerCard": {
        // Only allow users to set their own card
        if (!room || !room.players[uuid]) return;
        // If message contains a uuid field, it must match the sender's uuid
        if (message.uuid && message.uuid !== uuid) {
          const errorMsg = {
            type: "error",
            error: "Unauthorized: cannot set another player's card.",
            uuid: uuid,
            time: new Date().toISOString(),
          };
          sendToUuid(uuid, errorMsg, connections);
          return;
        }
        // Only accept cards that are actually in this game.
        if (message.card && room.allKeys.includes(message.card)) {
          room.players[uuid].card = message.card;
        }
        broadcastGameContents(roomKey, rooms, connections);
        break;
      }
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
    const errorMsg = {
      type: "error",
      error: error.message || String(error),
      received: bytes.toString(),
      uuid: uuid,
      time: new Date().toISOString(),
    };
    sendToUuid(uuid, errorMsg, connections);
    console.error("Error parsing message:", errorMsg, error);
    return;
  }
}
