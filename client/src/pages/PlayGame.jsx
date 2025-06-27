import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

  let { uuidChanged, roomObjectChanged } = useTraceUpdate({
    uuid,
    roomObject,
    roomReady,
  });

  const currentRoomKey = searchParams.get("roomKey");
  let playerCard = findPlayerCard();
  let username = searchParams.get("username");

  function findPlayerCard() {
    if (Object.keys(roomObject).length > 0 && roomObject.users[uuid]) {
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
