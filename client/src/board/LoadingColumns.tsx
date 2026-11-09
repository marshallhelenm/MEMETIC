import React from "react";
import BoardColumn from "./BoardColumn";
import LoadingStub from "../card/LoadingStub";
import { useLayout } from "../hooks/useContextHooks";

const LoadingColumns: React.FC = () => {
  const { columnCount, columnWidth } = useLayout();
  const cardWidth = Math.floor(columnWidth);

  const generateLoadingColumns = (): JSX.Element[] => {
    const boardColumns: JSX.Element[] = [];
    for (let i = 1; i <= columnCount; i++) {
      const cards: JSX.Element[] = [];
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
