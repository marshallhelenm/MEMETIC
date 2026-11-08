import React, { createContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { useWS } from "../hooks/useContextHooks";
import useLayoutBreakpoint from "../hooks/useLayoutBreakpoint";
import { memeSampler } from "../assets/memeCollection";
import type { ServerMessage } from "../messages";
import { getSessionItem, setSessionItem } from "../utils/sessionStorageUtils";

const STATIC_GIFS_KEY = "guessy-gifs";

export type GameContextValue = GameContextType;
interface GameContextType {
  createGame: () => void;
  validGame: boolean;
  columns: any;
  columnCount: number;
  columnWidth: number;
  boardWidth: number;
  staticGifs: boolean;
  setStaticGifs: React.Dispatch<React.SetStateAction<boolean>>;
  gameKey: number | null;
  dialogWidth: string;
  mobile?: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

function GameProvider({ children }: GameProviderProps) {
  const [searchParams] = useSearchParams();
  const { columnCount, columnWidth, boardWidth, dialogWidth, mobile } =
    useLayoutBreakpoint();
  const { sendJsonMessage, lastGameContentsMessage, lastJsonMessage } = useWS();
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [columnsObject, setColumnsObject] = useState<any>({});
  const [staticGifs, setStaticGifs] = useState(
    () => getSessionItem(STATIC_GIFS_KEY) === "true"
  );
  const [gameKey, setGameKey] = useState<number | null>(null);

  const roomKey = searchParams.get("roomKey");
  // True from dealing a game until the server confirms it with gameContents.
  const dealPendingRef = useRef(false);
  const handledAlertRef = useRef<ServerMessage | null>(null);

  const createGame = useMemo(() => {
    return () => {
      if (!roomKey) return;
      dealPendingRef.current = true;
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes(roomKey)) window.sessionStorage.removeItem(key);
      });
      const newMemes = memeSampler();
      setColumnsObject({ ...newMemes.columnsObject });
      setAllKeys(newMemes.allKeys.slice(0));
      sendJsonMessage({
        type: "setGame",
        roomKey: roomKey,
        columnsObject: newMemes.columnsObject,
        allKeys: newMemes.allKeys,
      });
    };
  }, [sendJsonMessage, roomKey]);

  // The server's game state is the source of truth: copy it in whenever it arrives.
  useEffect(() => {
    if (!lastGameContentsMessage) return;
    dealPendingRef.current = false;
    setAllKeys(lastGameContentsMessage.allKeys.slice(0));
    setColumnsObject({ ...lastGameContentsMessage.columnsObject });
    setGameKey(lastGameContentsMessage.gameKey ?? null);
  }, [lastGameContentsMessage]);

  // The room has no game yet: deal one. Each alert is handled once, and alerts
  // that arrive while our own deal awaits confirmation (answers to earlier join
  // retries) are ignored so the room isn't dealt twice.
  useEffect(() => {
    if (lastJsonMessage?.type !== "noGameAlert") return;
    if (handledAlertRef.current === lastJsonMessage) return;
    handledAlertRef.current = lastJsonMessage;
    if (dealPendingRef.current) return;
    createGame();
  }, [lastJsonMessage, createGame]);

  useEffect(() => {
    setSessionItem(STATIC_GIFS_KEY, String(staticGifs));
  }, [staticGifs]);

  const validGame = allKeys.length === 24 && Object.keys(columnsObject).length === 6;

  const value = useMemo(() => {
    return {
      createGame,
      validGame,
      columns: columnsObject[columnCount],
      columnCount,
      columnWidth,
      boardWidth,
      staticGifs,
      setStaticGifs,
      gameKey,
      dialogWidth,
      mobile,
    };
  }, [
    createGame,
    validGame,
    columnsObject,
    columnCount,
    columnWidth,
    boardWidth,
    staticGifs,
    setStaticGifs,
    gameKey,
    dialogWidth,
    mobile
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameProvider, GameContext };
