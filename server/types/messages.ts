// Shared message types for client and server

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

/** One board arrangement: column number (from 1) -> the meme keys in that column. */
export type ColumnLayout = Record<number, string[]>;

/** The board arranged for every column count (1-6), keyed by column count. */
export type BoardLayouts = Record<number, ColumnLayout>;

export interface ChatMessage {
  type: "chatMessage";
  roomKey: string;
  messageContents: {
    sender: string;
    chatText: string;
    timestamp: number;
  };
}

export function isChatMessage(obj: unknown): obj is ChatMessage {
  if (!isRecord(obj) || obj.type !== "chatMessage" || typeof obj.roomKey !== "string") {
    return false;
  }
  const contents = obj.messageContents;
  return (
    isRecord(contents) &&
    typeof contents.sender === "string" &&
    typeof contents.chatText === "string" &&
    typeof contents.timestamp === "number"
  );
}

/** One line of chat as stored by the server. */
export type ChatEntry = ChatMessage["messageContents"];

export interface ChatHistoryMessage {
  type: "chatHistory";
  roomKey: string;
  chatHistory: ChatEntry[];
  timeStamp: number;
}



export interface DemotePlayer2Message {
  type: "demotePlayer2";
  roomKey: string;
}

export function isDemotePlayer2Message(obj: unknown): obj is DemotePlayer2Message {
  return (
    isRecord(obj) &&
    obj.type === "demotePlayer2" &&
    typeof obj.roomKey === "string"
  );
}   

export interface SetGameMessage {
  type: "setGame";
  roomKey: string;
  columnsObject: BoardLayouts;
  allKeys: string[];
}

/** Memes dealt per game. */
export const GAME_SIZE = 24;
/** The most columns the board is laid out for. */
export const MAX_COLUMNS = 6;
const MEME_KEY = /^[A-Za-z0-9_]{1,64}$/;

const sameKeys = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("\n") === [...b].sort().join("\n");

/** GAME_SIZE different, meme-shaped keys. */
export function isGameKeys(keys: unknown): keys is string[] {
  return (
    Array.isArray(keys) &&
    keys.length === GAME_SIZE &&
    keys.every((k) => typeof k === "string" && MEME_KEY.test(k)) &&
    new Set(keys).size === GAME_SIZE
  );
}

/**
 * A layout for every column count from 1 to MAX_COLUMNS: layout n has columns
 * 1..n, and between them those columns hold exactly `allKeys`.
 */
export function isBoardLayouts(layouts: unknown, allKeys: string[]): layouts is BoardLayouts {
  if (!isRecord(layouts) || Object.keys(layouts).length !== MAX_COLUMNS) return false;
  for (let count = 1; count <= MAX_COLUMNS; count++) {
    const layout = layouts[count];
    if (!isRecord(layout) || Object.keys(layout).length !== count) return false;
    const keys: string[] = [];
    for (let column = 1; column <= count; column++) {
      const cards = layout[column];
      if (!Array.isArray(cards) || !cards.every((k) => typeof k === "string")) return false;
      keys.push(...cards);
    }
    if (!sameKeys(keys, allKeys)) return false;
  }
  return true;
}

export function isSetGameMessage(obj: unknown): obj is SetGameMessage {
  return (
    isRecord(obj) &&
    obj.type === "setGame" &&
    typeof obj.roomKey === "string" &&
    isGameKeys(obj.allKeys) &&
    isBoardLayouts(obj.columnsObject, obj.allKeys)
  );
}

export interface JoinRoomMessage {
  type: "joinRoom";
  roomKey: string;
  username: string;
  /** The card this client last held in the room, used if the server has none. */
  card?: string;
  /** The game that `card` belongs to. */
  gameKey?: number | null;
}

export function isJoinRoomMessage(obj: unknown): obj is JoinRoomMessage {
  return (
    isRecord(obj) &&
    obj.type === "joinRoom" &&
    typeof obj.roomKey === "string" &&
    typeof obj.username === "string"
  );
}

export interface LeaveRoomMessage {
  type: "leaveRoom";
  roomKey: string;
}

export function isLeaveRoomMessage(obj: unknown): obj is LeaveRoomMessage {
  return isRecord(obj) && obj.type === "leaveRoom" && typeof obj.roomKey === "string";
}

export interface RequestNewCardMessage {
  type: "requestNewCard";
  roomKey: string;
}

export function isRequestNewCardMessage(obj: unknown): obj is RequestNewCardMessage {
  return isRecord(obj) && obj.type === "requestNewCard" && typeof obj.roomKey === "string";
}

// --- Extracted message payload validation ---
export function validateMessagePayload(message: { type?: unknown }) {
  switch (message.type) {
    case "chatMessage":
      if (!isChatMessage(message)) {
        throw new Error("Invalid or missing messageContents for chatMessage.");
      }
      break;
    case "demotePlayer2":
      if (!isDemotePlayer2Message(message)) {
        throw new Error("Missing or invalid roomKey for demotePlayer2.");
      }
      break;
    case "setGame":
      if (!isSetGameMessage(message)) {
        throw new Error("Missing or invalid fields for setGame.");
      }
      break;
    case "joinRoom":
      if (!isJoinRoomMessage(message)) {
        throw new Error("Missing or invalid fields for joinRoom.");
      }
      break;
    case "leaveRoom":
      if (!isLeaveRoomMessage(message)) {
        throw new Error("Missing or invalid roomKey for leaveRoom.");
      }
      break;
    case "requestNewCard":
      if (!isRequestNewCardMessage(message)) {
        throw new Error("Missing or invalid roomKey for requestNewCard.");
      }
      break;
    default:
      throw new Error("Unknown message type.");
  }
}

/** Messages the client sends to the server. */
export type ClientMessage =
  | ChatMessage
  | DemotePlayer2Message
  | JoinRoomMessage
  | LeaveRoomMessage
  | RequestNewCardMessage
  | SetGameMessage;

// --- Messages the server sends to the client ---

export interface PlayerState {
  uuid: string;
  username?: string;
  card?: string;
  /** False while the player's socket is down but they're still in the grace period. */
  connected?: boolean;
}

export interface GameContentsMessage {
  type: "gameContents";
  allKeys: string[];
  columnsObject: BoardLayouts;
  players: Record<string, PlayerState>;
  gameKey: number | null;
  player1Uuid: string | null;
  player2Uuid: string | null;
  chatHistory: ChatEntry[];
}

export interface NoGameAlertMessage {
  type: "noGameAlert";
  roomKey: string;
  info?: unknown;
}

/** Sent on connect: the public ID other players will see for this client. */
export interface WelcomeMessage {
  type: "welcome";
  playerId: string;
}

export interface ServerErrorMessage {
  type: "error";
  error: string;
}

export type ServerMessage =
  | GameContentsMessage
  | ChatHistoryMessage
  | NoGameAlertMessage
  | ServerErrorMessage
  | WelcomeMessage;
