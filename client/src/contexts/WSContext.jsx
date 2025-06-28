import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WSContext = createContext(false, null, () => {});
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [uuid, setUuid] = useState();
  const incomingMessageHistoryRef = useRef([]); // an array of the last 50 messages, newest at start of array
  const ws = useRef(null);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketURL,
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

  useEffect(() => {
    function updateIncomingMessageHistory(newMessage) {
      let workingArr = [...incomingMessageHistoryRef.current];
      workingArr.pop();
      workingArr.shift(newMessage);
      incomingMessageHistoryRef.current = workingArr;
    }

    const socket = new WebSocket("wss://echo.websocket.events/");

    socket.onopen = () => {
      setIsReady(true);
    };
    socket.onclose = () => setIsReady(false);
    socket.onmessage = () => {
      updateIncomingMessageHistory(lastJsonMessage);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [lastJsonMessage, setUuid]);

  const value = useMemo(() => {
    return {
      serverReady: isReady,
      setUuid,
      uuid,
      socketURL,
      sendJsonMessage,
      readyState,
      lastJsonMessage,
      connectionStatus,
      connectionError,
    };
  }, [
    isReady,
    uuid,
    sendJsonMessage,
    readyState,
    lastJsonMessage,
    setUuid,
    connectionStatus,
    connectionError,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
