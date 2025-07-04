import { lazy } from "react";
import { useSearchParams } from "react-router-dom";

import { useGame } from "../hooks/useContextHooks";
import { memeData } from "../assets/memeCollection";
import BoardColumn from "./BoardColumn";
const MissingStub = lazy(() => import("../card/MissingStub"));
import StubCard from "../card/StubCard";

function CardColumns() {
  const [searchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey");
  const { columns } = useGame();

  const generateColumns = () => {
    let boardColumns = [];
    for (let i = 1; i <= Object.keys(columns).length; i++) {
      let colKeys = columns[i];
      let cards = [];
      for (let itemKey of colKeys) {
        let item = memeData[itemKey];
        if (!item) {
          cards.push(<MissingStub key={itemKey + "-missing"} />);
        } else {
          cards.push(
            <StubCard
              itemKey={itemKey}
              item={item}
              key={`${itemKey}-card`}
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
}

export default CardColumns;
