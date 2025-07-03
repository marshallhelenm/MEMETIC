import { createContext, useMemo, useReducer, useState } from "react";
import useBreakpoint from "use-breakpoint";

import { useWS } from "./useContextHooks";
import { memeSampler } from "../assets/memeCollection";
import { devLog, waitUntil } from "../utils/Helpers";
import { useSearchParams } from "react-router-dom";

const GameContext = createContext();

const BREAKPOINTS = { 1: 0, 2: 540, 3: 740, 4: 980, 5: 1158, 6: 1380 };

function gameReducer(state, action) {
  const type = action.type;
  const payload = action.payload;

  devLog(["gameReducer: ", type]);

  switch (type) {
    case "setGame":
      return {
        ...state,
        columnsObject: payload.columnsObject,
        allKeys: payload.allKeys,
        loadingCards: false,
      };
    default:
      throw new Error(["Action unknown in gameReducer: ", action]);
  }
}

function GameProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, "l");
  const { connectionOpen, sendJsonMessage } = useWS();

  const [allKeys, setAllKeys] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [columnsObject, setColumnsObject] = useState({});

  const roomKey = searchParams.get("roomKey");
  const columnCount = Number(breakpoint);

  const roomObjectIsValid = useMemo(() => {
    return () => {
      return allKeys.length == 24 && Object.keys(columnsObject).length == 6;
    };
  }, [allKeys, columnsObject]);

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

  const setGame = useMemo(() => {
    return ({ newKeys, newColumnsObject }) => {
      setAllKeys(newKeys.slice(0));
      setColumnsObject({ ...newColumnsObject });
    };
  }, []);

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      createGame,
      roomObjectIsValid,
      loadingCards,
      columns: columnsObject[columnCount],
      columnCount,
      setGame,
    };
  }, [
    createGame,
    roomObjectIsValid,
    columnsObject,
    columnCount,
    loadingCards,
    setGame,
  ]);

  // **UseEffect

  // ** render provider:
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameProvider, GameContext };
