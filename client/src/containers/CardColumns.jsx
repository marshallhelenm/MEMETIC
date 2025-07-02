import BoardColumn from "./BoardColumn";
import MissingStub from "../components/MissingStub";

import { memeData } from "../assets/memeCollection";
import StubCard from "./StubCard";
import { useContext } from "react";
import { GuessyContext } from "../contexts/GuessyContext";

function CardColumns() {
  const { myPlayerCard, columnsObject, columnCount } =
    useContext(GuessyContext);
  const columns = columnsObject[columnCount];

  const generateColumns = () => {
    let boardColumns = [];
    for (let i = 1; i <= columnCount; i++) {
      // devLog(["columns in Board: ", JSON.stringify(columns)]);
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
              isPlayerCard={itemKey == myPlayerCard}
              key={`${itemKey}-card`}
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
