import { useEffect } from "react";
import { useRef } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";

// 1) CREATE A CONTEXT
const WSContext = createContext(false, null, () => {})

function WSProvider({ children }) {
  const [isReady, setIsReady] = useState(false)
  const [uuid] = useState(null)
  const WS_URL = "ws://localhost:6969"

  const ws = useRef(null)

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.events/")

    socket.onopen = () => setIsReady(true)
    socket.onclose = () => setIsReady(false)
    // socket.onmessage = (event) => {
    //   console.log('socket message: ', lastJsonMessage);
    // }

    ws.current = socket

    return () => {
      socket.close()
    }
  }, [])
  
  
  const value = useMemo(() => {
    return {
      serverReady: isReady,
      sendJsonMessage,
      lastJsonMessage,
      uuid,
      ws: ws.current?.send.bind(ws.current)
    };
  }, [isReady, sendJsonMessage, lastJsonMessage, uuid]);

  return (
    <WSContext.Provider value={value}>{children}</WSContext.Provider>
  );
}

function useWS() {
  const context = useContext(WSContext);
  if (context === undefined)
    throw new Error("WSContext was used outside of the WSProvider");
  return context;
}

export { WSProvider, useWS };