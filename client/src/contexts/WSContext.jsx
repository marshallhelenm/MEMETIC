import { useCallback } from "react";
import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
const WSContext = createContext(false, null, () => {});

function WSProvider({ children }) {
  const socketURL = "ws://localhost:6969";
  const [isReady, setIsReady] = useState(false);
  const uuidRef = useRef(null);
  const setUuidRef = useCallback((newUuid) => {
    uuidRef.current = newUuid;
  }, []);

  const ws = useRef(null);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketURL,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );
  // useTraceUpdate({
  //   component: "WSProvider",
  //   sendJsonMessage,
  //   lastJsonMessage,
  //   readyState,
  //   isReady,
  //   setIsReady,
  //   uuidRef,
  //   setUuidRef,
  // });

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: "Connecting",
  //   [ReadyState.OPEN]: "Open",
  //   [ReadyState.CLOSING]: "Closing",
  //   [ReadyState.CLOSED]: "Closed",
  //   [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  // }[readyState];

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.events/");
    if (lastJsonMessage?.type == "uuid") {
      setUuidRef[lastJsonMessage.uuid];
    }

    socket.onopen = () => {
      setIsReady(true);
    };
    socket.onclose = () => setIsReady(false);
    socket.onmessage = () => {
      console.log("socket message received: ", lastJsonMessage);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [lastJsonMessage, setUuidRef]);

  const value = useMemo(() => {
    return {
      serverReady: isReady,
      setUuidRef,
      uuidRef,
      socketURL,
      sendJsonMessage,
      readyState,
      lastJsonMessage,
    };
  }, [
    isReady,
    uuidRef,
    sendJsonMessage,
    readyState,
    lastJsonMessage,
    setUuidRef,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
