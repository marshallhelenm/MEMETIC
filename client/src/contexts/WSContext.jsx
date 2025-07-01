import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
const WSContext = createContext(false, null, () => {});
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  let uuidRef = useRef(sessionStorage.getItem("guessy-uuid"));
  const isReadyRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const tryingToConnectRef = useRef(true);
  const [serverError, setServerError] = useState(""); // as opposed to connectionError, this one is if there's a failure of parsing the messages
  const ws = useRef(null);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${socketURL}?uuid=${uuidRef.current}`,
    { share: false, shouldReconnect: () => true }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  const connectionError =
    connectionStatus == "Closed" && connectionAttemptsRef.current > 10;
  const connectionOpen = connectionStatus == "Open";
  // useTraceUpdate({ uuidRef: uuidRef.current }, true, "WSContext");

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.events/");
    if (
      !connectionOpen &&
      connectionAttemptsRef.current < 11 &&
      !isReadyRef.current
    ) {
      tryingToConnectRef.current = true;
      connectionAttemptsRef.current = connectionAttemptsRef.current + 1;
    } else if (connectionOpen) {
      isReadyRef.current = true;
      connectionAttemptsRef.current = 0;
    } else {
      tryingToConnectRef.current = false;
    }

    socket.onopen = () => {
      isReadyRef.current = true;
      tryingToConnectRef.current = false;
      connectionAttemptsRef.current = 0;
    };

    socket.onclose = () => (isReadyRef.current = false);

    // socket.onmessage = () => {
    //   //
    // };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [
    lastJsonMessage,
    isReadyRef,
    connectionAttemptsRef,
    tryingToConnectRef,
    connectionOpen,
  ]);

  const value = useMemo(() => {
    return {
      serverReady: isReadyRef.current,
      sendJsonMessage,
      readyState,
      lastJsonMessage,
      connectionStatus,
      connectionError,
      connectionOpen,
      uuidRef,
      tryingToConnect: tryingToConnectRef.current,
      serverError,
      setServerError,
    };
  }, [
    isReadyRef,
    sendJsonMessage,
    readyState,
    lastJsonMessage,
    connectionStatus,
    connectionError,
    connectionOpen,
    tryingToConnectRef,
    serverError,
    setServerError,
    uuidRef,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
