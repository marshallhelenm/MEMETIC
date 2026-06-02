import React from "react";
import BoardColumn from "./BoardColumn";
import LoadingStub from "../card/LoadingStub";
import { useGame } from "../hooks/useContextHooks";

const LoadingColumns: React.FC = () => {
  const { columnCount, columnWidth } = useGame();
  const cardWidth = Math.floor(columnWidth);

  const generateLoadingColumns = (): JSX.Element[] => {
    let boardColumns: JSX.Element[] = [];
    for (let i = 1; i <= columnCount; i++) {
      let cards: JSX.Element[] = [];
      for (let index = 0; index < 24 / columnCount; index++) {
        cards.unshift(
          <LoadingStub key={`loading-stub-${index}`} cardWidth={cardWidth} />
        );
      }
      boardColumns.push(<BoardColumn cards={cards} key={`col-${i}`} />);
    }
    return boardColumns;
  };

  return <>{generateLoadingColumns()}</>;
};

export default LoadingColumns;
