import QuestionsModal from "../components/QuestionsModal";
import Logo from "../components/Logo";
import GifPauseButton from "../components/GifPauseButton";
import ClearGame from "../components/ClearGame";
import PlayerCardModal from "./PlayerCardModal";
import Users from "../components/Users";
import { useGuessy } from "../contexts/useGuessy";

function PlayGameHeader({ setLoadingCards }) {
  const { roomKey } = useGuessy();
  return (
    <div className="play-header">
      <div className="row header-title">
        <Logo spin={false} header={true} />
        <h1 className="heading">Guessy</h1>
      </div>
      <h4 className="header-box">
        Room Key: <span className="colorF">{roomKey}</span>
        <i
          className={`fa-solid fa-xl fa-copy`}
          style={{ marginLeft: "2%", cursor: "pointer" }}
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/play?roomKey=${roomKey}`
            );
          }}
        ></i>
      </h4>
      <h4 className="header-box">
        <PlayerCardModal />
      </h4>
      <Users />
      <div className="row header-buttons">
        <GifPauseButton />
        <QuestionsModal />
        <ClearGame setLoadingCards={setLoadingCards} />
      </div>
    </div>
  );
}

export default PlayGameHeader;
