import { useEffect, useRef, useState } from "react";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import InvalidRoomKey from "../components/InvalidRoomKey";
import RoomLoading from "../components/RoomLoading";
import ErrorPage from "../components/ErrorPage";
import PlayGame from "../containers/PlayGame";
import { useNavigate, useSearchParams } from "react-router-dom";

function PlayPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    uuid,
    connectionOpen,
    connectionError,
    tryingToConnect,
    serverError,
  } = useWS();
  const { roomKey, roomObjectIsValid, guessyManager, allKeys } = useGuessy();
  const attemptsRef = useRef(0);
  const validRoom = roomObjectIsValid();
  const searchParamRoomKey = searchParams.get("roomKey");

  useEffect(() => {
    if (!searchParamRoomKey) {
      navigate("/home");
    } else if (!searchParams.get("username")) {
      navigate(`/name_thyself?roomKey=${searchParams.get("roomKey")}`);
    }
    if (!validRoom && attemptsRef.current < 11) {
      setTimeout(() => {
        guessyManager("joinRoom");
        attemptsRef.current = attemptsRef.current + 1;
      }, 500);
    } else if (validRoom) {
      attemptsRef.current = 0;
    }
  }, [
    uuid,
    guessyManager,
    validRoom,
    allKeys,
    connectionOpen,
    searchParams,
    navigate,
    searchParamRoomKey,
  ]);

  // ** RENDER
  if (searchParamRoomKey?.length != 8) {
    if (!searchParamRoomKey) {
      return <RoomLoading />;
    } else {
      return <InvalidRoomKey />;
    }
  } else if (validRoom && connectionOpen) {
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
