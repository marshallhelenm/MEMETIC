import { useState } from "react";

import Board from "./Board";
import PlayGameHeader from "./PlayGameHeader";

function PlayGame() {
  const [loadingCards, setLoadingCards] = useState(false); // this lives at this level instead of in Board.jsx so that ClearGame in the header can call it
  const [columnCount, setColumnCount] = useState(6); // changes with breakpoints. or you know. it will once i code it to.

  return (
    <div className="play-game">
      <PlayGameHeader setLoadingCards={setLoadingCards} />
      <Board loading={loadingCards} columnCount={columnCount} />
    </div>
  );
}

export default PlayGame;
