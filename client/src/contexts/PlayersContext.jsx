import { createContext, useEffect, useMemo, useState } from "react";

import { randomCardKey } from "../utils/Helpers";
import { useGame, useWS } from "./useContextHooks";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { useSearchParams } from "react-router-dom";

const PlayersContext = createContext();

// ** Provider Logic Start

function PlayersProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { lastGameContentsMessage, lastJsonMessage } = useWS();
  const { allKeys, gameKey } = useGame();
  const roomKey = searchParams.get("roomKey");

  const [myPlayerCard, setMyPlayerCard] = useState(
    sessionStorage.getItem(`guessy-${roomKey}-player-card`)
  );
  const [otherPlayers, setOtherPlayers] = useState([]);

  const { playersChanged, gameKeyChangedEstablished, lastJsonMessageChanged } =
    useTraceUpdate(
      { players: lastGameContentsMessage?.players, gameKey, lastJsonMessage },
      false,
      "PlayersProvider"
    );

  // ** Functions

  const assignNewMyPlayerCard = useMemo(() => {
    return function () {
      let newCard = randomCardKey(allKeys);
      setMyPlayerCard(newCard);
      sessionStorage.setItem(`guessy-${roomKey}-player-card`, newCard);
    };
  }, [allKeys, roomKey]);

  // **UseEffect

  useEffect(() => {
    if (lastJsonMessageChanged && lastJsonMessage?.players) {
      let players = lastJsonMessage.players;
      let incomingPlayerNames = [];
      Object.keys(players).forEach((uuid) => {
        if (uuid != sessionStorage.getItem("guessy-uuid"))
          incomingPlayerNames.push(players[uuid]);
      });
      setOtherPlayers(incomingPlayerNames.slice(0));
    }
    if (!myPlayerCard || myPlayerCard == "" || gameKeyChangedEstablished) {
      assignNewMyPlayerCard();
    }
  }, [
    playersChanged,
    lastJsonMessage,
    lastJsonMessageChanged,
    otherPlayers,
    gameKeyChangedEstablished,
    assignNewMyPlayerCard,
    myPlayerCard,
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
