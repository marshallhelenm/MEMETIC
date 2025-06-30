import { useEffect, useRef, useState } from "react";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import InvalidRoomKey from "../components/InvalidRoomKey";
import RoomLoading from "../components/RoomLoading";
import ErrorPage from "../components/ErrorPage";
import PlayGame from "../containers/PlayGame";

function PlayPage() {
  const [loadingPage, setLoadingPage] = useState(true); // RoomLoading uses this to nudge the page to reload if it's been sitting in loading for a while
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
    } else {
      setLoadingPage(false);
    }
  }, [uuid, guessyManager, roomObjectIsValid, allKeys]);

  // ** RENDER
  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (roomObjectIsValid() && connectionOpen) {
    return <PlayGame />;
  } else if (connectionError && !tryingToConnect) {
    return <ErrorPage type="connection" />;
  } else if (serverError != "") {
    return <ErrorPage type="server" />;
  } else if (loadingPage) {
    return <RoomLoading setLoadingPage={setLoadingPage} />;
  }
}

export default PlayPage;
