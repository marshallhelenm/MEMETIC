import React from "react";
import { lazy, Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const InvalidRoomKey = lazy(() => import("./InvalidRoomKey"));
const ErrorPage = lazy(() => import("../ErrorPage"));
const PlayGame = lazy(() => import("./PlayGame"));
import RoomLoading from "../RoomLoading";
import { PlayersProvider } from "../../contexts/PlayersContext";
import { useGame, useWS } from "../../hooks/useContextHooks";
import { LogoSuspense } from "../../components/GuessySuspense";
import { useJoinRoom } from "./useJoinRoom";
import { getPlayPageRender } from "./getPlayPageRender";

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
  const { validGame, gameKey } = useGame();

  const roomKey = searchParams.get("roomKey");
  const username = searchParams.get("username");

  // Handle invalid routing early
  useEffect(() => {
    if (!roomKey) {
      navigate("/home");
    } else if (!username) {
      navigate(`/name_thyself?roomKey=${roomKey}`);
    }
  }, [roomKey, username, navigate]);

  // Join room effect
  useJoinRoom({ validGame, roomKey, username, gameKey, sendJsonMessage });

  // Decide what to render
  const renderKey = getPlayPageRender({
    roomKey,
    validGame,
    connectionOpen,
    connectionError,
    tryingToConnect,
    serverError,
  });

  // Render based on decision
  switch (renderKey) {
    case "InvalidRoomKey":
      return (
        <LogoSuspense>
          <InvalidRoomKey />
        </LogoSuspense>
      );
    case "PlayGame":
      return (
        <PlayersProvider>
          <Suspense fallback={<RoomLoading />}>
            <PlayGame />
          </Suspense>
        </PlayersProvider>
      );
    case "ErrorPageConnection":
      return (
        <LogoSuspense>
          <ErrorPage type="connection" />
        </LogoSuspense>
      );
    case "ErrorPageServer":
      return (
        <LogoSuspense>
          <ErrorPage type="server" />
        </LogoSuspense>
      );
    case "RoomLoading":
    default:
      return <RoomLoading />;
  }
}

export default PlayPage;
