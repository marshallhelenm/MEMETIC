import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import InvalidRoomKey from "../components/InvalidRoomKey";
import RoomLoading from "../components/RoomLoading";
import ConnectionError from "../components/ConnectionError";
import PlayGame from "../containers/PlayGame";
import { devLog } from "../utils/Helpers";

function PlayPage() {
  const { uuid, connectionStatus, connectionError } = useWS();
  const { roomKey, roomObjectIsValid, guessyManager, allKeys } = useGuessy();
  const attemptsRef = useRef(0);
  useEffect(() => {
    devLog(["roomObjectIsValid() in PlayPage", roomObjectIsValid(), allKeys]);
    if (!roomObjectIsValid() && attemptsRef.current < 11) {
      guessyManager("joinRoom");
      attemptsRef.current = attemptsRef.current + 1;
    }
  }, [uuid, guessyManager, roomObjectIsValid, allKeys]);

  // ** RENDER
  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (roomObjectIsValid() && connectionStatus == "Open") {
    return <PlayGame />;
  } else if (connectionError) {
    return <ConnectionError />;
  } else {
    return <RoomLoading />;
  }
}

export default PlayPage;
