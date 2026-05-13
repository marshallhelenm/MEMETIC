import { cardSorter } from "../utils/cardSorter";
import memes from "./memes.json" with { type: "json" };
import type { MemeData } from "../types/meme.js";

// const memeData = JSON.parse(memes);
const memeData: Record<string, MemeData> = memes;
const memeKeys = Object.keys(memes);

function memeSampler() {
  let memesArray = memeKeys.slice(0);
  let gameKeys = [];
  let randomIndex;

  for (let i = 0; i < 24; i++) {
    randomIndex = Math.floor(Math.random() * (memesArray.length - 1));
    gameKeys.push(memesArray.splice(randomIndex, 1)[0]);
  }

  let memeSet = { columnsObject: { "1": { 1: gameKeys } } as Record<string, any>, allKeys: gameKeys };
  for (let i = 2; i <= 6; i++) {
    memeSet.columnsObject[i.toString()] = cardSorter(gameKeys, i);
  }

  return memeSet;
}

export { memeSampler, memeData };
