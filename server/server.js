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

// ** Message Handling
const handleMessage = (bytes, uuid) => {
  let message;
  try {
    message = JSON.parse(bytes.toString());
    console.log("Message: ", message.type);
    // , "with data:", message

    let roomKey = message.roomKey;
    let room = rooms[roomKey];
    if (!room) room = { ...emptyRoomTemplate };
    let player1 = room.player1;
    let player2 = room.player2;
    let newRoomObject;

    switch (message.type) {
      case "acceptUuid":
        connections[uuid] = connection;
        console.log(`New connection established with UUID: ${uuid}`);
        break;
      case "clearPlayerCards":
        clearPlayerCards(message.roomKey, uuid);
        break;
      case "createRoom":
        if (!message.roomKey) return;
        newRoomObject = JSON.parse(message.newRoomObject);
        room = rooms[message.roomKey];
        if (!room) {
          room = { ...emptyRoomTemplate };
        }
        room.columnsObject = { ...newRoomObject.columnsObject };
        room.allKeys = newRoomObject.allKeys.slice(0);
        room.player1.card = newRoomObject.player1.card;
        room.player2.card = newRoomObject.player2.card;

        // for this player info, don't replace if this message has none but we have some saved
        if (newRoomObject.player1.username) {
          room.player1.username = newRoomObject.player1.username;
        }
        if (newRoomObject.player1.uuid) {
          room.player1.uuid = newRoomObject.player1.uuid;
        }
        if (newRoomObject.player2.username) {
          room.player2.username = newRoomObject.player2.username;
        }
        if (newRoomObject.player2.uuid) {
          room.player2.uuid = newRoomObject.player2.uuid;
        }

        broadcast(
          message.roomKey,
          {
            type: "roomContents",
            roomKey: message.roomKey,
            roomObject: JSON.stringify(room),
          },
          uuid
        );
        break;
      case "getRoomContents":
        if (!room) {
          noGameAlert(message.roomKey, uuid, "Room does not exist");
        } else if (
          !room.columnsObject ||
          Object.keys(room.columnsObject).length == 0
        ) {
          noGameAlert(message.roomKey, uuid, "No game in progress!");
        } else {
          sendRoomContentsToUuid(message.roomKey, uuid);
        }
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
  } catch (error) {
    try {
      broadcast(
        message.roomKey,
        {
          type: "serverError",
          roomKey: message.roomKey,
          error,
        },
        uuid
      );
    } catch (error) {
      console.error("Error parsing message:", error);
      return;
    }
    console.error("Error parsing message:", error);
    return;
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
    noGameAlert(roomKey, uuid, "Room does not exist");
    return;
  }
  sweepRoom(roomKey, uuid);
  // console.log(Object.keys(connections));

  let player1 = room.player1;
  let player2 = room.player2;

  if (player1.uuid && player2.uuid) {
    // 2 players already
    // this connection is already in there or will just be an observer
    // either way we send back the roomcontents if requested
    returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
    if (player1.uuid != uuid && player2.uuid != uuid) {
      room.observers.push(uuid);
    }
  } else if (player1.uuid === uuid || player2.uuid === uuid) {
    // 1 player, which is the current uuid
    // this connection is already in there, just send them back their data
    returnRoomContents && sendRoomContentsToUuid(roomKey, uuid);
  } else {
    // no players in the room at all or that match the currrent uuid
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
    } // no else here - that would mean there are 2 players, which is the first 'if' above

    player.uuid = uuid;
    if (username && username != "undefined") {
      player.username = username;
    }

    if (playerCard && playerCard != "undefined") {
      player.card = playerCard;
    }

    const validRoom =
      room.columnsObject && Object.keys(room.columnsObject).length > 0;
    if (returnRoomContents && validRoom) {
      // if a return of roomContents has been requested and there is a valid room to send
      sendRoomContentsToUuid(roomKey, uuid);
    } else if (!validRoom) {
      // if there is no valid room, send a noGameAlert
      noGameAlert(roomKey, uuid, "No game in progress");
    }
  }
};

// ** broadcast methods

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

const broadcast = (roomKey, message, uuidToExclude = null) => {
  // console.log(
  //   "broadcast: ",
  //   roomKey,
  //   "Exclude Uuid: ",
  //   uuidToExclude,
  //   JSON.stringify(message)
  // );

  const room = rooms[roomKey];
  if (!room) return;
  let player1 = room.player1;
  let player2 = room.player2;
  let recipients = [player1.uuid, player2.uuid, ...room.observers];
  // console.log("broadcasting to: ", recipients);

  recipients.forEach((u) => {
    // only send if (there is no uuid to exclude, or there is but it's not the current one) AND there is a connection for this uuid
    if ((!uuidToExclude || u != uuidToExclude) && connections[u])
      sendToUuid(u, message);
  });
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

const sendRoomContentsToUuid = (roomKey, uuid) => {
  const room = rooms[roomKey];
  sendToUuid(uuid, { type: "roomContents", room: room });
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
  uuid = uuidv4();
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
    console.log("connection established with uuid: ", uuid);
  }

  connection.on("message", (message) => {
    if (!uuid) {
      sendNewUuid(connection);
    } else {
      handleMessage(message, uuid);
    }
  });

  connection.on("close", () => {
    delete connections[uuid];
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
