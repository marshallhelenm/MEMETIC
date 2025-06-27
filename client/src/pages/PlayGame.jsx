import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import Board from "../containers/Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../containers/PlayGameHeader";
import RoomLoading from "../components/RoomLoading";
import { devLog } from "../utils/Helpers";
import { handleLocalStorage } from "../utils/LocalStorageHandler";

//the page you see while actually playing the game
function PlayGame() {
  const [searchParams] = useSearchParams();
  const [loadingCards, setLoadingCards] = useState(true);
  const { roomObject } = useGuessy();
  const { uuid, sendJsonMessage } = useWS();
  const [localRoomObject, setLocalRoomObject] = useState(roomObject); // setting this to local state prompts a re-render when the roomObject changes
  const [localUuid, setLocalUuid] = useState(uuid); // setting this to local state prompts a re-render when the roomObject changes
  // devLog(["PlayGame rendered, roomObject: ", JSON.stringify(roomObject)]);

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

  devLog([
    "PlayGame rendered",
    "playerCard:",
    playerCard,
    "username:",
    username,
    "roomKey:",
    currentRoomKey,
  ]);
  useEffect(() => {
    sendJsonMessage({
      type: "joinRoom",
      roomKey: currentRoomKey,
      username,
      playerCard,
      returnRoomContents: Object.keys(roomObject).length == 0 ? true : false,
    });
  }, [username, currentRoomKey, sendJsonMessage, roomObject, playerCard]);

  if (currentRoomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (Object.keys(roomObject).length > 0) {
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
  } else {
    return <RoomLoading />;
  }
}

export default PlayGame;
