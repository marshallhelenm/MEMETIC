import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import Board from "../containers/Board";
import InvalidRoomKey from "../components/InvalidRoomKey";
import PlayGameHeader from "../components/PlayGameHeader";
import RoomLoading from "../components/RoomLoading";

//the page you see while actually playing the game
function PlayGame() {
  console.log("rendered PlayGame");

  const [searchParams] = useSearchParams();
  const [loadingCards, setLoadingCards] = useState(true);
  const { roomObject } = useGuessy();
  const { uuidRef, sendJsonMessage } = useWS();
  console.log("PlayGame rendered, roomObject: ", roomObject);

  const currentRoomKey = searchParams.get("roomKey");
  let playerCard = roomObject
    ? roomObject.users[uuidRef.current]?.playerCard
    : undefined;
  let username = searchParams.get("username");

  useEffect(() => {
    sendJsonMessage({
      type: "joinRoom",
      roomKey: currentRoomKey,
      username,
      returnRoomContents: Object.keys(roomObject).length == 0 ? true : false,
    });
  }, [username, currentRoomKey, sendJsonMessage, roomObject]);

  if (currentRoomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (roomObject) {
    return <h1>got the roomObject!</h1>;
    // return (
    //   <div className="play-game">
    //     <PlayGameHeader
    //       setLoadingCards={setLoadingCards}
    //       username={username}
    //       playerCard={playerCard}
    //     />
    //     <Board
    //       loading={loadingCards}
    //       roomKey={currentRoomKey}
    //       playerCard={playerCard}
    //     />
    //   </div>
    // );
  } else {
    return <RoomLoading />;
  }
}

export default PlayGame;
