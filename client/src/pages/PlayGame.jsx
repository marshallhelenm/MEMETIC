import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import Board from "../containers/Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../containers/PlayGameHeader";
import RoomLoading from "../components/RoomLoading";
import ConnectionError from "../components/ConnectionError";
import { devLog, waitUntil } from "../utils/Helpers";
import { handleLocalStorage } from "../utils/LocalStorageHandler";
import { useTraceUpdate } from "../hooks/useTraceUpdate";

//the page you see while actually playing the game
function PlayGame() {
  let navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingCards, setLoadingCards] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const { roomObject } = useGuessy();
  const [roomReady, setRoomReady] = useState(
    Object.keys(roomObject).length > 0
  );
  const { uuid, sendJsonMessage } = useWS();
  const [localRoomObject, setLocalRoomObject] = useState(roomObject);
  const [localUuid, setLocalUuid] = useState(uuid);
  const currentRoomKey = searchParams.get("roomKey");
  const [playerCard, setPlayerCard] = useState(findPlayerCard());

  let { uuidChanged, roomObjectChanged } = useTraceUpdate(
    {
      component: "PlayGame",
      uuid,
      roomObject,
      roomReady,
    },
    false
  );

  let username = searchParams.get("username");

  function findPlayerCard() {
    if (
      Object.keys(roomObject).length > 0 &&
      roomObject.users &&
      roomObject.users[uuid]
    ) {
      return (
        roomObject.users[uuid]["playerCard"] ||
        handleLocalStorage({
          type: "getPlayerCard",
          roomKey: currentRoomKey,
        })
      );
    } else {
      return handleLocalStorage({
        type: "getPlayerCard",
        roomKey: currentRoomKey,
      });
    }
  }

  // devLog([
  //   "PlayGame rendered",
  //   "playerCard:",
  //   playerCard,
  //   "username:",
  //   username,
  //   "roomKey:",
  //   currentRoomKey,
  //   "Object.keys(roomObject).length > 0:",
  //   Object.keys(roomObject).length > 0,
  //   "roomObject:",
  //   roomObject,
  // ]);
  useEffect(() => {
    if (!username) navigate(`/name_thyself?roomKey=${currentRoomKey}`);
    if (
      (typeof uuid === "string" && !roomObject["memeSet"]) ||
      uuidChanged ||
      roomObjectChanged
    ) {
      setRoomReady(true);
      sendJsonMessage({
        type: "joinRoom",
        roomKey: currentRoomKey,
        username,
        playerCard,
        returnRoomContents: Object.keys(roomObject).length == 0 ? true : false,
      });
    }
  }, [
    username,
    currentRoomKey,
    sendJsonMessage,
    roomObject,
    playerCard,
    uuid,
    uuidChanged,
    roomObjectChanged,
    navigate,
  ]);

  if (currentRoomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (roomReady) {
    return (
      <div className="play-game">
        <PlayGameHeader
          setLoadingCards={setLoadingCards}
          username={username}
          playerCard={playerCard}
          roomKey={currentRoomKey}
          setPlayerCard={setPlayerCard}
        />
        <Board
          loading={loadingCards}
          roomKey={currentRoomKey}
          playerCard={playerCard}
        />
      </div>
    );
  } else if (connectionError) {
    return <ConnectionError />;
  } else {
    return <RoomLoading />;
  }
}

export default PlayGame;
