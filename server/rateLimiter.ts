// Per-player message rate limiting, kept in memory.

export const RATE_LIMIT_WINDOW_MS = 5000;
export const RATE_LIMIT_MAX = 20;

const recent: Record<string, number[]> = {};

/** Record a message from this player; false if they're over the limit. */
export function allowMessage(uuid: string, now: number = Date.now()): boolean {
  const inWindow = (recent[uuid] ?? []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (inWindow.length >= RATE_LIMIT_MAX) {
    recent[uuid] = inWindow;
    return false;
  }
  inWindow.push(now);
  recent[uuid] = inWindow;
  return true;
}

/** Drop a player's history, e.g. once they've been removed from the server. */
export function forgetPlayer(uuid: string): void {
  delete recent[uuid];
}

/** Clear all history (for tests). */
export function resetRateLimits(): void {
  Object.keys(recent).forEach((uuid) => delete recent[uuid]);
}

/** Number of players with history (for tests). */
export function trackedPlayerCount(): number {
  return Object.keys(recent).length;
}
