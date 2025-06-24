import { sortedColumns } from "../utils/cardSorter";
import memes from "./memes.json";

// const memeData = JSON.parse(memes);
const memeData = memes;
const memeKeys = Object.keys(memes);

function memeSampler() {
  let memesArray = memeKeys.slice(0);
  let gameKeys = [];
  let randomIndex;

  for (let i = 0; i < 24; i++) {
    randomIndex = Math.floor(Math.random() * (memesArray.length - 1));
    gameKeys.push(memesArray.splice(randomIndex, 1)[0]);
  }

  const columnsObject = sortedColumns(gameKeys);
  columnsObject["allKeys"] = gameKeys;
  return columnsObject;
}

export { memeSampler, memeData };
