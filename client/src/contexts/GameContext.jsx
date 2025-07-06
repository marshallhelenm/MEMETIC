import { createContext, useEffect, useMemo, useState } from "react";
import useBreakpoint from "use-breakpoint";

import { useWS } from "../hooks/useContextHooks";
import { memeSampler } from "../assets/memeCollection";
import { useSearchParams } from "react-router-dom";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const GameContext = createContext();

const BREAKPOINTS = { 1: 0, 2: 540, 3: 740, 4: 980, 5: 1158, 6: 1380 };

const calculateDialogWidth = (breakpoint) => {
  switch (breakpoint) {
    case "1":
      return "230px";
    case "2":
      return "300px";
    case "3":
      return "400px";
    case "4":
      return "500px";
    case "5":
      return "700px";
    case "6":
      return "800px";
    default:
      return "400px";
  }
};

function GameProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, "l");
  let dialogWidth = calculateDialogWidth(breakpoint);
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
    { allKeys, columnsObject, validGame, lastJsonMessage, gameKey },
    false,
    "GameProvider"
  );

  const createGame = useMemo(() => {
    return () => {
      setLoadingCards(true);
      setValidGame(false);
      setAllKeys([]);
      setColumnsObject({});
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
    };
  }, [sendJsonMessage, roomKey, gameKey]);

  // **UseEffect
  useEffect(() => {
    console.log(
      "GameContext: lastGameContentsMessage: ",
      JSON.stringify(lastGameContentsMessage.gameKey),
      gameKey
    );

    if (lastJsonMessageChanged && lastJsonMessage?.type === "noGameAlert") {
      createGame();
    } else if (
      lastGameContentsMessageChanged ||
      !validGame ||
      (lastGameContentsMessage?.gameKey &&
        lastGameContentsMessage.gameKey != gameKey)
    ) {
      if (
        lastGameContentsMessage?.allKeys &&
        lastGameContentsMessage?.columnsObject
      ) {
        setAllKeys([]);
        setColumnsObject({});
        setAllKeys(lastGameContentsMessage.allKeys.slice(0));
        setColumnsObject({ ...lastGameContentsMessage.columnsObject });
        setGameKey(lastGameContentsMessage.gameKey);
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

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      createGame,
      validGame,
      setLoadingCards,
      loadingCards,
      columns: columnsObject[columnCount],
      columnCount,
      staticGifs,
      setStaticGifs,
      allKeys,
      gameKey,
      dialogWidth,
    };
  }, [
    createGame,
    validGame,
    columnsObject,
    columnCount,
    setLoadingCards,
    loadingCards,
    staticGifs,
    setStaticGifs,
    allKeys,
    gameKey,
    dialogWidth,
  ]);

  // ** render provider:
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameProvider, GameContext };
