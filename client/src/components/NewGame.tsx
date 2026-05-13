import { Link } from "react-router-dom";
import GuessyButton from "./GuessyButton";

const NewGame: React.FC = () => {
  function generateRoomKey() {
    let newRoomKey = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      newRoomKey += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    return newRoomKey;
  }
  const newRoomKey = generateRoomKey();

  return (
    <Link to={`/name_thyself?roomKey=${newRoomKey}`}>
      <GuessyButton onClick={() => {}} dark={false}>New Game</GuessyButton>
    </Link>
  );
};

export default NewGame;
