import "../App.css";
import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import GifPauseButton from "../components/GifPauseButton";
import ClearGame from "./ClearGame";

function PlayGameHeader({setMemeCollection, roomKey}) {
  return (
    <div className="play-header">
      <div className="row">
        <Logo spin={false} header={true} />
        <h1 className="heading">Guessy</h1>
      </div>
      <h4 className="roomKey">Room Key: <span className="colorF">{roomKey}</span></h4>
      <div className="row header-buttons">
        <GifPauseButton />
        <QuestionsModal />
        <ClearGame setMemeCollection={setMemeCollection} roomKey={roomKey}/>
      </div>
    </div>
  );
}

export default PlayGameHeader;
