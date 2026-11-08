import React, { lazy, Suspense } from "react";

import LoadingColumns from "./LoadingColumns";
const CardColumns = lazy(() => import("./CardColumns"));
import { useGame } from "../hooks/useContextHooks";

const Board: React.FC = () => {
  const { boardWidth } = useGame();

  return (
    <div className="gameBoard" style={{ width: `min(100%, ${boardWidth}px)` }}>
      <Suspense fallback={<LoadingColumns />}>
        <CardColumns />
      </Suspense>
    </div>
  );
};

export default Board;
