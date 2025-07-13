import Board from "../../board/Board";
import ChatBox from "./ChatBox";
import MiniDrawer from "../../drawer/Drawer";

function PlayGame() {
  return (
    <div className="play-game">
      <MiniDrawer>
        <Board />
        <ChatBox />
      </MiniDrawer>
    </div>
  );
}

export default PlayGame;
