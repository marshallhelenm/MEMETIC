import { useRef, useEffect } from "react";

import LoadingColumns from "./LoadingColumns";
import CardColumns from "./CardColumns";
import { useGame } from "../hooks/useContextHooks";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

// holds all the picture cards
function Board() {
  const { setLoadingCards, loadingCards, gameKey } = useGame();
  const gameKeyRef = useRef(gameKey);

  useEffect(() => {
    if (gameKeyRef.current != gameKey) {
      gameKeyRef.current = gameKey;
      if (loadingCards) setLoadingCards(false);
    }
  }, [loadingCards, gameKeyRef, gameKey, setLoadingCards]);

  if (loadingCards) {
    return (
      <div className="gameBoard">
        <LoadingColumns />
      </div>
    );
  } else {
    return (
      <div className="gameBoard">
        <CardColumns />
      </div>
    );
  }
}

export default Board;
