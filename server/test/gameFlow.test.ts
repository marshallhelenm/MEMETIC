import { handleMessage } from "../messageHandler";
import { joinRoom } from "../broadcaster";
import { resetRateLimits } from "../rateLimiter";
import type { Rooms, Player } from "../roomManager";

const ROOM = "ROOM0001";
const keys = Array.from({ length: 24 }, (_, i) => `meme_${i}`);
const columnsObject = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };

let rooms: Rooms;
let players: Record<string, Player>;
let connections: Record<string, { send: jest.Mock }>;

/** Messages sent to a player, parsed. */
const inbox = (uuid: string) =>
  connections[uuid].send.mock.calls.map(([raw]) => JSON.parse(raw));
const lastOfType = (uuid: string, type: string) =>
  inbox(uuid).filter((m) => m.type === type).pop();

function connect(uuid: string) {
  connections[uuid] = { send: jest.fn() };
}

function send(uuid: string, message: object) {
  handleMessage(Buffer.from(JSON.stringify(message)), uuid, null, rooms, players, connections);
}

function join(uuid: string, extra: object = {}) {
  send(uuid, { type: "joinRoom", roomKey: ROOM, username: uuid, ...extra });
}

function deal(uuid: string, extra: object = {}) {
  send(uuid, { type: "setGame", roomKey: ROOM, columnsObject, allKeys: keys, ...extra });
}

beforeEach(() => {
  rooms = {};
  players = {};
  connections = {};
  resetRateLimits();
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe("joining and dealing", () => {
  it("tells the first player there is no game, then sends them the game they deal", () => {
    connect("a");
    join("a");
    expect(lastOfType("a", "noGameAlert")).toBeDefined();

    deal("a");

    const contents = lastOfType("a", "gameContents");
    expect(contents.allKeys).toEqual(keys);
    expect(keys).toContain(contents.players.a.card);
  });

  it("deals every player in the room a card from the new game", () => {
    ["a", "b"].forEach((u) => {
      connect(u);
      join(u);
    });

    deal("a");

    const { players: dealt } = lastOfType("b", "gameContents");
    expect(keys).toContain(dealt.a.card);
    expect(keys).toContain(dealt.b.card);
  });

  it("adds the player even when joinRoom has to create the room", () => {
    connect("a");

    joinRoom({ roomKey: "NEWROOM1", uuid: "a", username: "a" }, rooms, players, connections as any);

    expect(rooms.NEWROOM1.players.a).toBeDefined();
    expect(lastOfType("a", "noGameAlert")).toBeDefined();
  });
});

describe("who can deal", () => {
  beforeEach(() => {
    ["a", "b"].forEach((u) => {
      connect(u);
      join(u);
    });
  });

  it("lets any player deal while the room has no game", () => {
    deal("b");

    expect(rooms[ROOM].allKeys).toEqual(keys);
  });

  it("rejects a new game from player 2 once a game exists", () => {
    deal("a");
    const gameKey = rooms[ROOM].gameKey;

    deal("b", { allKeys: [...keys].reverse() });

    expect(rooms[ROOM].gameKey).toBe(gameKey);
    expect(lastOfType("b", "error").error).toMatch(/only player 1/);
  });

  it("lets player 1 start a new game", () => {
    deal("a");
    const gameKey = rooms[ROOM].gameKey!;

    deal("a");

    expect(rooms[ROOM].gameKey).toBeGreaterThan(gameKey);
  });

  it("ignores a deal from someone who isn't in the room", () => {
    connect("stranger");

    deal("stranger");

    expect(rooms[ROOM].allKeys).toEqual([]);
  });
});

describe("game keys", () => {
  it("assigns a time-based key and ignores one sent by the client", () => {
    connect("a");
    join("a");
    const before = Date.now();

    deal("a", { gameKey: 1 });

    expect(rooms[ROOM].gameKey).toBeGreaterThanOrEqual(before);
  });

  it("gives each new game a larger key", () => {
    connect("a");
    join("a");
    deal("a");
    const first = rooms[ROOM].gameKey!;

    deal("a");

    expect(rooms[ROOM].gameKey).toBeGreaterThan(first);
  });
});

describe("keeping and restoring cards", () => {
  beforeEach(() => {
    connect("a");
    join("a");
    deal("a");
  });

  it("keeps a player's card when they join again", () => {
    const card = rooms[ROOM].players.a.card;

    join("a");

    expect(rooms[ROOM].players.a.card).toBe(card);
  });

  it("restores a remembered card from the current game for a player with none", () => {
    connect("b");

    join("b", { card: "meme_7", gameKey: rooms[ROOM].gameKey });

    expect(rooms[ROOM].players.b.card).toBe("meme_7");
  });

  it("does not restore a card remembered from an earlier game", () => {
    connect("b");
    jest.spyOn(Math, "random").mockReturnValue(0); // deal meme_0 if the card is not restored

    join("b", { card: "meme_7", gameKey: rooms[ROOM].gameKey! - 1 });

    expect(rooms[ROOM].players.b.card).toBe("meme_0");
  });

  it("deals a different valid card on requestNewCard", () => {
    const old = rooms[ROOM].players.a.card;

    send("a", { type: "requestNewCard", roomKey: ROOM });

    const card = rooms[ROOM].players.a.card;
    expect(card).not.toBe(old);
    expect(keys).toContain(card);
  });

  it("rejects setPlayerCard with a card that is not in the game", () => {
    const old = rooms[ROOM].players.a.card;

    send("a", { type: "setPlayerCard", roomKey: ROOM, card: "not_a_meme" });

    expect(rooms[ROOM].players.a.card).toBe(old);
  });
});

describe("demoting player 2", () => {
  beforeEach(() => {
    ["a", "b"].forEach((u) => {
      connect(u);
      join(u);
    });
  });

  it("keeps player 2 when there is nobody to promote", () => {
    send("a", { type: "demotePlayer2", roomKey: ROOM });

    expect(rooms[ROOM].player2Uuid).toBe("b");
  });

  it("promotes the next player when player 1 demotes", () => {
    connect("c");
    join("c");

    send("a", { type: "demotePlayer2", roomKey: ROOM });

    expect(rooms[ROOM].player2Uuid).toBe("c");
  });

  it.each(["b", "c"])("rejects a demote request from %s (not player 1)", (requester) => {
    connect("c");
    join("c");

    send(requester, { type: "demotePlayer2", roomKey: ROOM });

    expect(rooms[ROOM].player2Uuid).toBe("b");
    expect(lastOfType(requester, "error").error).toMatch(/only player 1/);
  });
});
