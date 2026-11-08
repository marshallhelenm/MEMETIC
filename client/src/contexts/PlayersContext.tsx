import React, { createContext, useCallback, useEffect, useMemo, ReactNode } from "react";

import { useGame, useWS } from "../hooks/useContextHooks";
import { useSearchParams } from "react-router-dom";
import { setSessionItem } from "../utils/sessionStorageUtils";
import { getPlayerId } from "../utils/playerId";
import type { PlayerState } from "../messages";

/** Where this tab remembers its card, so it can hand it back to the server on re-join. */
export const cardStorageKey = (roomKey: string | null) => `guessy-${roomKey}-player-card`;

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
  const { lastGameContentsMessage, sendJsonMessage } = useWS();
  const { gameKey } = useGame();
  const roomKey = searchParams.get("roomKey");
  const myUuid = getPlayerId();

  // Players, roles and cards all come from the server's latest game contents.
  const players = lastGameContentsMessage?.players ?? NO_PLAYERS;
  const player1Uuid = lastGameContentsMessage?.player1Uuid ?? "";
  const player2Uuid = lastGameContentsMessage?.player2Uuid ?? "";
  const isPlayer1 = myUuid === player1Uuid;
  const isPlayer2 = myUuid === player2Uuid;
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
    setSessionItem(cardStorageKey(roomKey), JSON.stringify({ gameKey, card: myPlayerCard }));
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
