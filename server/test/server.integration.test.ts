import { spawn, ChildProcess } from "child_process";
import path from "path";
import WebSocket from "ws";

// Runs the real server (server.ts) in a child process and talks to it over sockets.
const PORT = 40000 + Math.floor(Math.random() * 10000);
const GRACE_MS = 600;
// 127.0.0.1, not localhost: the server listens on IPv4 (0.0.0.0), and on Node 18
// "localhost" resolves to IPv6 ::1 first without falling back.
const URL = `ws://127.0.0.1:${PORT}/ws`;
import { gameKeys as keys, layoutsFor } from "./helpers";
import { publicIdFor } from "../identity";

/** Each test player connects with a private secret; others see its public ID. */
const secretFor = (name: string) => `${name}-secret-for-tests`;
const id = (name: string) => publicIdFor(secretFor(name));

const columnsObject = layoutsFor(keys);

let server: ChildProcess;
const open: WebSocket[] = [];

beforeAll(async () => {
  server = spawn(process.execPath, ["-r", "ts-node/register/transpile-only", "server.ts"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, PORT: String(PORT), DISCONNECT_GRACE_MS: String(GRACE_MS) },
  });
  await new Promise<void>((resolve, reject) => {
    server.stdout!.on("data", (d) => String(d).includes("running") && resolve());
    server.on("exit", (code) => reject(new Error(`server exited with ${code}`)));
  });
}, 20000);

afterEach(() => open.splice(0).forEach((ws) => ws.close()));
afterAll(() => server.kill());

function connect(name?: string, secret = name && secretFor(name)): Promise<WebSocket> {
  const ws = new WebSocket(secret ? `${URL}?uuid=${secret}` : URL);
  open.push(ws);
  return new Promise((resolve) => ws.on("open", () => resolve(ws)));
}

function next(ws: WebSocket, type: string): Promise<any> {
  return new Promise((resolve) =>
    ws.on("message", function handler(raw) {
      const msg = JSON.parse(String(raw));
      if (msg.type === type) {
        ws.off("message", handler);
        resolve(msg);
      }
    })
  );
}

const closed = (ws: WebSocket) =>
  new Promise<number>((resolve) => ws.on("close", (code) => resolve(code)));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Joins a fresh room and deals a game; returns the game contents. */
async function startGame(ws: WebSocket, roomKey: string, uuid: string) {
  const alert = next(ws, "noGameAlert");
  ws.send(JSON.stringify({ type: "joinRoom", roomKey, username: uuid }));
  await alert;
  const contents = next(ws, "gameContents");
  ws.send(JSON.stringify({ type: "setGame", roomKey, columnsObject, allKeys: keys }));
  return contents;
}

async function rejoin(ws: WebSocket, roomKey: string, uuid: string) {
  const contents = next(ws, "gameContents");
  ws.send(JSON.stringify({ type: "joinRoom", roomKey, username: uuid }));
  return contents;
}

it("closes a connection that sends an oversized message", async () => {
  const ws = await connect("int-big");
  const wasClosed = closed(ws);

  ws.send("x".repeat(65 * 1024));

  expect(await wasClosed).toBe(1009); // "message too big"
});

it("stays up after a client sends a malformed frame", async () => {
  const bad = await connect("int-bad-frame");
  const wasClosed = closed(bad);

  // A masked frame with a reserved opcode (3): a protocol error.
  (bad as any)._socket.write(Buffer.from([0x83, 0x80, 0, 0, 0, 0]));
  await wasClosed;

  const probe = await connect("int-probe");
  expect(probe.readyState).toBe(WebSocket.OPEN);
});

it("rejects a connection without a player ID", async () => {
  const ws = await connect();
  expect(await closed(ws)).toBe(4000);
});

it("rejects a player ID that is too short to be a secret", async () => {
  const ws = await connect("short", "abc");
  expect(await closed(ws)).toBe(4000);
});

it("tells a client its public ID, which isn't its secret", async () => {
  const ws = new WebSocket(`${URL}?uuid=${secretFor("int-w")}`);
  open.push(ws);

  const welcome = await next(ws, "welcome");

  expect(welcome.playerId).toBe(id("int-w"));
  expect(welcome.playerId).not.toContain(secretFor("int-w"));
});

it("doesn't let someone who knows player 1's public ID connect as player 1", async () => {
  const p1 = await connect("int-victim");
  const { player1Uuid } = await startGame(p1, "INTROOM6", "int-victim");
  const victimClosed = jest.fn();
  p1.on("close", victimClosed);

  // An attacker in the room sees player 1's ID in gameContents and tries it.
  const attacker = await connect("attacker", player1Uuid);
  const contents = await rejoin(attacker, "INTROOM6", "attacker");

  expect(contents.player1Uuid).toBe(id("int-victim"));
  expect(contents.player1Uuid).not.toBe(publicIdFor(player1Uuid));
  expect(Object.keys(contents.players)).toHaveLength(2);
  await wait(100);
  expect(victimClosed).not.toHaveBeenCalled();
});

it("keeps a player's card when they reconnect within the grace period", async () => {
  const first = await connect("int-a");
  const { players } = await startGame(first, "INTROOM1", "int-a");
  const card = players[id("int-a")].card;

  first.close();
  await wait(GRACE_MS / 3);
  const second = await connect("int-a");
  const contents = await rejoin(second, "INTROOM1", "int-a");

  expect(contents.players[id("int-a")].card).toBe(card);
});

it("removes a player who stays away longer than the grace period", async () => {
  const a = await connect("int-b");
  await startGame(a, "INTROOM2", "int-b");
  const b = await connect("int-c");
  await rejoin(b, "INTROOM2", "int-c");

  b.close();
  await wait(GRACE_MS * 2);
  const contents = await rejoin(a, "INTROOM2", "int-b");

  expect(contents.players[id("int-c")]).toBeUndefined();
});

it("hands player 1 on when player 1 stays away longer than the grace period", async () => {
  const p1 = await connect("int-g");
  await startGame(p1, "INTROOM5", "int-g");
  const p2 = await connect("int-h");
  const joined = await rejoin(p2, "INTROOM5", "int-h");
  expect([joined.player1Uuid, joined.player2Uuid]).toEqual([id("int-g"), id("int-h")]);

  p1.close();
  await wait(GRACE_MS * 2);
  const contents = await rejoin(p2, "INTROOM5", "int-h");

  expect(contents.player1Uuid).toBe(id("int-h"));
});

it("marks a player as disconnected during the grace period", async () => {
  const a = await connect("int-d");
  await startGame(a, "INTROOM3", "int-d");
  const b = await connect("int-e");
  await rejoin(b, "INTROOM3", "int-e");

  const update = next(a, "gameContents");
  b.close();

  expect((await update).players[id("int-e")].connected).toBe(false);
});

it("closes the older socket when the same player connects again, and keeps them in the room", async () => {
  const older = await connect("int-f");
  const { players } = await startGame(older, "INTROOM4", "int-f");
  const olderClosed = closed(older);

  const newer = await connect("int-f");

  expect(await olderClosed).toBe(4001);
  const contents = await rejoin(newer, "INTROOM4", "int-f");
  expect(contents.players[id("int-f")].card).toBe(players[id("int-f")].card);
});
