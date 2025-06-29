const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 6969;

const connections = {};
const rooms = {};
const emptyRoomTemplate = {
  roomKey: undefined,
  columnsObject: {},
  allKeys: [],
  player1: {
    uuid: undefined,
    username: undefined,
    card: undefined,
  },
  player2: {
    uuid: undefined,
    username: undefined,
    card: undefined,
  },
  observers: [],
};

const handleMessage = (bytes, uuid) => {
  let message;
  try {
    message = JSON.parse(bytes.toString());
  } catch (error) {
    console.error("Error parsing message:", error);
    return;
  }

  console.log(
    "Message: ",
    message.type
    // "with data:",
    // message
  );

  let roomKey = message.roomKey?.toUpperCase();
  let room = rooms[roomKey];
  if (!room) room = { ...emptyRoomTemplate };
  let player1 = room.player1;
  let player2 = room.player2;
  let newRoomObject;
  let existingRoom;
  switch (message.type) {
    case "clearPlayerCards":
      clearPlayerCards(message.roomKey, uuid);
      break;
    case "createRoom":
      if (!message.roomKey) return;
      newRoomObject = JSON.parse(message.newRoomObject);
      rooms[message.roomKey] = {
        ...emptyRoomTemplate,
        ...newRoomObject,
      };
      player1 = { ...player1, ...newRoomObject.player1 };
      player2 = { ...player2, ...newRoomObject.player2 };
      break;
    case "getRoomContents":
      sendRoomContentsToUuid(message.roomKey, uuid);
      break;
    case "joinRoom":
      joinRoom({
        roomKey: message.roomKey,
        uuid,
        username: message.username,
        playerCard: message.playerCard,
        returnRoomContents: message.returnRoomContents,
      });
      break;
    case "replaceGame":
      newRoomObject = JSON.parse(message.newRoomObject);
      if (!message.roomKey) {
        return;
      }
      existingRoom = rooms[message.roomKey];
      rooms[message.roomKey] = { ...existingRoom, ...newRoomObject };
      broadcast(
        message.roomKey,
        {
          type: "replaceGame",
          roomKey: message.roomKey,
          room: JSON.stringify(rooms[message.roomKey]),
        },
        uuid
      );
      break;
    case "requestUuid":
      sendToUuid(uuid, { type: "uuid", uuid: uuid });
      break;
    case "setPlayerCard":
      if (!room) return;
      if (player1.uuid === uuid) {
        player1.card = message.playerCard;
      } else if (player2.uuid === uuid) {
        player2.card = message.playerCard;
      } else {
        // they're just an observer so don't set a card
        return;
      }
      broadcastUsers(message.roomKey, uuid);
      break;
    case "setUsername":
      if (!room) return;
      if (player1.uuid === uuid) {
        player1.username = message.username;
      } else if (player2.uuid === uuid) {
        player2.username = message.username;
      } else {
        // they're just an observer so don't set a username
        return;
      }
      broadcastUsers(roomKey, uuid);
      break;
    default:
      break;
  }
};

const sendToUuid = (uuid, message) => {
  if (!connections[uuid]) {
    console.warn(`No connection found for UUID: ${uuid}`);
    return;
  }
  if (typeof message === "string") {
    connections[uuid].send(message);
  } else {
    connections[uuid].send(JSON.stringify(message));
  }
};

const sweepRoom = (roomKey, uuidToKeep) => {
  let room = rooms[roomKey];
  if (!room) return;
  let player1 = room.player1;
  let player2 = room.player2;
  let keepPlayer1 = uuidToKeep && player1.uuid === uuidToKeep;
  let keepPlayer2 = uuidToKeep && player2.uuid === uuidToKeep;

  if (!connections[player1.uuid] && !keepPlayer1) {
    player1.card = undefined;
    player1.uuid = undefined;
  }
  if (!connections[player2.uuid] && !keepPlayer2) {
    player2.card = undefined;
    player2.uuid = undefined;
  }
};

const sendRoomContentsToUuid = (roomKey, uuid) => {
  const room = rooms[roomKey];
  sendToUuid(uuid, { type: "roomContents", room: room });
};

const broadcastUsers = (roomKey, uuid) => {
  let room = rooms[roomKey];
  broadcast(
    roomKey,
    {
      type: "usersUpdate",
      player1: room.player1,
      player2: room.player2,
    },
    uuid
  );
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

const broadcast = (roomKey, message, uuidToExclude = null) => {
  const room = rooms[roomKey];
  if (!room) return;
  let player1 = room.player1;
  let player2 = room.player2;
  let recipients = [player1.uuid, player2.uuid, ...room.observers];
  recipients.forEach((u) => {
    if (!uuidToExclude && u === uuidToExclude) return;
    if (!connections[u]) return;
    // If the user is not connected, skip sending the message
    sendToUuid(u, message);
  });
};

const joinRoom = ({
  roomKey,
  uuid,
  username,
  playerCard,
  returnRoomContents,
}) => {
  const room = rooms[roomKey];
  if (!room) {
    rooms[roomKey] = { ...emptyRoomTemplate };
    console.warn("Room does not exist:", roomKey);
    noGameAlert(roomKey, uuid, "Room does not exist");
    return;
  }
  sweepRoom(roomKey, uuid);
  let player1 = room.player1;
  let player2 = room.player2;

  if (player1.uuid && player2.uuid) {
    room.observers.push(uuid);
    // this connection is already in there or will just be an observer
    returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
  } else if (player1.uuid === uuid || player2.uuid === uuid) {
    // this connection is already in there, just send them back their data
    returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
  } else {
    // user is not in server's room data. add them!
    // remove from observers if they're in there
    if (room.observers.includes(uuid)) {
      room.observers.splice(room.observers.indexOf(uuid), 1);
    }
    let player;
    if (!player1.uuid) {
      player = player1;
    } else if (!player2.uuid) {
      player = player2;
    } else {
      // shouldn't be possible to get here. Room full!
      room.observers.push(uuid);
      returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
      return;
    }
    player.uuid = uuid;
    if (username && username != "undefined") {
      player.username = username;
    }

    if (playerCard && playerCard != "undefined") {
      player.card = playerCard;
    }

    if (
      returnRoomContents &&
      room.columnsObject &&
      Object.keys(room.columnsObject).length > 0
    ) {
      sendRoomContentsToUuid(roomKey, uuid);
    }
    if (!Object.keys(room.columnsObject).length > 0) {
      noGameAlert(roomKey, uuid, "No game in progress");
    }
    broadcastUsers(roomKey, uuid);
  }
};

// *server management

wsServer.on("connection", (connection, request) => {
  let uuid = new URLSearchParams(request.url.slice(1))["uuid"];
  if (!uuid) uuid = uuidv4();
  connections[uuid] = connection;
  console.log(`New connection established with UUID: ${uuid}`);
  sendToUuid(uuid, { type: "uuid", uuid: uuid });

  connection.on("message", (message) => {
    handleMessage(message, uuid);
  });

  connection.on("close", () => {
    delete connections[uuid];
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
