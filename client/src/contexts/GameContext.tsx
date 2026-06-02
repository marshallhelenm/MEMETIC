import React, { createContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { useWS } from "../hooks/useContextHooks";
import useLayoutBreakpoint from "../hooks/useLayoutBreakpoint";
import { memeSampler } from "../assets/memeCollection";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

import type { GenericMessage } from "../../shared/types/messages";

// Types for WebSocket context values (temporary, should be improved)
interface GameContentsMessage {
  allKeys?: any[];
  columnsObject?: any;
  gameKey?: number;
  chatHistory?: any[];
}

interface JsonMessage {
  type?: string;
}

type TraceUpdateResult = {
  allKeysChanged?: boolean;
  columnsObjectChanged?: boolean;
  lastGameContentsMessageChanged?: boolean;
  lastJsonMessageChanged?: boolean;
};

export type GameContextValue = GameContextType;
interface GameContextType {
  createGame: () => void;
  validGame: boolean;
  setLoadingCards: React.Dispatch<React.SetStateAction<boolean>>;
  loadingCards: boolean;
  columns: any;
  columnCount: number;
  columnWidth: number;
  boardWidth: number;
  staticGifs: boolean;
  setStaticGifs: React.Dispatch<React.SetStateAction<boolean>>;
  allKeys: any[];
  gameKey: number | null;
  dialogWidth: string;
  messageHistory: any[];
  setMessageHistory: React.Dispatch<React.SetStateAction<any[]>>;
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
  const { sendJsonMessage, lastGameContentsMessage, lastJsonMessage } = useWS() as {
    sendJsonMessage: (msg: GenericMessage) => void;
    lastGameContentsMessage?: GameContentsMessage;
    lastJsonMessage?: GenericMessage;
  }
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [columnsObject, setColumnsObject] = useState<any>({});
  const [validGame, setValidGame] = useState(false);
  const [staticGifs, setStaticGifs] = useState(
    sessionStorage.getItem("guessy-gifs") === "true"
  );
  const [gameKey, setGameKey] = useState<number | null>(null);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  const roomKey = searchParams.get("roomKey");

  const {
    allKeysChanged,
    columnsObjectChanged,
    lastGameContentsMessageChanged,
    lastJsonMessageChanged,
  } = useTraceUpdate(
    { allKeys, columnsObject, validGame, lastJsonMessage, gameKey },
    false,
    "GameProvider"
  ) as TraceUpdateResult;

  const createGame = useMemo(() => {
    return () => {
      setLoadingCards(true);
      setValidGame(false);
      setAllKeys([]);
      setColumnsObject({});
      Object.keys(sessionStorage).forEach((key) => {
        if (roomKey && key.includes(roomKey)) window.sessionStorage.removeItem(key);
      });
      let newGameKey = Number(gameKey) + 1;
      setGameKey(newGameKey);
      const newMemes = memeSampler();
      setColumnsObject({ ...newMemes.columnsObject });
      setAllKeys(newMemes.allKeys.slice(0));
      sendJsonMessage({
        type: "setGame",
        roomKey: roomKey,
        columnsObject: newMemes.columnsObject,
        allKeys: newMemes.allKeys,
        gameKey: newGameKey,
      });
    };
  }, [sendJsonMessage, roomKey, gameKey]);

  useEffect(() => {
    const typedLastJsonMessage = lastJsonMessage as JsonMessage;
    const typedLastGameContentsMessage = lastGameContentsMessage as GameContentsMessage;
    if (lastJsonMessageChanged && typedLastJsonMessage?.type === "noGameAlert") {
      createGame();
    } else if (
      lastGameContentsMessageChanged ||
      !validGame ||
      (typedLastGameContentsMessage?.gameKey &&
        typedLastGameContentsMessage.gameKey != gameKey)
    ) {
      if (
        typedLastGameContentsMessage?.allKeys &&
        typedLastGameContentsMessage?.columnsObject
      ) {
        setAllKeys([]);
        setColumnsObject({});
        setAllKeys(typedLastGameContentsMessage.allKeys.slice(0));
        setColumnsObject({ ...typedLastGameContentsMessage.columnsObject });
        setGameKey(typedLastGameContentsMessage.gameKey ?? null);
        setMessageHistory(typedLastGameContentsMessage.chatHistory ?? []);
      }
    }
    if (columnsObjectChanged || allKeysChanged) {
      setLoadingCards(false);
      setValidGame(
        allKeys.length == 24 && Object.keys(columnsObject).length == 6
      );
    }
  }, [
    allKeys,
    columnsObject,
    columnsObjectChanged,
    allKeysChanged,
    lastGameContentsMessage,
    lastGameContentsMessageChanged,
    validGame,
    createGame,
    lastJsonMessage,
    lastJsonMessageChanged,
    gameKey,
  ]);

  const value = useMemo(() => {
    return {
      createGame,
      validGame,
      setLoadingCards,
      loadingCards,
      columns: columnsObject[columnCount],
      columnCount,
      columnWidth,
      boardWidth,
      staticGifs,
      setStaticGifs,
      allKeys,
      gameKey,
      dialogWidth,
      messageHistory,
      setMessageHistory,
      mobile,
    };
  }, [
    createGame,
    validGame,
    columnsObject,
    columnCount,
    columnWidth,
    boardWidth,
    setLoadingCards,
    loadingCards,
    staticGifs,
    setStaticGifs,
    allKeys,
    gameKey,
    dialogWidth,
    messageHistory,
    setMessageHistory,
    mobile
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameProvider, GameContext };
