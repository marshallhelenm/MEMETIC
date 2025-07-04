import { useRef, useEffect, lazy, Suspense } from "react";

import LoadingColumns from "./LoadingColumns";
const CardColumns = lazy(() => import("./CardColumns"));
import { useGame } from "../hooks/useContextHooks";

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
        <Suspense fallback={<LoadingColumns />}>
          <CardColumns />
        </Suspense>
      </div>
    );
  }
}

export default Board;
