import { createContext, useEffect, useMemo, useState } from "react";

import { randomCardKey } from "../utils/Helpers";
import { useGame, useWS } from "../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";

const PlayersContext = createContext();

// ** Provider Logic Start

function PlayersProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { lastJsonMessage } = useWS();
  const { allKeys, gameKey } = useGame();
  const gameKeyRef = useRef(gameKey);
  const roomKey = searchParams.get("roomKey");
  const [myPlayerCard, setMyPlayerCard] = useState(
    sessionStorage.getItem(`guessy-${roomKey}-player-card`)
  );
  const [players, setPlayers] = useState([]);
  const allPlayersRef = useRef("");
  const [player1Uuid, setPlayer1Uuid] = useState("");
  const [player2Uuid, setPlayer2Uuid] = useState("");
  const isObserver = ![player1Uuid, player2Uuid].includes(
    sessionStorage.getItem("guessy-uuid")
  );

  // ** Functions

  const assignNewMyPlayerCard = useMemo(() => {
    return function () {
      let newCard = randomCardKey(allKeys);
      setMyPlayerCard(newCard);
      sessionStorage.setItem(`guessy-${roomKey}-player-card`, newCard);
      sessionStorage.removeItem(
        `guessy-${roomKey}-player-card-${Number(gameKey) - 1}`
      );
    };
  }, [allKeys, roomKey, gameKey]);

  // **UseEffect

  useEffect(() => {
    let allPlayers = "";
    if (lastJsonMessage.players) {
      allPlayers = Object.keys(lastJsonMessage.players).join();
    }
    if (allPlayersRef.current != allPlayers) {
      if (lastJsonMessage?.players) {
        setPlayers({ ...lastJsonMessage.players });
        setPlayer1Uuid(lastJsonMessage.player1Uuid);
        setPlayer2Uuid(lastJsonMessage.player2Uuid);
        allPlayersRef.current = allPlayers;
      }
    }
    if (!myPlayerCard || myPlayerCard == "" || gameKeyRef.current != gameKey) {
      assignNewMyPlayerCard();
      gameKeyRef.current = gameKey;
    }
  }, [
    lastJsonMessage,
    assignNewMyPlayerCard,
    myPlayerCard,
    gameKeyRef,
    gameKey,
  ]);

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      myPlayerCard,
      assignNewMyPlayerCard,
      players,
      isObserver,
      player1Uuid,
      player2Uuid,
    };
  }, [
    myPlayerCard,
    assignNewMyPlayerCard,
    players,
    isObserver,
    player1Uuid,
    player2Uuid,
  ]);

  // ** render provider:
  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
}

export { PlayersProvider, PlayersContext };
