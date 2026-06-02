import React, { useRef, useEffect, lazy, Suspense } from "react";

import LoadingColumns from "./LoadingColumns";
const CardColumns = lazy(() => import("./CardColumns"));
import { useGame } from "../hooks/useContextHooks";

const Board: React.FC = () => {
  const { setLoadingCards, loadingCards, gameKey, boardWidth } = useGame();
  const gameKeyRef = useRef<number | null>(gameKey);
  const boardStyle = {
    width: `min(100%, ${boardWidth}px)`,
  };

  useEffect(() => {
    if (gameKeyRef.current !== gameKey) {
      gameKeyRef.current = gameKey;
      if (loadingCards) setLoadingCards(false);
    }
  }, [loadingCards, gameKey, setLoadingCards]);

  if (loadingCards) {
    return (
      <div className="gameBoard" style={boardStyle}>
        <LoadingColumns />
      </div>
    );
  } else {
    return (
      <div className="gameBoard" style={boardStyle}>
        <Suspense fallback={<LoadingColumns />}>
          <CardColumns />
        </Suspense>
      </div>
    );
  }
};

export default Board;
