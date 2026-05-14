// Handles incoming WebSocket messages and related logic
import {
  deepClone,
  emptyRoomTemplate,
  emptyPlayerTemplate,
} from "./roomManager.ts";
import {
  broadcast,
  broadcastGameContents,
  sendToUuid,
  joinRoom,
} from "./broadcaster.ts";
import type { Connections, Player } from "./broadcaster.ts";
import type { Rooms } from "./roomManager.ts";
import type {
  ChatMessage,
  JoinRoomMessage,
  RequestUuidMessage,
  SetGameMessage,
  SetPlayerCardMessage,
  AcceptUuidMessage,
  DemotePlayer2Message,
} from "../shared/types/messages.ts";

import { validateMessagePayload } from "../shared/types/messages.ts";

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
    console.log("Message: ", message.type);

    // Message type validation
    const allowedTypes = [
      "acceptUuid",
      "chatMessage",
      "demotePlayer2",
      "setGame",
      "setPlayerCard",
      "joinRoom",
      "requestUuid",
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
    if (
      !roomKey &&
      message.type !== "acceptUuid" &&
      message.type !== "requestUuid"
    )
      return;

    let room = rooms[roomKey];
    if (roomKey && !room) {
      room = deepClone(emptyRoomTemplate);
      rooms[roomKey] = room;
    }
    if (room && !room.player1Uuid) {
      room.player1Uuid = uuid;
    } else if (room && !room.player2Uuid && room.player1Uuid != uuid) {
      room.player2Uuid = uuid;
    }
    let player = players[uuid];
    if (!player) {
      player = deepClone(emptyPlayerTemplate);
      players[uuid] = player;
    }

    let roomPlayerKeys = room ? Object.keys(room.players) : [];

    switch (message.type) {
      case "acceptUuid":
        connections[uuid] = connection;
        if (!player) players[uuid] = deepClone(emptyPlayerTemplate);
        console.log(`New connection established with UUID: ${uuid}`);
        break;
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
      case "demotePlayer2":
        for (let i = 0; i < roomPlayerKeys.length; i++) {
          let u = roomPlayerKeys[i];
          if (u != room.player1Uuid && u != room.player2Uuid) {
            room.player2Uuid = u;
            break;
          }
        }
        broadcastGameContents(message.roomKey, rooms, connections);
        break;
      case "setGame":
        if (!room) {
          room = deepClone(emptyRoomTemplate);
        }
        room.roomKey = roomKey;
        room.columnsObject = { ...message.columnsObject };
        room.allKeys = message.allKeys.slice(0);
        room.gameKey = message.gameKey;

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
        if (message.card) room.players[uuid].card = message.card;
        broadcastGameContents(roomKey, rooms, connections);
        break;
      }
      case "joinRoom": {
        const sanitizedUsername = sanitizeInput(message.username, 64);
        joinRoom(
          {
            roomKey: message.roomKey,
            uuid,
            username: sanitizedUsername,
          },
          rooms,
          players,
          connections
        );
        break;
      }
      case "requestUuid":
        sendToUuid(uuid, { type: "uuid", uuid: uuid }, connections);
        break;
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
