// Shared message types for client and server

export interface GenericMessage {
  type: string;
  roomKey?: string;
  [key: string]: any;
}

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

export interface ChatHistoryMessage {
    type: "chatHistory";
    roomKey: string;
    chatHistory: ChatMessage[];
    timeStamp: number;
}

export interface AcceptUuidMessage {
  type: "acceptUuid";
}

export function isAcceptUuidMessage(obj: any): obj is AcceptUuidMessage {
  return obj && obj.type === "acceptUuid";
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
}

export function isJoinRoomMessage(obj: any): obj is JoinRoomMessage {
  return (
    obj &&
    obj.type === "joinRoom" &&
    typeof obj.roomKey === "string" &&
    typeof obj.username === "string"
  );
}

export interface RequestUuidMessage {
  type: "requestUuid";
}

export function isRequestUuidMessage(obj: any): obj is RequestUuidMessage {
  return obj && obj.type === "requestUuid";
}

// --- Extracted message payload validation ---
export function validateMessagePayload(message: any, bytes: Buffer) {
  switch (message.type) {
    case "acceptUuid":
      if (!isAcceptUuidMessage(message)) {
        throw new Error("Invalid acceptUuid message. Message: " + bytes.toString());
      }
      break;
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
    case "requestUuid":
      if (!isRequestUuidMessage(message)) {
        throw new Error("Missing or invalid fields for requestUuid. Message: " + bytes.toString());
      }
      break;
    default:
      throw new Error("Unknown message type. Message: " + bytes.toString());
  }
}

export type Message =
  | AcceptUuidMessage
  | ChatMessage
  | DemotePlayer2Message
  | JoinRoomMessage
  | RequestUuidMessage
  | SetGameMessage
  | SetPlayerCardMessage;
