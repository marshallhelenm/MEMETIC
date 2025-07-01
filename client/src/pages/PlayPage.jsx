import { useEffect, useRef, useState } from "react";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import InvalidRoomKey from "../components/InvalidRoomKey";
import RoomLoading from "../components/RoomLoading";
import ErrorPage from "../components/ErrorPage";
import PlayGame from "../containers/PlayGame";

function PlayPage() {
  const {
    uuid,
    connectionOpen,
    connectionError,
    tryingToConnect,
    serverError,
  } = useWS();
  const { roomKey, roomObjectIsValid, guessyManager, allKeys } = useGuessy();
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!roomObjectIsValid() && attemptsRef.current < 11) {
      guessyManager("joinRoom");
      attemptsRef.current = attemptsRef.current + 1;
    } else if (roomObjectIsValid()) {
      attemptsRef.current = 0;
    }
  }, [uuid, guessyManager, roomObjectIsValid, allKeys, connectionOpen]);

  // ** RENDER
  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (roomObjectIsValid() && connectionOpen) {
    return <PlayGame />;
  } else if (connectionError && !tryingToConnect) {
    return <ErrorPage type="connection" />;
  } else if (serverError != "") {
    return <ErrorPage type="server" />;
  } else {
    return <RoomLoading />;
  }
}

export default PlayPage;
