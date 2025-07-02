import { useContext } from "react";
import { GuessyContext } from "../contexts/GuessyContext";
import LoadingColumns from "./LoadingColumns";
import CardColumns from "./CardColumns";

// holds all the picture cards
function Board() {
  const { loadingCards } = useContext(GuessyContext);

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
