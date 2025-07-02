import BoardColumn from "./BoardColumn";
import LoadingStub from "../components/LoadingStub";

import { useContext } from "react";
import { GuessyContext } from "../contexts/GuessyContext";

function LoadingColumns() {
  const { columnCount } = useContext(GuessyContext);

  const generateLoadingColumns = () => {
    let boardColumns = [];
    for (let i = 1; i <= columnCount; i++) {
      let cards = [];
      for (let index = 0; index < 24 / columnCount; index++) {
        cards.unshift(<LoadingStub key={`loading-stub-${index}`} />);
      }
      boardColumns.push(<BoardColumn cards={cards} key={`col-${i}`} />);
    }
    return boardColumns;
  };

  return <>{generateLoadingColumns()}</>;
}

export default LoadingColumns;
