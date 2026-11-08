// Shared message types for client and server

export interface ChatMessage {
  type: "chatMessage";
  roomKey: string;
  messageContents: {
    sender: string;
    chatText: string;
    timestamp: number;
  };
}

export function isChatMessage(obj: any): obj is ChatMessage {
  return (
    obj &&
    obj.type === "chatMessage" &&
    typeof obj.roomKey === "string" &&
    typeof obj.messageContents === "object" &&
    obj.messageContents !== null &&
    typeof obj.messageContents.sender === "string" &&
    typeof obj.messageContents.chatText === "string" &&
    typeof obj.messageContents.timestamp === "number"
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

export function isDemotePlayer2Message(obj: any): obj is DemotePlayer2Message {
  return (
    obj &&
    obj.type === "demotePlayer2" &&
    typeof obj.roomKey === "string"
  );
}   

export interface SetGameMessage {
  type: "setGame";
  roomKey: string;
  columnsObject: Record<string, any>;
  allKeys: any[];
  gameKey: any;
}

export function isSetGameMessage(obj: any): obj is SetGameMessage {
  return (
    obj &&
    obj.type === "setGame" &&
    typeof obj.roomKey === "string" &&
    typeof obj.columnsObject === "object" &&
    obj.columnsObject !== null &&
    Array.isArray(obj.allKeys) &&
    typeof obj.gameKey !== "undefined"
  );
}

export interface SetPlayerCardMessage {
  type: "setPlayerCard";
  roomKey: string;
  card: any;
}

export function isSetPlayerCardMessage(obj: any): obj is SetPlayerCardMessage {
  return (
    obj &&
    obj.type === "setPlayerCard" &&
    typeof obj.roomKey === "string" &&
    typeof obj.card !== "undefined"
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

export function isJoinRoomMessage(obj: any): obj is JoinRoomMessage {
  return (
    obj &&
    obj.type === "joinRoom" &&
    typeof obj.roomKey === "string" &&
    typeof obj.username === "string"
  );
}

export interface RequestNewCardMessage {
  type: "requestNewCard";
  roomKey: string;
}

export function isRequestNewCardMessage(obj: any): obj is RequestNewCardMessage {
  return obj && obj.type === "requestNewCard" && typeof obj.roomKey === "string";
}

// --- Extracted message payload validation ---
export function validateMessagePayload(message: any, bytes: Buffer) {
  switch (message.type) {
    case "chatMessage":
      if (!isChatMessage(message)) {
        throw new Error("Invalid or missing messageContents for chatMessage. Message: " + bytes.toString());
      }
      break;
    case "demotePlayer2":
      if (!isDemotePlayer2Message(message)) {
        throw new Error("Missing or invalid roomKey for demotePlayer2. Message: " + bytes.toString());
      }
      break;
    case "setGame":
      if (!isSetGameMessage(message)) {
        throw new Error("Missing or invalid fields for setGame. Message: " + bytes.toString());
      }
      break;
    case "setPlayerCard":
      if (!isSetPlayerCardMessage(message)) {
        throw new Error("Missing or invalid fields for setPlayerCard. Message: " + bytes.toString());
      }
      break;
    case "joinRoom":
      if (!isJoinRoomMessage(message)) {
        throw new Error("Missing or invalid fields for joinRoom. Message: " + bytes.toString());
      }
      break;
    case "requestNewCard":
      if (!isRequestNewCardMessage(message)) {
        throw new Error("Missing or invalid roomKey for requestNewCard. Message: " + bytes.toString());
      }
      break;
    default:
      throw new Error("Unknown message type. Message: " + bytes.toString());
  }
}

/** Messages the client sends to the server. */
export type ClientMessage =
  | ChatMessage
  | DemotePlayer2Message
  | JoinRoomMessage
  | RequestNewCardMessage
  | SetGameMessage
  | SetPlayerCardMessage;

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
  columnsObject: Record<string, any>;
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

export interface ServerErrorMessage {
  type: "error";
  error: string;
}

export type ServerMessage =
  | GameContentsMessage
  | ChatHistoryMessage
  | NoGameAlertMessage
  | ServerErrorMessage;
