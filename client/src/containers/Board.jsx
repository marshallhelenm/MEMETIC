import Stub from "../components/Stub";
import LoadingStub from "../components/LoadingStub";
import { memeData } from "../assets/memeCollection";
import { useEffect } from "react";

// holds all the picture cards
function Board({itemKeys, roomKey}) {
  useEffect(()=>{
    console.log(itemKeys);
  }, [itemKeys])
  
  function generateCards(){
    let cards = []
    if (itemKeys.length > 0){
      return itemKeys.forEach((itemKey) => (
        cards.unshift(
          <Stub
          item={memeData[itemKey]}
          key={`${itemKey}-${Math.random() * 10}`}
          roomKey={roomKey}
          />
        )
      ))
    } else {
      for (let index = 0; index < 24; index++) {
        cards.unshift(
          <LoadingStub key={`loading-stub-${Math.random() * 10}`} />
        )
      }
    }
    return cards
  }

  return (
    <div className="gameBoard" >
      {generateCards()}
    </div>
  );
}

export default Board;
