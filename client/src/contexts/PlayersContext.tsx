import React, { createContext, useEffect, useMemo, useState, useRef, ReactNode } from "react";

import { useGame, useWS } from "../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";
import { setSessionItem } from "../utils/sessionStorageUtils";
import { getPlayerId } from "../utils/playerId";

/** Where this tab remembers its card, so it can hand it back to the server on re-join. */
export const cardStorageKey = (roomKey: string | null) => `guessy-${roomKey}-player-card`;

export interface PlayersContextValue {
  myPlayerCard: string | null;
  players: Record<string, any>;
  setPlayers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  player1Uuid: string;
  setPlayer1Uuid: React.Dispatch<React.SetStateAction<string>>;
  player2Uuid: string;
  setPlayer2Uuid: React.Dispatch<React.SetStateAction<string>>;
  isObserver: boolean;
  player1Card: any;
  player2Card: any;
  assignNewMyPlayerCard: () => void;
  demotePlayer2: (demoteeUuid: string) => void;
}

interface PlayersProviderProps {
  children: ReactNode;
}

const PlayersContext = createContext<PlayersContextValue | undefined>(undefined);

// ** Provider Logic Start

function PlayersProvider({ children }: PlayersProviderProps) {
  const [searchParams] = useSearchParams();
  const { lastJsonMessage, sendJsonMessage } = useWS();
  const { gameKey } = useGame();
  const roomKey = searchParams.get("roomKey");
  const myUuid = getPlayerId();
  const [players, setPlayers] = useState<Record<string, any>>({});
  const allPlayersRef = useRef<string>("");
  const [player1Uuid, setPlayer1Uuid] = useState<string>("");
  const [player2Uuid, setPlayer2Uuid] = useState<string>("");
  const isObserver = ![player1Uuid, player2Uuid].includes(myUuid);
  // Cards are dealt and stored by the server.
  const myPlayerCard: string | null = players[myUuid]?.card ?? null;
  const player1Card = players[player1Uuid]?.card;
  const player2Card = players[player2Uuid]?.card;

  // ** Functions

  const assignNewMyPlayerCard = useMemo(() => {
    return function () {
      if (!roomKey) return;
      sendJsonMessage({ type: "requestNewCard", roomKey });
    };
  }, [roomKey, sendJsonMessage]);

  const demotePlayer2 = useMemo<((demoteeUuid: string) => void)>(() => {
    return function (demoteeUuid: string) {
      if (roomKey && demoteeUuid == player2Uuid) {
        setPlayer2Uuid("");
        sendJsonMessage({ type: "demotePlayer2", roomKey });
      }
    };
  }, [player2Uuid, sendJsonMessage, roomKey]);

  // **UseEffect

  useEffect(() => {
    if (lastJsonMessage?.type !== "gameContents" || !lastJsonMessage.players) return;
    const allPlayers = JSON.stringify(lastJsonMessage.players);
    if (allPlayersRef.current != allPlayers) {
      setPlayers({ ...lastJsonMessage.players });
      setPlayer1Uuid(lastJsonMessage.player1Uuid ?? "");
      setPlayer2Uuid(lastJsonMessage.player2Uuid ?? "");
      allPlayersRef.current = allPlayers;
    } else if (
      lastJsonMessage.player2Uuid &&
      player2Uuid != lastJsonMessage.player2Uuid
    ) {
      setPlayer2Uuid(lastJsonMessage.player2Uuid);
    }
  }, [lastJsonMessage, player2Uuid]);

  // Remember the server's card for this game as a backup (sent back on re-join).
  useEffect(() => {
    if (myPlayerCard == null || gameKey == null) return;
    setSessionItem(cardStorageKey(roomKey), JSON.stringify({ gameKey, card: myPlayerCard }));
  }, [myPlayerCard, gameKey, roomKey]);

  //  ** value for the context provider **
  const value: PlayersContextValue = useMemo(() => {
    return {
      myPlayerCard,
      players,
      setPlayers,
      player1Uuid,
      setPlayer1Uuid,
      player2Uuid,
      setPlayer2Uuid,
      isObserver,
      player1Card,
      player2Card,
      assignNewMyPlayerCard,
      demotePlayer2,
    };
  }, [
    myPlayerCard,
    players,
    setPlayers,
    player1Uuid,
    setPlayer1Uuid,
    player2Uuid,
    setPlayer2Uuid,
    isObserver,
    player1Card,
    player2Card,
    assignNewMyPlayerCard,
    demotePlayer2,
  ]);

  // ** render provider:
  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
}

export { PlayersProvider, PlayersContext };
