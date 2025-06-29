import BoardColumn from "./BoardColumn";
import LoadingStub from "../components/LoadingStub";
import MissingStub from "../components/MissingStub";
import Stub from "../containers/Stub";

import { memeData } from "../assets/memeCollection";
import { useGuessy } from "../contexts/useGuessy";

// holds all the picture cards
function Board({ loading, columnCount }) {
  const { myPlayerCard, columnsObject, roomObjectIsValid } = useGuessy();
  const columns = columnsObject[columnCount];

  function generateColumns() {
    let boardColumns = [];
    for (let i = 1; i <= columnCount; i++) {
      // devLog(["columns in Board: ", JSON.stringify(columns)]);
      let colKeys = columns[i];
      let cards = generateCards(colKeys);
      boardColumns.push(<BoardColumn cards={cards} key={`col-${i}`} />);
    }
    return boardColumns;
  }
  function generateLoadingColumns() {
    let boardColumns = [];
    for (let i = 1; i <= columnCount; i++) {
      let cards = generateLoadingCards();
      boardColumns.push(<BoardColumn cards={cards} key={`col-${i}`} />);
    }
    return boardColumns;
  }
  function generateCards(keys) {
    let cards = [];
    for (let itemKey of keys) {
      let item = memeData[itemKey];
      if (!item) {
        cards.push(<MissingStub key={Math.random() * 10} />);
      } else {
        cards.push(
          <Stub
            itemKey={itemKey}
            item={item}
            isPlayerCard={itemKey == myPlayerCard}
            key={`${itemKey}-${Math.random() * 10}`}
          />
        );
      }
    }
    return cards;
  }

  function generateLoadingCards() {
    let cards = [];
    for (let index = 0; index < 24 / columnCount; index++) {
      cards.unshift(<LoadingStub key={`loading-stub-${Math.random() * 10}`} />);
    }
    return cards;
  }

  return (
    <div className="gameBoard">
      {!loading && roomObjectIsValid()
        ? generateColumns()
        : generateLoadingColumns()}
    </div>
  );
}

export default Board;
