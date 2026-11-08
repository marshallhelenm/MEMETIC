import { deepClone, emptyRoomTemplate, emptyPlayerTemplate, fillRoles, removePlayer } from "../roomManager";
import type { Room, Rooms } from "../roomManager";
import { handleMessage } from "../messageHandler";

/** A room whose players joined in the given order, with roles as given. */
function roomWith(uuids: string[], p1: string | null, p2: string | null): Room {
  const room = deepClone(emptyRoomTemplate);
  uuids.forEach((u) => (room.players[u] = { ...deepClone(emptyPlayerTemplate), uuid: u }));
  room.player1Uuid = p1;
  room.player2Uuid = p2;
  return room;
}

const roles = (room: Room) => [room.player1Uuid, room.player2Uuid];

describe("fillRoles", () => {
  it("gives player 1 and 2 to the first two players to join", () => {
    const room = roomWith(["a", "b", "c"], null, null);
    fillRoles(room);
    expect(roles(room)).toEqual(["a", "b"]);
  });

  it("leaves roles alone while both role-holders are in the room", () => {
    const room = roomWith(["a", "b", "c"], "b", "c");
    fillRoles(room);
    expect(roles(room)).toEqual(["b", "c"]);
  });
});

describe("removePlayer", () => {
  it("hands player 1 to the longest-waiting observer, keeping player 2", () => {
    const rooms: Rooms = { R: roomWith(["a", "b", "c", "d"], "a", "b") };

    removePlayer(rooms, "a");

    expect(roles(rooms.R)).toEqual(["c", "b"]);
  });

  it("moves player 2 up to player 1 when there are no observers", () => {
    const rooms: Rooms = { R: roomWith(["a", "b"], "a", "b") };

    removePlayer(rooms, "a");

    expect(roles(rooms.R)).toEqual(["b", null]);
  });

  it("hands player 2 to the longest-waiting observer", () => {
    const rooms: Rooms = { R: roomWith(["a", "b", "c", "d"], "a", "b") };

    removePlayer(rooms, "b");

    expect(roles(rooms.R)).toEqual(["a", "c"]);
  });

  it("clears both roles when the last player leaves", () => {
    const rooms: Rooms = { R: roomWith(["a"], "a", null) };

    removePlayer(rooms, "a");

    expect(roles(rooms.R)).toEqual([null, null]);
  });

  it("only changes the rooms the player was in, and reports them", () => {
    const rooms: Rooms = {
      R1: roomWith(["a", "b"], "a", "b"),
      R2: roomWith(["c", "d"], "c", "d"),
    };

    expect(removePlayer(rooms, "a")).toEqual(["R1"]);
    expect(roles(rooms.R2)).toEqual(["c", "d"]);
  });
});

describe("taking a role", () => {
  const connections: any = {};
  const send = (rooms: Rooms, uuid: string, message: object) =>
    handleMessage(Buffer.from(JSON.stringify(message)), uuid, null, rooms, {}, connections);

  beforeEach(() => {
    (handleMessage as any).rateLimitMap = {};
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("does not give an empty slot to someone who sends a message without joining", () => {
    const rooms: Rooms = { R: roomWith(["a"], "a", null) };

    send(rooms, "stranger", { type: "requestNewCard", roomKey: "R" });

    expect(roles(rooms.R)).toEqual(["a", null]);
  });

  it("removes a player who leaves and hands on their role straight away", () => {
    const rooms: Rooms = { R: roomWith(["a", "b", "c"], "a", "b") };

    send(rooms, "a", { type: "leaveRoom", roomKey: "R" });

    expect(rooms.R.players.a).toBeUndefined();
    expect(roles(rooms.R)).toEqual(["c", "b"]);
  });

  it("ignores leaveRoom from someone who isn't in the room", () => {
    const rooms: Rooms = { R: roomWith(["a", "b"], "a", "b") };

    send(rooms, "stranger", { type: "leaveRoom", roomKey: "R" });

    expect(Object.keys(rooms.R.players)).toEqual(["a", "b"]);
    expect(roles(rooms.R)).toEqual(["a", "b"]);
  });

  it("gives an empty slot to the next player who joins", () => {
    const rooms: Rooms = { R: roomWith(["a"], "a", null) };

    send(rooms, "b", { type: "joinRoom", roomKey: "R", username: "b" });

    expect(roles(rooms.R)).toEqual(["a", "b"]);
  });
});
