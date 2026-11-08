import { spawn, ChildProcess } from "child_process";
import path from "path";
import WebSocket from "ws";

// Runs the real server (server.ts) in a child process and talks to it over sockets.
const PORT = 40000 + Math.floor(Math.random() * 10000);
const GRACE_MS = 600;
const URL = `ws://localhost:${PORT}/ws`;
const keys = Array.from({ length: 24 }, (_, i) => `meme_${i}`);
const columnsObject = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };

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

function connect(uuid?: string): Promise<WebSocket> {
  const ws = new WebSocket(uuid ? `${URL}?uuid=${uuid}` : URL);
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

it("rejects a connection without a player ID", async () => {
  const ws = await connect();
  expect(await closed(ws)).toBe(4000);
});

it("keeps a player's card when they reconnect within the grace period", async () => {
  const first = await connect("int-a");
  const { players } = await startGame(first, "INTROOM1", "int-a");
  const card = players["int-a"].card;

  first.close();
  await wait(GRACE_MS / 3);
  const second = await connect("int-a");
  const contents = await rejoin(second, "INTROOM1", "int-a");

  expect(contents.players["int-a"].card).toBe(card);
});

it("removes a player who stays away longer than the grace period", async () => {
  const a = await connect("int-b");
  await startGame(a, "INTROOM2", "int-b");
  const b = await connect("int-c");
  await rejoin(b, "INTROOM2", "int-c");

  b.close();
  await wait(GRACE_MS * 2);
  const contents = await rejoin(a, "INTROOM2", "int-b");

  expect(contents.players["int-c"]).toBeUndefined();
});

it("marks a player as disconnected during the grace period", async () => {
  const a = await connect("int-d");
  await startGame(a, "INTROOM3", "int-d");
  const b = await connect("int-e");
  await rejoin(b, "INTROOM3", "int-e");

  const update = next(a, "gameContents");
  b.close();

  expect((await update).players["int-e"].connected).toBe(false);
});

it("closes the older socket when the same player connects again, and keeps them in the room", async () => {
  const older = await connect("int-f");
  const { players } = await startGame(older, "INTROOM4", "int-f");
  const olderClosed = closed(older);

  const newer = await connect("int-f");

  expect(await olderClosed).toBe(4001);
  const contents = await rejoin(newer, "INTROOM4", "int-f");
  expect(contents.players["int-f"].card).toBe(players["int-f"].card);
});
