import Board from "../board/Board";
import MiniDrawer from "../drawer/Drawer";

function PlayGame() {
  return (
    <div className="play-game">
      <MiniDrawer>
        <Board />
      </MiniDrawer>
    </div>
  );
}

export default PlayGame;
