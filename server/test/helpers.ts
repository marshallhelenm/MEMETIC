import { GAME_SIZE, MAX_COLUMNS } from "../types/messages";
import type { BoardLayouts } from "../types/messages";

/** GAME_SIZE valid meme keys. */
export const gameKeys = Array.from({ length: GAME_SIZE }, (_, i) => `meme_${i}`);

/** Valid layouts for `keys`: for each column count, deal the keys round-robin. */
export function layoutsFor(keys: string[]): BoardLayouts {
  const layouts: BoardLayouts = {};
  for (let count = 1; count <= MAX_COLUMNS; count++) {
    layouts[count] = {};
    for (let column = 1; column <= count; column++) layouts[count][column] = [];
    keys.forEach((key, i) => layouts[count][(i % count) + 1].push(key));
  }
  return layouts;
}
