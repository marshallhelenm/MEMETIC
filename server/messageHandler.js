// Handles incoming WebSocket messages and related logic
const {
  deepClone,
  emptyRoomTemplate,
  emptyPlayerTemplate,
} = require("./roomManager");

const {
  broadcast,
  broadcastGameContents,
  sendToUuid,
  joinRoom,
} = require("./broadcaster");

function handleMessage(bytes, uuid, connection, rooms, players, connections) {
  // Simple sanitization utility
  function sanitizeInput(str, maxLen = 256) {
    if (typeof str !== "string") return "";
    // Remove control characters, trim, and limit length
    return str
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, maxLen);
  }
  let message;
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
      throw new Error("Invalid or missing message type");
    }

    // Payload validation for each type
    switch (message.type) {
      case "acceptUuid":
        // No extra fields required
        break;
      case "chatMessage":
        if (
          typeof message.messageContents !== "string" ||
          message.messageContents.length === 0
        ) {
          throw new Error("Invalid or missing messageContents for chatMessage");
        }
        break;
      case "demotePlayer2":
        if (!message.roomKey || typeof message.roomKey !== "string") {
          throw new Error("Missing or invalid roomKey for demotePlayer2");
        }
        break;
      case "setGame":
        if (
          !message.roomKey ||
          typeof message.roomKey !== "string" ||
          !message.columnsObject ||
          typeof message.columnsObject !== "object" ||
          !Array.isArray(message.allKeys) ||
          typeof message.gameKey === "undefined"
        ) {
          throw new Error("Missing or invalid fields for setGame");
        }
        break;
      case "setPlayerCard":
        if (
          !message.roomKey ||
          typeof message.roomKey !== "string" ||
          typeof message.card === "undefined"
        ) {
          throw new Error("Missing or invalid fields for setPlayerCard");
        }
        break;
      case "joinRoom":
        if (
          !message.roomKey ||
          typeof message.roomKey !== "string" ||
          typeof message.username !== "string"
        ) {
          throw new Error("Missing or invalid fields for joinRoom");
        }
        break;
      case "requestUuid":
        // No extra fields required
        break;
      default:
        throw new Error("Unknown message type");
    }

    // Basic in-memory rate limiting per user (after validation, before state access)
    const RATE_LIMIT_WINDOW_MS = 5000; // 5 seconds
    const RATE_LIMIT_MAX = 10; // max messages per window
    if (!handleMessage.rateLimitMap) handleMessage.rateLimitMap = {};
    const now = Date.now();
    if (!handleMessage.rateLimitMap[uuid]) {
      handleMessage.rateLimitMap[uuid] = [];
    }
    // Remove timestamps outside the window
    handleMessage.rateLimitMap[uuid] = handleMessage.rateLimitMap[uuid].filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );
    if (handleMessage.rateLimitMap[uuid].length >= RATE_LIMIT_MAX) {
      const errorMsg = {
        type: "error",
        error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} messages per ${RATE_LIMIT_WINDOW_MS / 1000}s.`,
        uuid: uuid,
        time: new Date().toISOString(),
      };
      sendToUuid(uuid, errorMsg, connections);
      return;
    }
    handleMessage.rateLimitMap[uuid].push(now);

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
      case "chatMessage": {
        connections[uuid] = connection;
        const sanitizedMsg = sanitizeInput(message.messageContents, 512);
        room.messageHistory = [...room.messageHistory, sanitizedMsg];
        broadcast(
          roomKey,
          {
            type: "chatHistory",
            chatHistory: room.messageHistory,
            timeStamp: Date.now(),
          },
          uuid,
        );
        break;
      }
      case "demotePlayer2":
        for (let i = 0; i < roomPlayerKeys.length; i++) {
          let u = roomPlayerKeys[i];
          if (u != room.player1Uuid && u != room.player2Uuid) {
            room.player2Uuid = u;
            break;
          }
        }
        broadcastGameContents(message.roomKey, rooms);
        break;
      case "setGame":
        if (!room) {
          room = deepClone(emptyRoomTemplate);
        }
        room.roomKey = roomKey;
        room.columnsObject = { ...message.columnsObject };
        room.allKeys = message.allKeys.slice(0);
        room.gameKey = message.gameKey;

        broadcastGameContents(message.roomKey, rooms);
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
        broadcastGameContents(roomKey, rooms);
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
          connections,
        );
        break;
      }
      case "requestUuid":
        sendToUuid(uuid, { type: "uuid", uuid: uuid }, connections);
        break;
      default:
        break;
    }
  } catch (error) {
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

module.exports = { handleMessage };
