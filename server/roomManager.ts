// Room and player management utilities and templates

import { ChatMessage } from "../shared/types/message.ts";

export interface Room {
  roomKey?: string;
  columnsObject: Record<string, any>;
  allKeys: any[];
  players: Record<string, Player>;
  player1Uuid: string | null;
  player2Uuid: string | null;
  messageHistory: ChatMessage[] | [];
  gameKey?: any ;
}

export interface Rooms {
  [roomKey: string]: Room;
}

export interface Player {
  uuid: string;
  username?: string;
  card?: any;
}

export const emptyRoomTemplate: Room = {
  roomKey: undefined,
  columnsObject: {},
  allKeys: [],
  players: {},
  player1Uuid: null,
  player2Uuid: null,
  messageHistory: [],
  gameKey: undefined,
};

export const emptyPlayerTemplate: Player = {
  uuid: "",
  username: undefined,
  card: undefined,
};

export function deepClone<T>(obj: T): T {
  if (typeof (globalThis as any).structuredClone === 'function') {
    return (globalThis as any).structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj));
  }
}
