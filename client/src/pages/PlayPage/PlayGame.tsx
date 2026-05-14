import Board from "../../board/Board.js";
import ChatBox from "./ChatBox.js";
import MiniDrawer from "../../drawer/Drawer.js";

const PlayGame: React.FC = () => {
  return (
    <div className="play-game">
      <MiniDrawer>
        <Board />
        {/* <ChatBox /> */}
      </MiniDrawer>
    </div>
  );
};

export default PlayGame;
