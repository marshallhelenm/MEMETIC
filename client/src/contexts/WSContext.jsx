import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";

const WSContext = createContext(false, null, () => {});

function WSProvider({ children }) {
  const WS_URL = "ws://localhost:6969";
  const [isReady, setIsReady] = useState(false);
  const [uuid, setUuid] = useState(null);

  const ws = useRef(null);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.events/");
    if (lastJsonMessage && lastJsonMessage["uuid"]) {
      setUuid[lastJsonMessage["uuid"]];
    }

    socket.onopen = () => {
      setIsReady(true);
    };
    socket.onclose = () => setIsReady(false);
    // socket.onmessage = (event) => {
    //   console.log("socket message: ", lastJsonMessage);
    // const message = JSON.parse(event.toString());
    // };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const value = useMemo(() => {
    return {
      serverReady: isReady,
      sendJsonMessage,
      lastJsonMessage,
      uuid,
      ws: ws.current?.send.bind(ws.current),
    };
  }, [isReady, sendJsonMessage, lastJsonMessage, uuid]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
