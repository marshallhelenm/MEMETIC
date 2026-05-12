const {
  deepClone,
  emptyRoomTemplate,
  emptyPlayerTemplate,
} = require("./roomManager");

describe("roomManager", () => {
  it("deepClone should create a deep copy", () => {
    const obj = { a: 1, b: { c: 2 } };
    const clone = deepClone(obj);
    expect(clone).not.toBe(obj);
    expect(clone.b).not.toBe(obj.b);
    expect(clone).toEqual(obj);
  });

  it("emptyRoomTemplate should be a valid template", () => {
    expect(emptyRoomTemplate).toHaveProperty("roomKey");
    expect(emptyRoomTemplate).toHaveProperty("columnsObject");
    expect(emptyRoomTemplate).toHaveProperty("allKeys");
    expect(emptyRoomTemplate).toHaveProperty("players");
    expect(emptyRoomTemplate).toHaveProperty("player1Uuid");
    expect(emptyRoomTemplate).toHaveProperty("player2Uuid");
    expect(emptyRoomTemplate).toHaveProperty("messageHistory");
  });

  it("emptyPlayerTemplate should be a valid template", () => {
    expect(emptyPlayerTemplate).toHaveProperty("uuid");
    expect(emptyPlayerTemplate).toHaveProperty("username");
    expect(emptyPlayerTemplate).toHaveProperty("card");
  });
});
