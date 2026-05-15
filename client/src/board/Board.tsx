import React, { useRef, useEffect, lazy, Suspense } from "react";

import LoadingColumns from "./LoadingColumns";
const CardColumns = lazy(() => import("./CardColumns"));
import { useGame } from "../hooks/useContextHooks";

const Board: React.FC = () => {
  const { setLoadingCards, loadingCards, gameKey } = useGame();
  const gameKeyRef = useRef<number | null>(gameKey);

  useEffect(() => {
    if (gameKeyRef.current !== gameKey) {
      gameKeyRef.current = gameKey;
      if (loadingCards) setLoadingCards(false);
    }
  }, [loadingCards, gameKey, setLoadingCards]);

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
};

export default Board;
