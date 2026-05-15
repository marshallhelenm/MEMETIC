const { handleMessage } = require("../messageHandler");
const {
  deepClone,
  emptyRoomTemplate,
  emptyPlayerTemplate,
} = require("../roomManager");

describe("handleMessage", () => {
  let rooms, players, connections, connectionMock, uuid;

  beforeEach(() => {
    rooms = {};
    players = {};
    connections = {};
    uuid = "test-uuid";
    connectionMock = { send: jest.fn() };
    connections[uuid] = connectionMock;
    // Reset rate limit
    if (handleMessage.rateLimitMap) handleMessage.rateLimitMap = {};
  });

  it("should reject unknown message types", () => {
    handleMessage(
      Buffer.from(JSON.stringify({ type: "badType" })),
      uuid,
      connectionMock,
      rooms,
      players,
      connections,
    );
    expect(connectionMock.send).toHaveBeenCalledWith(
      expect.stringContaining("Invalid or missing message type"),
    );
  });

  it("should sanitize chat messages", () => {
    const msg = {
      type: "chatMessage",
      roomKey: "room1",
      messageContents: "<script>alert(1)</script>",
    };
    rooms["room1"] = deepClone(emptyRoomTemplate);
    handleMessage(
      Buffer.from(JSON.stringify(msg)),
      uuid,
      connectionMock,
      rooms,
      players,
      connections,
    );
    expect(rooms["room1"].messageHistory[0]).not.toMatch(/[<>]/);
  });

  it("should enforce rate limiting", () => {
    const msg = {
      type: "chatMessage",
      roomKey: "room1",
      messageContents: "hi",
    };
    rooms["room1"] = deepClone(emptyRoomTemplate);
    for (let i = 0; i < 11; i++) {
      handleMessage(
        Buffer.from(JSON.stringify(msg)),
        uuid,
        connectionMock,
        rooms,
        players,
        connections,
      );
    }
    expect(connectionMock.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"error"'),
    );
    expect(connectionMock.send).toHaveBeenCalledWith(
      expect.stringContaining("Rate limit exceeded"),
    );
  });

  it("should not allow setPlayerCard for other users", () => {
    const msg = {
      type: "setPlayerCard",
      roomKey: "room1",
      card: "A",
      uuid: "other-uuid",
    };
    rooms["room1"] = deepClone(emptyRoomTemplate);
    rooms["room1"].players[uuid] = deepClone(emptyPlayerTemplate);
    handleMessage(
      Buffer.from(JSON.stringify(msg)),
      uuid,
      connectionMock,
      rooms,
      players,
      connections,
    );
    // Match the exact error string sent by handleMessage
    expect(connectionMock.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"error"'),
    );
    expect(connectionMock.send).toHaveBeenCalledWith(
      expect.stringContaining("Unauthorized: cannot set another player"),
    );
  });

  it("should allow joinRoom with sanitized username", () => {
    const msg = { type: "joinRoom", roomKey: "room1", username: " <bad> " };
    handleMessage(
      Buffer.from(JSON.stringify(msg)),
      uuid,
      connectionMock,
      rooms,
      players,
      connections,
    );
    expect(players[uuid].username).toBe("bad");
  });
});
