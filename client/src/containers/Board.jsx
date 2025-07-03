import LoadingColumns from "./LoadingColumns";
import CardColumns from "./CardColumns";
import { useGame } from "../contexts/useContextHooks";

// holds all the picture cards
function Board() {
  const { loadingCards } = useGame();

  if (loadingCards) {
    return (
      <div className="gameBoard">
        <LoadingColumns />
      </div>
    );
  } else {
    return (
      <div className="gameBoard">
        <CardColumns />
      </div>
    );
  }
}

export default Board;
