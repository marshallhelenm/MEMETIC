import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useGame, useWS } from "../contexts/useContextHooks";
import InvalidRoomKey from "../components/InvalidRoomKey";
import RoomLoading from "../components/RoomLoading";
import ErrorPage from "../components/ErrorPage";
import PlayGame from "../containers/PlayGame";
import { PlayersProvider } from "../contexts/PlayersContext";
import { GameProvider } from "../contexts/GameContext";

function PlayPage() {
  return (
    <GameProvider>
      <PlayPageInnards />
    </GameProvider>
  );
}
function PlayPageInnards() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    connectionOpen,
    connectionError,
    tryingToConnect,
    serverError,
    sendJsonMessage,
  } = useWS();
  const { roomObjectIsValid, myPlayerCard } = useGame();
  const attemptsRef = useRef(0);
  const validRoom = roomObjectIsValid();
  const roomKey = searchParams.get("roomKey");
  const myUsername = searchParams.get("username");

  const joinRoom = useMemo(() => {
    sendJsonMessage({
      type: "joinRoom",
      roomKey,
      username: myUsername,
    });
  }, [myUsername, roomKey, sendJsonMessage]);

  useEffect(() => {
    // ** route handling
    if (!roomKey) {
      navigate("/home");
    } else if (!searchParams.get("username")) {
      navigate(`/name_thyself?roomKey=${searchParams.get("roomKey")}`);
    }

    // ** if we're in the right place, try to join the room
    if (!validRoom && attemptsRef.current < 11) {
      setTimeout(() => {
        joinRoom();
        attemptsRef.current = attemptsRef.current + 1;
      }, 500);
    } else if (validRoom) {
      attemptsRef.current = 0;
    }
  }, [joinRoom, validRoom, connectionOpen, searchParams, navigate, roomKey]);

  // ** RENDER
  if (roomKey?.length != 8) {
    if (!roomKey) {
      return <RoomLoading joinRoom={joinRoom} />;
    } else {
      return <InvalidRoomKey />;
    }
  } else if (validRoom && connectionOpen) {
    return (
      <PlayersProvider>
        <PlayGame />
      </PlayersProvider>
    );
  } else if (connectionError && !tryingToConnect) {
    return <ErrorPage type="connection" />;
  } else if (serverError != "") {
    return <ErrorPage type="server" />;
  } else {
    return <RoomLoading />;
  }
}

export default PlayPage;
