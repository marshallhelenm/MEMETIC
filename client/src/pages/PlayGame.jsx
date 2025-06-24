import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import Board from "../containers/Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../components/PlayGameHeader";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams] = useSearchParams();
  const [memeCollection, setMemeCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerCard, setPlayerCard] = useState("");
  const roomKey = searchParams.get("roomKey");
  const { joinRoom, handleNewGame } = useGuessy();
  const { lastJsonMessage } = useWS();
  // console.log("playerCard: ", playerCard);

  function randomKey() {
    let keys = memeCollection["allKeys"];
    if (!keys) return;
    let min = Math.ceil(0);
    let max = Math.floor(23);
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(index);

    console.log(keys, keys[index]);
    return keys[index];
  }

  function assignPlayerCard() {
    let key = randomKey();
    setPlayerCard(key);
    localStorage.setItem(`${roomKey}-player-card`, key);
  }

  function handlePlayerCard() {
    let savedCard = localStorage.getItem(`${roomKey}-player-card`);
    if (!savedCard) {
      assignPlayerCard;
    } else {
      setPlayerCard(savedCard);
    }
  }
  useEffect(() => {
    joinRoom(roomKey);
    if (!lastJsonMessage) {
      return;
    } else if (lastJsonMessage["alert"] == "no game in room") {
      handleNewGame(roomKey);
      return;
    } else {
      const new_memes = JSON.parse(lastJsonMessage["memeSet"]);
      setMemeCollection(new_memes);
      setLoading(false);
    }
  }, [
    roomKey,
    joinRoom,
    lastJsonMessage,
    handleNewGame,
    playerCard,
    setPlayerCard,
  ]);

  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
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
