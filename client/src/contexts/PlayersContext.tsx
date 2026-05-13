import React, { createContext, useEffect, useMemo, useState, useRef, ReactNode } from "react";

import { randomCardKey } from "../utils/helpers";
import { useGame, useWS } from "../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";



export interface PlayersContextValue {
  myPlayerCard: string | null;
  setMyPlayerCard: React.Dispatch<React.SetStateAction<string | null>>;
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
  const { allKeys, gameKey } = useGame();
  const gameKeyRef = useRef<string | null>(gameKey);
  const roomKey = searchParams.get("roomKey");
  const [myPlayerCard, setMyPlayerCard] = useState<string | null>(
    sessionStorage.getItem(`guessy-${roomKey}-player-card`),
  );
  const [players, setPlayers] = useState<Record<string, any>>({});
  const allPlayersRef = useRef<string>("");
  const [player1Uuid, setPlayer1Uuid] = useState<string>("");
  const [player2Uuid, setPlayer2Uuid] = useState<string>("");
  const isObserver = ![player1Uuid, player2Uuid].includes(
    sessionStorage.getItem("guessy-uuid") || "",
  );
  const player1Card = players[player1Uuid]?.card;
  const player2Card = players[player2Uuid]?.card;

  // ** Functions

  const assignNewMyPlayerCard = useMemo(() => {
    return function () {
      let newCard = randomCardKey(allKeys);
      setMyPlayerCard(newCard);
      sessionStorage.setItem(
        `guessy-${roomKey}-player-card-${gameKey}`,
        newCard,
      );
      sessionStorage.removeItem(
        `guessy-${roomKey}-player-card-${Number(gameKey) - 1}`,
      );
      sendJsonMessage({ type: "setPlayerCard", roomKey, card: newCard });
    };
  }, [allKeys, roomKey, gameKey, sendJsonMessage]);

  const demotePlayer2 = useMemo<((demoteeUuid: string) => void)>(() => {
    return function (demoteeUuid: string) {
      if (demoteeUuid == player2Uuid) {
        setPlayer2Uuid("");
        sendJsonMessage({ type: "demotePlayer2", roomKey });
      }
    };
  }, [player2Uuid, sendJsonMessage, roomKey]);

  // **UseEffect

  useEffect(() => {
    let allPlayers = "";
    if (lastJsonMessage?.players) {
      allPlayers = JSON.stringify(lastJsonMessage.players);
      if (allPlayersRef.current != allPlayers) {
        if (lastJsonMessage?.players) {
          setPlayers({ ...lastJsonMessage.players });
          setPlayer1Uuid(lastJsonMessage.player1Uuid);
          setPlayer2Uuid(lastJsonMessage.player2Uuid);
          allPlayersRef.current = allPlayers;
        }
      } else if (
        lastJsonMessage.player2Uuid &&
        player2Uuid != lastJsonMessage.player2Uuid
      ) {
        setPlayer2Uuid(lastJsonMessage.player2Uuid);
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
    player2Uuid,
  ]);

  //  ** value for the context provider **
  const value: PlayersContextValue = useMemo(() => {
    return {
      myPlayerCard,
      setMyPlayerCard,
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
    setMyPlayerCard,
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
