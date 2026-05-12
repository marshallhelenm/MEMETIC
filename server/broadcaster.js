// Broadcast and send utilities, plus joinRoom logic
const {
  deepClone,
  emptyRoomTemplate,
  emptyPlayerTemplate,
} = require("./roomManager");

function sendToUuid(uuid, message, connections) {
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
}

function broadcast(roomKey, message, uuidToExclude, rooms, connections) {
  const room = rooms[roomKey];
  if (!room) return;
  Object.keys(room.players).forEach((u) => {
    if ((!uuidToExclude || u != uuidToExclude) && connections[u])
      sendToUuid(u, message, connections);
  });
}

function sendGameContentsToUuid(roomKey, uuid, rooms, connections) {
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
    connections,
  );
}

function broadcastGameContents(roomKey, rooms, connections) {
  const room = rooms[roomKey];
  if (!room) return;
  Object.keys(room.players).forEach((uuid) => {
    sendGameContentsToUuid(roomKey, uuid, rooms, connections);
  });
}

function noGameAlert(roomKey, uuid, info, connections) {
  console.log("No game alert for room:", roomKey);
  const message = {
    type: "noGameAlert",
    roomKey: roomKey,
    info: info,
  };
  sendToUuid(uuid, message, connections);
}

function joinRoom({ roomKey, uuid, username }, rooms, players, connections) {
  let room = rooms[roomKey];
  if (!room) {
    rooms[roomKey] = deepClone(emptyRoomTemplate);
    noGameAlert(roomKey, uuid, undefined, connections);
    return;
  }
  let player = players[uuid];
  if (!player) {
    players[uuid] = deepClone(emptyPlayerTemplate);
    player = players[uuid];
  }

  // Ensure room.players is always an object
  if (!room.players) room.players = {};

  Object.keys(room.players).forEach((u) => {
    if (u != uuid && !connections[u]) {
      delete room.players[u];
      delete players[u];
    }
  });

  let roomPlayer = room.players[uuid];
  if (!roomPlayer) {
    room.players[uuid] = deepClone(emptyPlayerTemplate);
    roomPlayer = room.players[uuid];
  }

  player.uuid = uuid;
  roomPlayer.uuid = uuid;

  if (username && username != "undefined") {
    player.username = username;
    roomPlayer.username = username;
  }

  const validRoom =
    room.columnsObject &&
    Object.keys(room.columnsObject).length > 0 &&
    room.allKeys.length == 24;

  if (validRoom) {
    broadcastGameContents(roomKey, rooms, connections);
  } else {
    noGameAlert(roomKey, uuid, undefined, connections);
  }
}

module.exports = {
  sendToUuid,
  broadcast,
  sendGameContentsToUuid,
  broadcastGameContents,
  noGameAlert,
  joinRoom,
};
