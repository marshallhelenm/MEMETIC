import { createContext, useMemo, useEffect, useReducer, useRef } from "react";
import useBreakpoint from "use-breakpoint";

import { useWS } from "./useWS";
import { memeSampler } from "../assets/memeCollection";
import { devLog, waitUntil, randomCardKey } from "../utils/Helpers";
import { parseRoom, parseUsers } from "../utils/RoomParser";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const GuessyContext = createContext();

const BREAKPOINTS = { 1: 0, 2: 540, 3: 740, 4: 980, 5: 1158, 6: 1380 };

const searchParams = new URLSearchParams(window.location.search);
const initialState = {
  roomKey: searchParams.get("roomKey"),
  allKeys: [],
  columnsObject: {},
  myPlayerCard: "",
  username: searchParams.get("username"),
  partnerCard: "",
  partnerUsername: "",
  observer: false,
  staticGifs: sessionStorage.getItem("guessy_gifs") == "true",
  loadingCards: false,
};

function guessyReducer(state, action) {
  const type = action.type;
  const payload = action.payload;
  let parsedRoom = {};
  let parsedUsers = {};
  const sessionPlayerCard = sessionStorage.getItem(
    `guessy-${state.roomKey}-player-card`
  );
  // devLog(["guessyReducer: ", payload?.uuid]);

  switch (type) {
    case "setLoadingCards":
      return { ...state, loadingCards: payload.loadingCards };
    case "setStaticGifs":
      return { ...state, staticGifs: payload.staticGifs };
    case "setUsername":
      return { ...state, username: payload.newUsername };
    case "updateMemeSet":
      // not happening here, payload is only columnsObject and allKeys
      return { ...state, ...payload };
    case "updateMyPlayerCard":
      sessionStorage.setItem(
        `guessy-${state.roomKey}-player-card`,
        payload.newCard
      );
      return { ...state, myPlayerCard: payload.newCard };
    case "updatePartnerCard":
      return { ...state, partnerCard: payload.partnerCard };
    case "updateRoom":
      parsedRoom = parseRoom({
        roomKey: state.roomKey,
        myUuid: payload.uuid || sessionStorage.getItem("guessy-uuid"),
        roomObject: payload.roomObject,
      });
      return {
        ...state,
        ...parsedRoom,
        myPlayerCard:
          parsedRoom.myPlayerCard || sessionPlayerCard || state.myPlayerCard,
        loadingCards: false,
      };
    case "updateRoomKey":
      return { ...state, roomKey: payload.newRoomKey };
    case "updateUsername":
      return { ...state, username: payload.username };
    case "updateUsers":
      // devLog(["reducer updateUsers: ", payload]);
      parsedUsers = parseUsers({
        roomKey: state.roomKey,
        myUuid: payload.uuid || sessionStorage.getItem("guessy-uuid"),
        player1: payload.player1,
        player2: payload.player2,
      });
      return {
        ...state,
        ...parsedUsers,
        myPlayerCard:
          parsedRoom.myPlayerCard || sessionPlayerCard || state.myPlayerCard,
      };
    case "wipeRoom":
      return { ...initialState, roomKey: "" };
    default:
      throw new Error(["Action unknown in guessyReducer: ", action]);
  }
}

// ** Provider Logic Start

