import { Card, CardGroup, Grid, GridColumn, GridRow } from "semantic-ui-react";
import Stub from "../components/Stub";

// holds all the picture cards
function Board({items}) {
  function generateColumn(cards, index){
    return (
      <GridColumn key={`column-${index}`}>
        {cards.map((item) => (
          item ? 
          <Stub
          item={item}
          key={`${item.stub}-${Math.random() * 10}`}
          /> : null
        ))}
      </GridColumn>
    )
  }

  function generateColumns(){
    const item_array = items.slice(0)
    let columns = []
    for (let index = 0; index < 6; index++) {
      columns.push(generateColumn(item_array.splice(0,4), index))
    }
    return columns
  }

  return (
    <Grid columns={6} className="gameBoard" >
      <GridRow stretched>
        {generateColumns()}
      </GridRow>
    </Grid>
  );
}

export default Board;
