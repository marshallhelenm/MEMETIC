import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
const WSContext = createContext(false, null, () => {});
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  const isReadyRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const tryingToConnectRef = useRef(true);
  const ws = useRef(null);
  let uuidRef = useRef(sessionStorage.getItem("guessy-uuid"));
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
  const connectionError = connectionStatus != "Open";
  const connectionOpen = connectionStatus == "Open";
  useTraceUpdate(
    {
      isReadyRef,
      connectionAttemptsRef,
      tryingToConnectRef,
      ws,
      uuidRef,
      connectionStatus,
      component: "WSContext",
    },
    true
  );

  useEffect(() => {
    while (connectionAttemptsRef.current < 11 && !isReadyRef.current) {
      const socket = new WebSocket("wss://echo.websocket.events/");
      if (!isReadyRef.current) {
        tryingToConnectRef.current = true;
        connectionAttemptsRef.current = connectionAttemptsRef.current + 1;
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
    }
    tryingToConnectRef.current = false;
  }, [lastJsonMessage, isReadyRef, connectionAttemptsRef, tryingToConnectRef]);

  const value = useMemo(() => {
    return {
      serverReady: isReadyRef.current,
      sendJsonMessage,
      readyState,
      lastJsonMessage,
      connectionStatus,
      connectionError,
      connectionOpen,
      uuid: uuidRef.current,
      tryingToConnect: tryingToConnectRef.current,
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
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
