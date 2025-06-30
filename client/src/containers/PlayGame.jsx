import { useState } from "react";

import Board from "./Board";
import MiniDrawer from "./Drawer";

function PlayGame() {
  return (
    <div className="play-game">
      {/* <PlayGameHeader setLoadingCards={setLoadingCards} /> */}
      <MiniDrawer>
        <Board />
      </MiniDrawer>
    </div>
  );
}

export default PlayGame;
