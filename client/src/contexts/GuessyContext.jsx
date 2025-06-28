import { createContext, useMemo, useEffect, useReducer } from "react";

import { useWS } from "./useWS";
import { memeSampler } from "../assets/memeCollection";
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { devLog, waitUntil, randomCardKey } from "../utils/Helpers";
import { parseRoom, parseUsers } from "../utils/RoomParser";

const GuessyContext = createContext();

const searchParams = new URLSearchParams(window.location.search);
const initialState = {
  roomKey: searchParams.get("roomKey"),
  allKeys: [],
  columnsObject: {},
  myPlayerCard: undefined,
  username: searchParams.get("username"),
  partnerCard: undefined,
  partnerUsername: undefined,
  observer: false,
  validRoomObject: false,
  staticGifs: localStorage.getItem("guessy_gifs") == "true",
};

function guessyReducer(state, action) {
  const type = action.type;
  const payload = action.payload;

  switch (type) {
    case "setStaticGifs":
      return { ...state, staticGifs: payload.staticGifs };
    case "setUsername":
      return { ...state, username: payload.newUsername };
    case "updateMemeSet":
      return { ...state, ...payload };
    case "updateMyPlayerCard":
      handleLocalStorage("setPlayerCard", payload.myPlayerCard);
      return { ...state, myPlayerCard: payload.myPlayerCard };
    case "updatePartnerCard":
      return { ...state, partnerCard: payload.partnerCard };
    case "updateRoom":
      return {
        ...state,
        ...parseRoom({
          roomKey: state.roomKey,
          myUuid: state.uuid,
          roomObject: payload.roomObject,
        }),
      };
    case "updateRoomKey":
      return { ...state, roomKey: payload.newRoomKey };
    case "updateUsername":
      return { ...state, username: payload.username };
    case "updateUsers":
      return {
        ...state,
        ...parseUsers({
          roomKey: state.roomKey,
          myUuid: state.uuid,
          player1: payload.player1,
          player2: payload.player2,
        }),
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
      validRoomObject,
    },
    dispatch,
  ] = useReducer(guessyReducer, initialState);

  const createRoom = useMemo(() => {
    return async function (newRoomKey) {
      devLog(["createRoom called with newRoomKey:", newRoomKey]);
      let ready = await waitUntil(connectionOpen);
      if (ready) {
        devLog(["connectionOpen, continue with createRoom"]);
        dispatch({ type: "updateRoomKey", newRoomKey });
        const newMemes = memeSampler();
        dispatch({ type: "updateMemeSet", payload: newMemes });
        const requesterCard = randomCardKey(newMemes.allKeys);
        dispatch({
          type: "updateMyPlayerCard",
          payload: { myPlayerCard: requesterCard },
        });
        dispatch({
          type: "updateUsername",
          payload: { username },
        });
        let newRoomObject = {
          roomKey: newRoomKey,
          columnsObject: newMemes.columnsObject,
          allKeys: newMemes.allKeys,
          users: {
            player1: {
              uuid: myUuid,
              card: requesterCard,
              username,
            },
          },
        };
        sendJsonMessage({
          type: "createRoom",
          roomKey: newRoomKey,
          newRoomObject,
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
          devLog(["assignUsername", payload.newUsername]);
          localStorage.setItem(`${roomKey}-username`, payload.newUsername);
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
            returnRoomContents: payload.returnRoomContents,
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
          handleLocalStorage({
            type: "cleanUpRoom",
            roomKey: roomKey,
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
          localStorage.setItem("guessy_gifs", !staticGifs);
          break;
        default:
          break;
      }
    };
  }, [createRoom, staticGifs, allKeys, roomKey, username, sendJsonMessage]);

  //  ** value for the context provider **

  const value = useMemo(() => {
    return {
      roomKey,
      username,
      staticGifs,
      guessyManager,
      myPlayerCard,
      validRoomObject,
      observer,
      columnsObject,
      partnerCard,
      partnerUsername,
    };
  }, [
    roomKey,
    username,
    staticGifs,
    guessyManager,
    myPlayerCard,
    validRoomObject,
    observer,
    columnsObject,
    partnerCard,
    partnerUsername,
  ]);

  // ** useEffect **

  // useEffect(() => {}, []);

  // ** render provider:

  return (
    <GuessyContext.Provider value={value}>{children}</GuessyContext.Provider>
  );
}

export { GuessyProvider, GuessyContext };
