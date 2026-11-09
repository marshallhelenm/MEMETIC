import { cardSorter } from "../utils/cardSorter";
import memes from "./memes.json" with { type: "json" };
import type { MemeData } from "../types/meme.js";
import type { BoardLayouts } from "../messages";

// const memeData = JSON.parse(memes);
const memeData: Record<string, MemeData> = memes;
const memeKeys = Object.keys(memes);

function memeSampler(): { columnsObject: BoardLayouts; allKeys: string[] } {
  const memesArray = memeKeys.slice(0);
  const gameKeys: string[] = [];
  let randomIndex;

  for (let i = 0; i < 24; i++) {
    randomIndex = Math.floor(Math.random() * memesArray.length);
    gameKeys.push(memesArray.splice(randomIndex, 1)[0]);
  }

  const memeSet = { columnsObject: { 1: { 1: gameKeys } } as BoardLayouts, allKeys: gameKeys };
  for (let i = 2; i <= 6; i++) {
    memeSet.columnsObject[i] = cardSorter(gameKeys, i);
  }

  return memeSet;
}

export { memeSampler, memeData };
