import React, { lazy } from "react";
import { useSearchParams } from "react-router-dom";

import { useGame, useLayout } from "../hooks/useContextHooks";
import { memeData } from "../assets/memeCollection";
import BoardColumn from "./BoardColumn";
const MissingStub = lazy(() => import("../card/MissingStub"));
import MemeCard from "../card/MemeCard";
import type { MemeData } from "../types/meme.js";

const CardColumns: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey");
  const { columnsObject, gameKey } = useGame();
  const { columnCount } = useLayout();
  const columns = columnsObject[columnCount];

  const generateColumns = (): JSX.Element[] => {
    const boardColumns: JSX.Element[] = [];
    for (let i = 1; i <= Object.keys(columns).length; i++) {
      const colKeys: string[] = columns[i];
      const cards: JSX.Element[] = [];
      for (const itemKey of colKeys) {
        const item: MemeData | undefined = memeData[itemKey];
        if (!item) {
          cards.push(<MissingStub key={itemKey + "-missing"} />);
        } else {
          cards.push(
            <MemeCard
              itemKey={itemKey}
              item={item}
              // Keyed by game so a meme that reappears in a new game starts unflipped.
              key={`${gameKey}-${itemKey}-card`}
              roomKey={roomKey}
            />
          );
        }
      }
      boardColumns.push(<BoardColumn cards={cards} key={`col-${i}`} />);
    }
    return boardColumns;
  };

  return <>{generateColumns()}</>;
};

export default CardColumns;
