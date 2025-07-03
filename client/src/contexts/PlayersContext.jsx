import { createContext, useMemo, useState } from "react";

import { randomCardKey } from "../utils/Helpers";

const PlayersContext = createContext();

const searchParams = new URLSearchParams(window.location.search);

// ** Provider Logic Start

function PlayersProvider({ children }) {
  // ** State and variables
  const roomKey = searchParams.get("roomKey");

  const [myPlayerCard, setMyPlayerCard] = useState("");
  const [otherPlayers, setOtherPlayers] = useState([]);

  // ** Functions

  const assignNewMyPlayerCard = useMemo(() => {
    return function (newMemes) {
      setMyPlayerCard(randomCardKey(newMemes.allKeys));
    };
  }, [setMyPlayerCard]);

  const handleSetMyPlayerCard = useMemo(() => {
    return (newCard) => {
      setMyPlayerCard(newCard);
      sessionStorage.setItem(`guessy-${roomKey}-player-card`, newCard);
    };
  }, [roomKey]);

  const handleSetOtherPlayers = useMemo(() => {
    return (players) => {
      let incomingPlayerNames = [];
      Object.keys(players).forEach((uuid) => {
        if (
          uuid != sessionStorage.getItem("guessy-uuid") &&
          !otherPlayers.includes(players[uuid])
        )
          incomingPlayerNames.push(players[uuid]);
      });
      setOtherPlayers(incomingPlayerNames.slice(0));
    };
  }, [otherPlayers]);

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      myPlayerCard,
      assignNewMyPlayerCard,
      handleSetMyPlayerCard,
      otherPlayers,
      handleSetOtherPlayers,
    };
  }, [
    myPlayerCard,
    assignNewMyPlayerCard,
    handleSetMyPlayerCard,
    otherPlayers,
    handleSetOtherPlayers,
  ]);

  // **UseEffect

  // ** render provider:
  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
}

export { PlayersProvider, PlayersContext };
