import { useCallback } from "react";
import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";

const WSContext = createContext(false, null, () => {});

function WSProvider({ children }) {
  const socketURL = "ws://localhost:6969";
  const [isReady, setIsReady] = useState(false);
  const [uuid, setUuid] = useState();

  const ws = useRef(null);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketURL,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );
  const { uuidDidUpdate } = useTraceUpdate(
    {
      component: "WSProvider",
      // sendJsonMessage,
      // lastJsonMessage,
      // readyState,
      // isReady,
      // setIsReady,
      uuid,
      // setUuid,
    },
    false
  );

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: "Connecting",
  //   [ReadyState.OPEN]: "Open",
  //   [ReadyState.CLOSING]: "Closing",
  //   [ReadyState.CLOSED]: "Closed",
  //   [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  // }[readyState];

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.events/");

    socket.onopen = () => {
      setIsReady(true);
    };
    socket.onclose = () => setIsReady(false);
    // socket.onmessage = () => {
    //   devLog("socket message received: ", lastJsonMessage);
    // };

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
    };
  }, [isReady, uuid, sendJsonMessage, readyState, lastJsonMessage, setUuid]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
