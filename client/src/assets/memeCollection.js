import { cardSorter } from "../utils/cardSorter";
import memes from "./memes.json";

// const memeData = JSON.parse(memes);
const memeData = memes;
const memeKeys = Object.keys(memes);

function memeSampler() {
  // eslint-disable-next-line no-debugger
  // debugger;
  let memesArray = memeKeys.slice(0);
  let gameKeys = [];
  let randomIndex;

  for (let i = 0; i < 24; i++) {
    randomIndex = Math.floor(Math.random() * (memesArray.length - 1));
    gameKeys.push(memesArray.splice(randomIndex, 1)[0]);
  }

  let memeSet = {};
  for (let i = 1; i <= 6; i++) {
    if (i == 1) {
      memeSet["1Column"] = { 1: gameKeys };
    } else {
      memeSet[`${i}Column`] = cardSorter(gameKeys, i);
    }
  }
  memeSet.allKeys = gameKeys;
  console.log("memeSampler, memeSet: ", typeof memeSet, memeSet);

  return memeSet;
}

export { memeSampler, memeData };
