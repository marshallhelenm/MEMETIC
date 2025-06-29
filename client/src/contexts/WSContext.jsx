import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
const WSContext = createContext(false, null, () => {});
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [tryingToConnect, setTryingToConnect] = useState(true);
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

  useEffect(() => {
    if (connectionAttempts < 51) {
      const socket = new WebSocket("wss://echo.websocket.events/");
      if (!isReady) {
        setTryingToConnect(true);
        setConnectionAttempts((a) => {
          return a++;
        });
      }
      socket.onopen = () => {
        setIsReady(true);
        setTryingToConnect(false);
        setConnectionAttempts(0);
      };

      socket.onclose = () => setIsReady(false);

      // socket.onmessage = () => {
      //   //
      // };

      ws.current = socket;

      return () => {
        socket.close();
      };
    } else {
      setTryingToConnect(false);
    }
  }, [
    lastJsonMessage,
    isReady,
    connectionAttempts,
    setConnectionAttempts,
    setTryingToConnect,
  ]);

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
      tryingToConnect,
    };
  }, [
    isReady,
    sendJsonMessage,
    readyState,
    lastJsonMessage,
    connectionStatus,
    connectionError,
    connectionOpen,
    tryingToConnect,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
