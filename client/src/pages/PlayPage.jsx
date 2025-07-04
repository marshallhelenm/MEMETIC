import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useGame, useWS } from "../hooks/useContextHooks";
import InvalidRoomKey from "./InvalidRoomKey";
import RoomLoading from "./RoomLoading";
import ErrorPage from "./ErrorPage";
import PlayGame from "../containers/PlayGame";
import { PlayersProvider } from "../contexts/PlayersContext";

function PlayPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    connectionOpen,
    connectionError,
    tryingToConnect,
    serverError,
    sendJsonMessage,
  } = useWS();
  const { validGame } = useGame();
  const [attempts, setAttempts] = useState(0);
  const roomKey = searchParams.get("roomKey");

  useEffect(() => {
    // ** route handling
    if (!roomKey) {
      navigate("/home");
    } else if (!searchParams.get("username")) {
      navigate(`/name_thyself?roomKey=${searchParams.get("roomKey")}`);
    }

    // ** if we're in the right place, try to join the room
    if (!validGame && attempts < 11) {
      setTimeout(() => {
        sendJsonMessage({
          type: "joinRoom",
          roomKey,
          username: searchParams.get("username"),
        });
        setAttempts((a) => a++);
      }, 500);
    } else if (validGame) {
      setAttempts(0);
    }
  }, [
    attempts,
    validGame,
    connectionOpen,
    searchParams,
    navigate,
    roomKey,
    sendJsonMessage,
  ]);

  // ** RENDER
  if (roomKey?.length != 8) {
    return <InvalidRoomKey />;
  } else if (validGame && connectionOpen) {
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
