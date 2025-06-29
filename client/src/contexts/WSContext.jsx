import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
const WSContext = createContext(false, null, () => {});
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const ws = useRef(null);
  let uuidRef = useRef(sessionStorage.getItem("guessy-uuid"));

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${socketURL}?uuid=${uuidRef.current}`,
    { share: false, shouldReconnect: () => true }
  );

  // TODO: implement a connection attempts count so that we can show loading instead of error for the second or two it takes to load

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  const connectionError = connectionStatus != "Open";
  const connectionOpen = connectionStatus == "Open";

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.events/");

    socket.onopen = () => {
      setIsReady(true);
    };

    socket.onclose = () => setIsReady(false);

    // socket.onmessage = () => {
    //   //
    // };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [lastJsonMessage]);

  const value = useMemo(() => {
    return {
      serverReady: isReady,
      sendJsonMessage,
      readyState,
      lastJsonMessage,
      connectionStatus,
      connectionError,
      connectionOpen,
      uuid: uuidRef.current,
    };
  }, [
    isReady,
    sendJsonMessage,
    readyState,
    lastJsonMessage,
    connectionStatus,
    connectionError,
    connectionOpen,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
