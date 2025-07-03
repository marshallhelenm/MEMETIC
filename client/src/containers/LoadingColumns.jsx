import BoardColumn from "./BoardColumn";
import LoadingStub from "../components/LoadingStub";
import { useGame } from "../contexts/useContextHooks";

function LoadingColumns() {
  const { columnCount } = useGame();

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
