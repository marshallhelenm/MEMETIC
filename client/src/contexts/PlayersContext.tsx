import React, { createContext, useCallback, useEffect, useMemo, ReactNode } from "react";

import { useGame, useWS } from "../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";
import { rememberCard } from "../utils/rememberedCard";
import type { PlayerState } from "../messages";

export interface PlayersContextValue {
  /** This tab's player ID. */
  myUuid: string;
  isPlayer1: boolean;
  isPlayer2: boolean;
  myPlayerCard: string | null;
  players: Record<string, PlayerState>;
  player1Uuid: string;
  player2Uuid: string;
  isObserver: boolean;
  player1Card: string | undefined;
  player2Card: string | undefined;
  assignNewMyPlayerCard: () => void;
  demotePlayer2: (demoteeUuid: string) => void;
}

interface PlayersProviderProps {
  children: ReactNode;
}

const PlayersContext = createContext<PlayersContextValue | undefined>(undefined);

const NO_PLAYERS: Record<string, PlayerState> = {};

function PlayersProvider({ children }: PlayersProviderProps) {
  const [searchParams] = useSearchParams();
  const { lastGameContentsMessage, sendJsonMessage, myPlayerId } = useWS();
  const { gameKey } = useGame();
  const roomKey = searchParams.get("roomKey");
  // The public ID the server told us; other players see this, never our secret.
  const myUuid = myPlayerId ?? "";

  // Players, roles and cards all come from the server's latest game contents.
  const players = lastGameContentsMessage?.players ?? NO_PLAYERS;
  const player1Uuid = lastGameContentsMessage?.player1Uuid ?? "";
  const player2Uuid = lastGameContentsMessage?.player2Uuid ?? "";
  // Until we know our ID, we aren't either player (an empty ID would match an empty slot).
  const isPlayer1 = !!myUuid && myUuid === player1Uuid;
  const isPlayer2 = !!myUuid && myUuid === player2Uuid;
  const isObserver = !isPlayer1 && !isPlayer2;
  const myPlayerCard: string | null = players[myUuid]?.card ?? null;
  const player1Card = players[player1Uuid]?.card;
  const player2Card = players[player2Uuid]?.card;

  const assignNewMyPlayerCard = useCallback(() => {
    if (!roomKey) return;
    sendJsonMessage({ type: "requestNewCard", roomKey });
  }, [roomKey, sendJsonMessage]);

  const demotePlayer2 = useCallback(
    (demoteeUuid: string) => {
      if (roomKey && demoteeUuid === player2Uuid) {
        sendJsonMessage({ type: "demotePlayer2", roomKey });
      }
    },
    [player2Uuid, sendJsonMessage, roomKey]
  );

  // Remember the server's card for this game as a backup (sent back on re-join).
  useEffect(() => {
    if (myPlayerCard == null || gameKey == null) return;
    rememberCard(roomKey, gameKey, myPlayerCard);
  }, [myPlayerCard, gameKey, roomKey]);

  const value: PlayersContextValue = useMemo(
    () => ({
      myUuid,
      isPlayer1,
      isPlayer2,
      myPlayerCard,
      players,
      player1Uuid,
      player2Uuid,
      isObserver,
      player1Card,
      player2Card,
      assignNewMyPlayerCard,
      demotePlayer2,
    }),
    [
      myUuid,
      isPlayer1,
      isPlayer2,
      myPlayerCard,
      players,
      player1Uuid,
      player2Uuid,
      isObserver,
      player1Card,
      player2Card,
      assignNewMyPlayerCard,
      demotePlayer2,
    ]
  );

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export { PlayersProvider, PlayersContext };
