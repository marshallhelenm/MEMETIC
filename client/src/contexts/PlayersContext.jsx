import { createContext, useEffect, useMemo, useState } from "react";

import { randomCardKey } from "../utils/Helpers";
import { useGame, useWS } from "./useContextHooks";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { useSearchParams } from "react-router-dom";

const PlayersContext = createContext();

// ** Provider Logic Start

function PlayersProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { lastGameContentsMessage } = useWS();
  const { allKeys } = useGame();
  const roomKey = searchParams.get("roomKey");

  const [myPlayerCard, setMyPlayerCard] = useState("");
  const [otherPlayers, setOtherPlayers] = useState([]);

  const { lastGameContentsMessageChanged } = useTraceUpdate(
    { allKeys },
    false,
    "PlayersProvider"
  );

  // ** Functions

  const assignNewMyPlayerCard = useMemo(() => {
    return function () {
      let newCard = randomCardKey(allKeys);
      console.log("setMyPlayerCard: ", newCard);
      setMyPlayerCard(newCard);
      sessionStorage.setItem(`guessy-${roomKey}-player-card`, newCard);
    };
  }, [allKeys, roomKey]);

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      myPlayerCard,
      assignNewMyPlayerCard,
      otherPlayers,
    };
  }, [myPlayerCard, assignNewMyPlayerCard, otherPlayers]);

  // **UseEffect

  useEffect(() => {
    if (lastGameContentsMessageChanged && lastGameContentsMessage?.players) {
      console.log("lastGameContentsMessage", "has players");
      let players = lastGameContentsMessage.players;
      let incomingPlayerNames = [];
      Object.keys(players).forEach((uuid) => {
        if (
          uuid != sessionStorage.getItem("guessy-uuid") &&
          !otherPlayers.includes(players[uuid])
        )
          incomingPlayerNames.push(players[uuid]);
      });
      setOtherPlayers(incomingPlayerNames.slice(0));
    }
  }, [lastGameContentsMessageChanged, lastGameContentsMessage, otherPlayers]);

  // ** render provider:
  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
}

export { PlayersProvider, PlayersContext };
