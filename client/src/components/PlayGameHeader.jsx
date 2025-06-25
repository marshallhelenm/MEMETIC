import "../App.css";
import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import GifPauseButton from "../components/GifPauseButton";
import ClearGame from "./ClearGame";
import PlayerCardModal from "./PlayerCardModal";
import { useGuessy } from "../contexts/useGuessy";

function PlayGameHeader({ roomKey, setLoading }) {
  const { username } = useGuessy();
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
        <PlayerCardModal />
        Your Meme
      </h4>
      <h4 className="header-roomKey">
        <i
          className={`fa-solid fa-xl fa-user`}
          style={{ marginRight: "2%" }}
        ></i>
        {username}
      </h4>
      <div className="row header-buttons">
        <GifPauseButton />
        <QuestionsModal />
        <ClearGame roomKey={roomKey} setLoading={setLoading} />
      </div>
    </div>
  );
}

export default PlayGameHeader;
