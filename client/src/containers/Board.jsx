import Stub from "../components/Stub";
import LoadingStub from "../components/LoadingStub";
import { memeData } from "../assets/memeCollection";
import MissingStub from "../components/MissingStub";

// holds all the picture cards
function Board({itemKeys, roomKey, loading}) {
  function generateCards(){
    let cards = []
    let keys = JSON.parse(itemKeys)
    for (let itemKey of keys) {
      let item = memeData[itemKey];
      if (!item){
        cards.unshift(
          <MissingStub
          key={Math.random() * 10}
          />
        )
      } else {
        cards.unshift(
          <Stub
          itemKey={itemKey}
          item={memeData[itemKey]}
          key={`${itemKey}-${Math.random() * 10}`}
          roomKey={roomKey}
          />
        )
      }
    }
    return cards
  }

  function generateLoadingCards(){
    let cards = []
    for (let index = 0; index < 24; index++) {
      cards.unshift(
        <LoadingStub key={`loading-stub-${Math.random() * 10}`} />
      )
    }
    return cards
  }

  return (
    <div className="gameBoard" >
      {loading ? generateLoadingCards() : generateCards()}
    </div>
  );
}

export default Board;
