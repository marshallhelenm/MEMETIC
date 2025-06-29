import { createContext, useMemo, useEffect, useReducer, useRef } from "react";

import { useWS } from "./useWS";
import { memeSampler } from "../assets/memeCollection";
import { devLog, waitUntil, randomCardKey } from "../utils/Helpers";
import { parseRoom, parseUsers } from "../utils/RoomParser";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

const GuessyContext = createContext();

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
};

function guessyReducer(state, action) {
  const type = action.type;
  const payload = action.payload;
  let parsedRoom = {};
  let parsedUsers = {};
  const sessionPlayerCard = sessionStorage.getItem(
    `guessy-${state.roomKey}-player-card`
  );
  devLog(["guessyReducer: ", type]);

  switch (type) {
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
        myUuid: state.uuid,
        roomObject: payload.roomObject,
      });
      return {
        ...state,
        ...parsedRoom,
        myPlayerCard:
          parsedRoom.myPlayerCard || sessionPlayerCard || state.myPlayerCard,
      };
    case "updateRoomKey":
      return { ...state, roomKey: payload.newRoomKey.toUpperCase() };
    case "updateUsername":
      return { ...state, username: payload.username };
    case "updateUsers":
      parsedUsers = parseUsers({
        roomKey: state.roomKey,
        myUuid: state.uuid,
        player1: payload.player1,
        player2: payload.player2,
      });
      return {
        ...state,
        ...parsedUsers,
        myPlayerCard:
          parsedRoom.myPlayerCard || sessionPlayerCard || state.myPlayerCard,
      };
    default:
      throw new Error("Action unknown in guessyReducer");
  }
}

function GuessyProvider({ children }) {
  const { connectionOpen, myUuid, sendJsonMessage } = useWS();
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
    },
    dispatch,
  ] = useReducer(guessyReducer, initialState);

  useTraceUpdate(
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
      component: "GuessyContext",
    },
    false
  );

  const roomObjectIsValid = useMemo(() => {
    return () => {
      return allKeys.length == 24 && Object.keys(columnsObject).length == 6;
    };
  }, [allKeys, columnsObject]);

  const createRoom = useMemo(() => {
    return async function (newRoomKey) {
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
            uuid: myUuid,
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
  }, [sendJsonMessage, username, connectionOpen, myUuid]);

  const guessyManager = useMemo(() => {
    return (action, payload) => {
      let newCard;
      let newMemes;
      let newCard1;
      let newCard2;
      devLog(["guessyManager:", action, payload]);
      switch (action) {
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
          dispatch({ type: "updateMyPlayerCard", newCard });
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
          newMemes = memeSampler();
          // assign each player a new playerCard
          newCard1 = randomCardKey(newMemes.allKeys);
          dispatch({
            type: "updatePlayer1Card",
            payload: { newCard: newCard1 },
          });
          newCard2 = randomCardKey(newMemes.allKeys);
          dispatch({
            type: "updatePlayer2Card",
            payload: { newCard: newCard2 },
          });
          // if it's the current user, update the local storage

          // clean up local storage
          Object.keys(sessionStorage).forEach((key) => {
            if (key.includes(roomKey)) window.sessionStorage.removeItem(key);
          });

          // send the new memes to the server
          sendJsonMessage({
            type: "replaceGame",
            roomKey: roomKey,
            memeSet: JSON.stringify(newMemes),
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
  ]);

  // ** useEffect **

  // useEffect(() => {
  // }, [myPlayerCard]);

  // ** render provider:

  return (
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };
