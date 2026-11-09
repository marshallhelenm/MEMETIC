import { getSessionItem, setSessionItem } from "./sessionStorageUtils";

/** Where this tab remembers its card, so it can hand it back to the server on re-join. */
const cardStorageKey = (roomKey: string | null) => `guessy-${roomKey}-player-card`;

export interface RememberedCard {
  card?: string;
  gameKey?: number;
}

/** The card this tab last had in this room, if any. */
export function getRememberedCard(roomKey: string | null): RememberedCard {
  try {
    return JSON.parse(getSessionItem(cardStorageKey(roomKey)) || "{}");
  } catch {
    return {};
  }
}

export function rememberCard(roomKey: string | null, gameKey: number, card: string): void {
  setSessionItem(cardStorageKey(roomKey), JSON.stringify({ gameKey, card }));
}
