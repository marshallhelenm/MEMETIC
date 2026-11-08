// Room and player management utilities and templates

import type { ChatEntry } from "./types/messages";

export interface Room {
  roomKey?: string;
  columnsObject: Record<string, any>;
  allKeys: any[];
  players: Record<string, Player>;
  player1Uuid: string | null;
  player2Uuid: string | null;
  messageHistory: ChatEntry[];
  /** Identifies the room's current game; assigned by the server on each setGame. */
  gameKey: number | null;
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
  gameKey: null,
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

/**
 * Key for a room's next game: the current time, bumped if needed so it is always
 * greater than the previous key. Keys stay unique across server restarts.
 */
export function nextGameKey(previous: number | null): number {
  return Math.max(Date.now(), (previous ?? 0) + 1);
}

/**
 * Make sure the room's player 1 and 2 slots point at players who are in the room.
 * Players are considered in join order.
 * - No player 1: the first player who isn't player 2 takes it (so player 2 keeps
 *   guessing); with nobody else, player 2 moves up to player 1.
 * - No player 2: the first player who isn't player 1 takes it.
 */
export function fillRoles(room: Room): void {
  const inRoom = (uuid: string | null): uuid is string => !!uuid && !!room.players[uuid];
  const present = Object.keys(room.players);

  if (!inRoom(room.player1Uuid)) {
    const observer = present.find((u) => u !== room.player2Uuid);
    if (observer) {
      room.player1Uuid = observer;
    } else if (inRoom(room.player2Uuid)) {
      room.player1Uuid = room.player2Uuid;
      room.player2Uuid = null;
    } else {
      room.player1Uuid = null;
    }
  }

  if (!inRoom(room.player2Uuid)) {
    room.player2Uuid = present.find((u) => u !== room.player1Uuid) ?? null;
  }
}

/**
 * Remove a player from every room they're in and hand on any role they held.
 * Returns the keys of the rooms that changed.
 */
export function removePlayer(rooms: Rooms, uuid: string): string[] {
  const changed = Object.keys(rooms).filter((roomKey) => rooms[roomKey].players[uuid]);
  changed.forEach((roomKey) => {
    delete rooms[roomKey].players[uuid];
    fillRoles(rooms[roomKey]);
  });
  return changed;
}
