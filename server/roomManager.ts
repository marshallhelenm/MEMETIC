// Room and player management utilities and templates

import type { ChatMessage } from "./types/messages";

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
  /** False while the player's socket is down but they're still in the grace period. */
  connected?: boolean;
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

/** Pick a random card from the room's keys, avoiding `exclude` when possible. */
export function pickRandomCard(allKeys: any[], exclude?: any): any {
  if (!allKeys || allKeys.length === 0) return undefined;
  const choices = allKeys.length > 1 ? allKeys.filter((k) => k !== exclude) : allKeys;
  return choices[Math.floor(Math.random() * choices.length)];
}

/** True if the player's card belongs to the room's current game. */
export function hasValidCard(room: Room, uuid: string): boolean {
  const card = room.players[uuid]?.card;
  return card !== undefined && card !== null && room.allKeys.includes(card);
}

/** Give a player in the room a card for the current game if they lack one. */
export function ensureCard(room: Room, uuid: string): void {
  const player = room.players[uuid];
  if (!player || room.allKeys.length === 0) return;
  if (!hasValidCard(room, uuid)) player.card = pickRandomCard(room.allKeys);
}
