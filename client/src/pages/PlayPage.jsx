import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const InvalidRoomKey = lazy(() => import("./InvalidRoomKey"));
const ErrorPage = lazy(() => import("./ErrorPage"));
const PlayGame = lazy(() => import("../containers/PlayGame"));
import RoomLoading from "./RoomLoading";
import { PlayersProvider } from "../contexts/PlayersContext";
import { useGame, useWS } from "../hooks/useContextHooks";
import { LogoSuspense } from "../components/GuessySuspense";

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
    return (
      <LogoSuspense>
        <InvalidRoomKey />
      </LogoSuspense>
    );
  } else if (validGame && connectionOpen) {
    return (
      <PlayersProvider>
        <Suspense fallback={<RoomLoading />}>
          <PlayGame />
        </Suspense>
      </PlayersProvider>
    );
  } else if (connectionError && !tryingToConnect) {
    return (
      <LogoSuspense>
        <ErrorPage type="connection" />
      </LogoSuspense>
    );
  } else if (serverError != "") {
    return (
      <LogoSuspense>
        <ErrorPage type="server" />
      </LogoSuspense>
    );
  } else {
    return <RoomLoading />;
  }
}

export default PlayPage;
