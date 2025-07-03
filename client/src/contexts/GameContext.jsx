import { createContext, useEffect, useMemo, useState } from "react";
import useBreakpoint from "use-breakpoint";

import { useWS } from "./useContextHooks";
import { memeSampler } from "../assets/memeCollection";
import { devLog, waitUntil } from "../utils/Helpers";
import { useSearchParams } from "react-router-dom";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const GameContext = createContext();

const BREAKPOINTS = { 1: 0, 2: 540, 3: 740, 4: 980, 5: 1158, 6: 1380 };

function GameProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, "l");
  const {
    connectionOpen,
    sendJsonMessage,
    lastGameContentsMessage,
    lastJsonMessage,
  } = useWS();

  const [allKeys, setAllKeys] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [columnsObject, setColumnsObject] = useState({});
  const [validGame, setValidGame] = useState(false);
  const [staticGifs, setStaticGifs] = useState(
    sessionStorage.getItem("guessy-gifs") === "true"
  );

  const roomKey = searchParams.get("roomKey");
  const columnCount = Number(breakpoint);

  const {
    allKeysChanged,
    columnsObjectChanged,
    lastGameContentsMessageChanged,
    lastJsonMessageChanged,
  } = useTraceUpdate(
    { allKeys, columnsObject, validGame },
    true,
    "GameProvider"
  );

  const createGame = useMemo(() => {
    return async function () {
      setLoadingCards(true);
      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes(roomKey)) window.sessionStorage.removeItem(key);
      });
      let ready = await waitUntil(connectionOpen);
      if (ready) {
        const newMemes = memeSampler();
        setColumnsObject({ ...newMemes.columnsObject });
        setAllKeys(newMemes.allKeys.slice(0));
        sendJsonMessage({
          type: "setGame",
          roomKey: roomKey,
          columnsObject: newMemes.columnsObject,
          allKeys: newMemes.allKeys,
        });
      }
      setLoadingCards(false);
    };
  }, [connectionOpen, sendJsonMessage, roomKey]);

  // **UseEffect
  useEffect(() => {
    if (lastJsonMessageChanged && lastJsonMessage?.type === "noGameAlert") {
      createGame();
    }
    if (lastGameContentsMessageChanged || !validGame) {
      console.log("lastGameContentsMessage", lastGameContentsMessage);
      if (
        lastGameContentsMessage?.allKeys &&
        lastGameContentsMessage?.columnsObject
      ) {
        console.log("lastGameContentsMessage", "has keys");
        setAllKeys(lastGameContentsMessage.allKeys.slice(0));
        setColumnsObject({ ...lastGameContentsMessage.columnsObject });
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
  ]);

  // ** render provider:
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameProvider, GameContext };
