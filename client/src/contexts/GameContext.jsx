import { createContext, useEffect, useMemo, useState } from "react";
import useBreakpoint from "use-breakpoint";

import { useWS } from "./useContextHooks";
import { memeSampler } from "../assets/memeCollection";
import { useSearchParams } from "react-router-dom";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const GameContext = createContext();

const BREAKPOINTS = { 1: 0, 2: 540, 3: 740, 4: 980, 5: 1158, 6: 1380 };

function GameProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, "l");
  const { sendJsonMessage, lastGameContentsMessage, lastJsonMessage } = useWS();

  const [allKeys, setAllKeys] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [columnsObject, setColumnsObject] = useState({});
  const [validGame, setValidGame] = useState(false);
  const [staticGifs, setStaticGifs] = useState(
    sessionStorage.getItem("guessy-gifs") === "true"
  );
  const [gameKey, setGameKey] = useState(null);

  const roomKey = searchParams.get("roomKey");
  const columnCount = Number(breakpoint);

  const {
    allKeysChanged,
    columnsObjectChanged,
    lastGameContentsMessageChanged,
    lastJsonMessageChanged,
  } = useTraceUpdate(
    { allKeys, columnsObject, validGame, lastJsonMessage },
    false,
    "GameProvider"
  );

  const createGame = useMemo(() => {
    return () => {
      setLoadingCards(true);
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes(roomKey)) window.sessionStorage.removeItem(key);
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
      setLoadingCards(false);
    };
  }, [sendJsonMessage, roomKey, gameKey]);

  // **UseEffect
  useEffect(() => {
    if (lastJsonMessageChanged && lastJsonMessage?.type === "noGameAlert") {
      console.log("gameprovider noGameAlert");
      createGame();
    } else if (lastGameContentsMessageChanged || !validGame) {
      console.log("lastGameContentsMessage", lastGameContentsMessage);
      if (
        lastGameContentsMessage?.allKeys &&
        lastGameContentsMessage?.columnsObject
      ) {
        console.log(
          "lastGameContentsMessage.gameKey",
          lastGameContentsMessage.gameKey
        );
        setAllKeys(lastGameContentsMessage.allKeys.slice(0));
        setColumnsObject({ ...lastGameContentsMessage.columnsObject });
        setGameKey(lastGameContentsMessage.gameKey);
      }
    }
    if (columnsObjectChanged || allKeysChanged) {
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
  ]);

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      createGame,
      validGame,
      loadingCards,
      columns: columnsObject[columnCount],
      columnCount,
      staticGifs,
      setStaticGifs,
      allKeys,
      allKeysChanged,
      gameKey,
    };
  }, [
    createGame,
    validGame,
    columnsObject,
    columnCount,
    loadingCards,
    staticGifs,
    setStaticGifs,
    allKeys,
    allKeysChanged,
    gameKey,
  ]);

  // ** render provider:
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameProvider, GameContext };
