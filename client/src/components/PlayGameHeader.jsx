import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import GifPauseButton from "../components/GifPauseButton";
import ClearGame from "./ClearGame";
import PlayerCardModal from "./PlayerCardModal";
import { useSearchParams } from "react-router-dom";

function PlayGameHeader({ roomKey, setLoadingCards, username, playerCard }) {
  const [searchParams] = useSearchParams();
  return (
    <div className="play-header">
      <div className="row header-title">
        <Logo spin={false} header={true} />
        <h1 className="heading">Guessy</h1>
      </div>
      <h4 className="header-box">
        Room Key:{" "}
        <span className="colorF">{roomKey || searchParams.get("roomKey")}</span>
        <i
          className={`fa-solid fa-xl fa-copy`}
          style={{ marginLeft: "2%", cursor: "pointer" }}
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/play?roomKey=${
                roomKey || searchParams.get("roomKey")
              }`
            );
          }}
        ></i>
      </h4>
      <h4 className="header-box">
        <PlayerCardModal playerCard={playerCard} />
        Your Meme
      </h4>
      <h4 className="header-box">
        <i
          className={`fa-solid fa-xl fa-user`}
          style={{ marginRight: "2%" }}
        ></i>
        {username}
      </h4>
      <div className="row header-buttons">
        <GifPauseButton />
        <QuestionsModal />
        <ClearGame
          roomKey={roomKey}
          setLoadingCards={setLoadingCards}
          username={username}
        />
      </div>
    </div>
  );
}

export default PlayGameHeader;
