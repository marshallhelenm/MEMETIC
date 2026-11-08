import { getSessionItem, setSessionItem } from "./sessionStorageUtils";

const PLAYER_ID_KEY = "guessy-uuid";

const makeId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for old browsers / non-secure contexts
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

/**
 * Returns this tab's player ID, creating and storing one on first use.
 * Lives in sessionStorage so it survives reloads but each tab is its own player.
 */
export function getPlayerId(): string {
  const existing = getSessionItem(PLAYER_ID_KEY);
  if (existing && existing !== "null" && existing !== "undefined") {
    return existing;
  }
  const id = makeId();
  setSessionItem(PLAYER_ID_KEY, id);
  return id;
}
