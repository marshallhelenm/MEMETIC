import "../App.css";
import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import GifPauseButton from "../components/GifPauseButton";
import ClearGame from "./ClearGame";
import PlayerCardModal from "./PlayerCardModal";

function PlayGameHeader({ setMemeCollection, roomKey, playerCard }) {
  return (
    <div className="play-header">
      <div className="row header-title">
        <Logo spin={false} header={true} />
        <h1 className="heading">Guessy</h1>
      </div>
      <h4 className="header-roomKey">
        Room Key: <span className="colorF">{roomKey}</span>
      </h4>
      <h4 className="header-roomKey">
        <PlayerCardModal playerCard={playerCard} />
        Your Meme
      </h4>
      <div className="row header-buttons">
        <GifPauseButton />
        <QuestionsModal />
        <ClearGame setMemeCollection={setMemeCollection} roomKey={roomKey} />
      </div>
    </div>
  );
}

export default PlayGameHeader;