function GuessyProvider({ children }) {
  // ** State and variables
  const { connectionOpen, uuidRef, sendJsonMessage } = useWS();
  const [
    {
      roomKey,
      allKeys,
      columnsObject,
      myPlayerCard,
      username,
      staticGifs,
      partnerCard,
      partnerUsername,
      observer,
      loadingCards,
    },
    dispatch,
  ] = useReducer(guessyReducer, initialState);

  const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, "l");
  const getColumnCount = () => {
    switch (breakpoint) {
      case "1":
        return 1;
      case "2":
        return 2;
      case "3":
        return 3;
      case "4":
        return 4;
      case "5":
        return 5;
      case "6":
        return 6;
      default:
        break;
    }
  };
  const columnCount = getColumnCount();

  const roomObjectIsValid = useMemo(() => {
    return () => {
      return allKeys.length == 24 && Object.keys(columnsObject).length == 6;
    };
  }, [allKeys, columnsObject]);

  // useTraceUpdate(
  //   {
  //     breakpoint,
  //     maxWidth,
  //     minWidth,
  //     columnsObject,
  //   },
  //   true,
  //   "GuessyContext"
  // );

  // ** Functions

  const createRoom = useMemo(() => {
    return async function (newRoomKey) {
      if (newRoomKey != roomKey) {
        dispatch({ type: "wipeRoom" });
      }
      let ready = await waitUntil(connectionOpen);
      if (ready) {
        dispatch({ type: "updateRoomKey", payload: { newRoomKey } });
        const newMemes = memeSampler();
        dispatch({ type: "updateMemeSet", payload: newMemes });
        const requesterCard = randomCardKey(newMemes.allKeys);
        dispatch({
          type: "updateMyPlayerCard",
          payload: { newCard: requesterCard },
        });
        dispatch({
          type: "updateUsername",
          payload: { username },
        });
        let newRoomObject = {
          roomKey: newRoomKey,
          columnsObject: newMemes.columnsObject,
          allKeys: newMemes.allKeys,
          player1: {
            uuid: uuidRef.current,
            card: requesterCard,
            username,
          },
        };
        sendJsonMessage({
          type: "createRoom",
          roomKey: newRoomKey,
          newRoomObject: JSON.stringify(newRoomObject),
        });
      }
    };
  }, [sendJsonMessage, username, connectionOpen, uuidRef, roomKey]);

  const guessyManager = useMemo(() => {
    return (action, payload) => {
      let newCard;
      let newMemes;
      let newCard1;
      let newCard2;
      // devLog(["guessyManager:", action, payload]);
      switch (action) {
        case "acceptUuid":
          if (uuidRef.current) {
            sendJsonMessage({
              type: "acceptUuid",
            });
          }
          break;
        case "assignUsername":
          sessionStorage.setItem(`${roomKey}-username`, payload.newUsername);
          dispatch({
            type: "setUsername",
            payload: { newUsername: payload.newUsername },
          });
          sendJsonMessage({
            type: "setUsername",
            roomKey: roomKey,
            username: payload.newUsername,
          });
          break;
        case "assignNewPlayerCard":
          newCard = randomCardKey(allKeys);
          sendJsonMessage({
            type: "setPlayerCard",
            roomKey: roomKey,
            card: newCard,
          });
          dispatch({
            type: "updateMyPlayerCard",
            payload: { newCard: newCard },
          });
          break;
        case "createRoom":
          createRoom(payload.newRoomKey);
          break;
        case "joinRoom":
          sendJsonMessage({
            type: "joinRoom",
            roomKey,
            username,
            playerCard: myPlayerCard,
            returnRoomContents: !roomObjectIsValid(),
          });
          break;
        case "replaceGame":
          dispatch({
            type: "setLoadingCards",
            payload: { loadingCards: true },
          });
          newMemes = memeSampler();
          // assign each player a new playerCard
          newCard1 = randomCardKey(newMemes.allKeys);
          dispatch({
            type: "updateMyPlayerCard",
            payload: { newCard: newCard1 },
          });
          newCard2 = randomCardKey(newMemes.allKeys);
          dispatch({
            type: "updatePartnerCard",
            payload: { newCard: newCard2 },
          });

          // clean up local storage
          Object.keys(sessionStorage).forEach((key) => {
            if (key.includes(roomKey)) window.sessionStorage.removeItem(key);
          });

          // send the new memes to the server
          sendJsonMessage({
            type: "replaceGame",
            roomKey: roomKey,
            allKeys: JSON.stringify(newMemes.allKeys),
            columnsObject: JSON.stringify(newMemes.columnsObject),
            player1Card: newCard1,
            player2Card: newCard2,
          });
          break;
        case "requestUuid":
          sendJsonMessage({
            type: "requestUuid",
          });
          break;
        case "setStaticGifs":
          dispatch({
            type: "setStaticGifs",
            payload: { staticGifs: payload.staticGifs },
          });
          sessionStorage.setItem("guessy_gifs", !staticGifs);
          break;
        default:
          break;
      }
    };
  }, [
    createRoom,
    staticGifs,
    allKeys,
    roomKey,
    username,
    sendJsonMessage,
    roomObjectIsValid,
    myPlayerCard,
    uuidRef,
  ]);

  //  ** value for the context provider **
  const value = useMemo(() => {
    return {
      roomKey,
      username,
      staticGifs,
      guessyManager,
      myPlayerCard,
      roomObjectIsValid,
      observer,
      columnsObject,
      partnerCard,
      partnerUsername,
      dispatch,
      columnCount,
      maxWidth,
      loadingCards,
    };
  }, [
    roomKey,
    username,
    staticGifs,
    guessyManager,
    myPlayerCard,
    roomObjectIsValid,
    observer,
    columnsObject,
    partnerCard,
    partnerUsername,
    dispatch,
    columnCount,
    maxWidth,
    loadingCards,
  ]);

  // **UseEffect

  // ** render provider:
  return (
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };
