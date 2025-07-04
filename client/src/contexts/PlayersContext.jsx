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
  const [otherPlayers, setOtherPlayers] = useState([]);
  const lastMessageRef = useRef(lastJsonMessage);

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
    if (lastMessageRef.current != lastJsonMessage) {
      lastMessageRef.current = lastJsonMessage;
      if (lastJsonMessage?.players) {
        let players = lastJsonMessage.players;
        let incomingPlayerNames = [];
        Object.keys(players).forEach((uuid) => {
          if (uuid != sessionStorage.getItem("guessy-uuid"))
            incomingPlayerNames.push(players[uuid]);
        });
        setOtherPlayers(incomingPlayerNames.slice(0));
      }
    }
    if (!myPlayerCard || myPlayerCard == "" || gameKeyRef.current != gameKey) {
      assignNewMyPlayerCard();
      gameKeyRef.current = gameKey;
    }
  }, [
    lastJsonMessage,
    lastMessageRef,
    otherPlayers,
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
      otherPlayers,
    };
  }, [myPlayerCard, assignNewMyPlayerCard, otherPlayers]);

  // ** render provider:
  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
}

export { PlayersProvider, PlayersContext };
