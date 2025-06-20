import Stub from "../components/Stub";
import { memeData } from "../assets/memeCollection";
import { useEffect } from "react";

// holds all the picture cards
function Board({itemKeys, roomKey}) {


  useEffect(()=>{
    console.log('itemKeys: ', itemKeys);
    
  }, [])
  return (
    <div className="gameBoard" >
        {/* {generateColumns()} */}
        {
          itemKeys.map((itemKey) => (
            <Stub
              item={memeData[itemKey]}
              key={`${itemKey}-${Math.random() * 10}`}
              roomKey={roomKey}
              />
          ))
        }
    </div>
  );
}

export default Board;
