import { useEffect, useMemo, useRef, useState } from "react";
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
  const roomKey = searchParams.get("roomKey");
  const [memeCollection, setMemeCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerCard, setPlayerCard] = useState();
  const { joinRoom, handleNewGame } = useGuessy();
  const { lastJsonMessage } = useWS();

  function randomCardKey() {
    let keys = memeCollection["allKeys"];

    if (!keys) return;
    let min = Math.ceil(0);
    let max = Math.floor(23);
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    return keys[index];
  }

  const handlePlayerCard = useRef(() => {
    let cardKey = localStorage.getItem(`${roomKey}-player-card`);
    if (!cardKey || cardKey == "undefined") {
      cardKey = randomCardKey();
      localStorage.setItem(`${roomKey}-player-card`, cardKey);
    }
    return cardKey;
  });

  useEffect(() => {
    joinRoom(roomKey);
    if (!playerCard) {
      setPlayerCard(handlePlayerCard.current());
    }
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
    handlePlayerCard,
    playerCard,
  ]);

  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
  } else {
    return (
      <div className="play-game">
        <PlayGameHeader
          setMemeCollection={setMemeCollection}
          roomKey={roomKey}
          playerCard={playerCard}
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
