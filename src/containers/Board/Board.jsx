import { Card, CardGroup } from "semantic-ui-react";
import Stub from "../../components/Stub";
import "./board.css";

// holds all the picture cards
function Board({items}) {
  return (
      <CardGroup itemsPerRow={4} >
        {items.map((item) => (
          <Stub
            item={item}
            key={`${item.stub}-${Math.random() * 10}`}
          />
        ))}
      </CardGroup>
  );
}

export default Board;
