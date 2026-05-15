const {
  sendToUuid,
  broadcast,
  sendGameContentsToUuid,
  broadcastGameContents,
  noGameAlert,
  joinRoom,
} = require("../broadcaster");
const {
  deepClone,
  emptyRoomTemplate,
  emptyPlayerTemplate,
} = require("../roomManager");

describe("broadcaster", () => {
  let rooms, players, connections, uuid, connectionMock;

  beforeEach(() => {
    rooms = {};
    players = {};
    connections = {};
    uuid = "test-uuid";
    connectionMock = { send: jest.fn() };
    connections[uuid] = connectionMock;
  });

  it("sendToUuid should send JSON for objects", () => {
    sendToUuid(uuid, { type: "test", foo: "bar" }, connections);
    expect(connectionMock.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "test", foo: "bar" }),
    );
  });

  it("broadcast should send to all except excluded", () => {
    const uuid2 = "other-uuid";
    const conn2 = { send: jest.fn() };
    connections[uuid2] = conn2;
    rooms["room1"] = deepClone(emptyRoomTemplate);
    rooms["room1"].players[uuid] = {};
    rooms["room1"].players[uuid2] = {};
    broadcast("room1", { type: "msg" }, uuid2, rooms, connections);
    expect(connectionMock.send).toHaveBeenCalled();
    expect(conn2.send).not.toHaveBeenCalled();
  });

  it("noGameAlert should send alert", () => {
    noGameAlert("room1", uuid, "info", connections);
    expect(connectionMock.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "noGameAlert", roomKey: "room1", info: "info" }),
    );
  });

  it("joinRoom should add player and broadcast if valid", () => {
    rooms["room1"] = deepClone(emptyRoomTemplate);
    rooms["room1"].columnsObject = { a: 1 };
    rooms["room1"].allKeys = Array(24).fill("x");
    joinRoom(
      { roomKey: "room1", uuid, username: "user" },
      rooms,
      players,
      connections,
    );
    expect(players[uuid].username).toBe("user");
    expect(rooms["room1"].players[uuid].username).toBe("user");
  });
});
