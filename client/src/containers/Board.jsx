import Stub from "../containers/Stub";
import LoadingStub from "../components/LoadingStub";
import { memeData } from "../assets/memeCollection";
import MissingStub from "../components/MissingStub";
import BoardColumn from "./BoardColumn";
import { useGuessy } from "../contexts/useGuessy";

// holds all the picture cards
function Board({ loading, roomKey }) {
  const { roomObject } = useGuessy();
  const itemKeys = roomObject?.allKeys || [];

  function generateColumns() {
    let boardColumns = [];
    for (let i = 1; i < 7; i++) {
      let col = itemKeys[i];
      let cards = loading ? generateLoadingCards() : generateCards(col);
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

  return <div className="gameBoard">{generateColumns()}</div>;
}

export default Board;
