import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import Board from "../containers/Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../components/PlayGameHeader";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import NameForm from "./NameForm";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams] = useSearchParams();
  const roomKey = searchParams.get("roomKey");
  const [memeCollection, setMemeCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    joinRoom,
    handleNewGame,
    playerCard,
    username,
    setUsername,
    getUsernameLocal,
  } = useGuessy();
  const { lastJsonMessage, uuid } = useWS();

  useEffect(() => {
    joinRoom(roomKey);
    if (!lastJsonMessage) {
      return;
    } else if (lastJsonMessage["alert"] == "no game in room") {
      handleNewGame(roomKey);
      return;
    } else if (lastJsonMessage["memeSet"]) {
      if (!username) getUsernameLocal();
      const new_memes = JSON.parse(lastJsonMessage["memeSet"]);
      setMemeCollection(new_memes);
      setLoading(false);
    }
  }, [
    roomKey,
    getUsernameLocal,
    joinRoom,
    lastJsonMessage,
    handleNewGame,
    playerCard,
    uuid,
    username,
    setUsername,
  ]);

  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (!username) {
    return <NameForm />;
  } else {
    return (
      <div className="play-game">
        <PlayGameHeader
          setMemeCollection={setMemeCollection}
          roomKey={roomKey}
        />
        <Board
          itemKeys={memeCollection}
          roomKey={roomKey}
          loading={loading}
          playerCard={playerCard}
        />
      </div>
    );
  }
}

export default PlayGame;
