import { useEffect } from "react";
import Board from "./Board";
import MiniDrawer from "./Drawer";
import { usePlayers } from "../contexts/useContextHooks";

function PlayGame() {
  const { myPlayerCard, assignNewMyPlayerCard } = usePlayers();
  useEffect(() => {
    if (!myPlayerCard || myPlayerCard == "") {
      assignNewMyPlayerCard();
    }
  });
  return (
    <div className="play-game">
      <MiniDrawer>
        <Board />
      </MiniDrawer>
    </div>
  );
}

export default PlayGame;
