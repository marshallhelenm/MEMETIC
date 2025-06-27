import BoardColumn from "./BoardColumn";
import LoadingStub from "../components/LoadingStub";
import MissingStub from "../components/MissingStub";
import Stub from "../containers/Stub";
import { memeData } from "../assets/memeCollection";
import { useGuessy } from "../contexts/useGuessy";
import { devLog } from "../utils/Helpers";

// holds all the picture cards
function Board({ loading, roomKey, playerCard }) {
  const { roomObject } = useGuessy();
  // devLog(["Board rendered, roomObject: ", roomObject]);

  function generateColumns() {
    let boardColumns = [];
    for (let i = 1; i < 7; i++) {
      let colKeys = roomObject.memeSet[i];
      let cards = generateCards(colKeys);
      boardColumns.push(<BoardColumn cards={cards} key={`col-${i}`} />);
    }
    return boardColumns;
  }
  function generateLoadingColumns() {
    let boardColumns = [];
    for (let i = 1; i < 7; i++) {
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
            item={memeData[itemKey]}
            key={`${itemKey}-${Math.random() * 10}`}
            roomKey={roomKey}
            isPlayerCard={itemKey === playerCard}
          />
        );
      }
    }
    return cards;
  }

  function generateLoadingCards() {
    let cards = [];
    for (let index = 0; index < 4; index++) {
      cards.unshift(<LoadingStub key={`loading-stub-${Math.random() * 10}`} />);
    }
    return cards;
  }

  return (
    <div className="gameBoard">
      {loading && roomObject.memeSet
        ? generateColumns()
        : generateLoadingColumns()}
    </div>
  );
}

export default Board;
