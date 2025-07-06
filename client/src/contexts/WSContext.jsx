import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { devLog } from "../utils/Helpers";
const WSContext = createContext(false, null, () => {});
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  let uuidRef = useRef("");
  const sessionStorageUuid = sessionStorage.getItem("guessy-uuid");
  if (
    sessionStorageUuid &&
    sessionStorageUuid != "null" &&
    sessionStorageUuid != "undefined"
  ) {
    uuidRef.current = sessionStorageUuid;
  }
  const isReadyRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const tryingToConnectRef = useRef(true);
  const [serverError, setServerError] = useState(""); // as opposed to connectionError, this one is if there's a failure of parsing the messages
  const ws = useRef(null);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${socketURL}?uuid=${uuidRef.current}`,
    { share: false, shouldReconnect: () => true }
  );
  const [lastGameContentsMessage, setLastGameContentsMessage] = useState({});
  const [lastMessageReceivedAt, setLastMessageReceivedAt] = useState(
    Date.now()
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

    socket.onmessage = () => {
      let message = lastJsonMessage;
      devLog([
        "WSProvider handling message: ",
        message?.type,
        // JSON.stringify(message),
      ]);
      if (!message) return;
      setLastMessageReceivedAt(Date.now());
      try {
        if (!uuidRef.current && message.type != "uuid") {
          // we're not ready to receive messages, ask for a uuid
          sendJsonMessage({
            type: "requestUuid",
          });
          return;
        }

        switch (message.type) {
          case "serverError":
            setServerError(JSON.parse(message.error));
            break;
          case "uuid":
            if (!sessionStorage.getItem("guessy-uuid") || !uuidRef.current) {
              sessionStorage.setItem("guessy-uuid", message.uuid);
              uuidRef.current = message.uuid;
              sendJsonMessage({
                type: "acceptUuid",
              });
            }
            break;
          case "gameContents":
            if (message?.allKeys && message?.columnsObject) {
              setLastGameContentsMessage({ ...lastJsonMessage });
            }
            break;
          case "playersUpdate":
            // nothin to do, but it IS an expected message type. PlayersContext handles this one.
            break;
          default:
            devLog([
              "Unhandled message type in WSProvider:",
              message.type,
              message,
            ]);
        }
      } catch (error) {
        devLog(["Error in WSProvider", error, JSON.stringify(message)]);
      }
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [
    isReadyRef,
    connectionAttemptsRef,
    tryingToConnectRef,
    connectionOpen,
    lastJsonMessage,
    sendJsonMessage,
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
      lastMessageReceivedAt,
      lastGameContentsMessage,
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
    lastMessageReceivedAt,
    lastGameContentsMessage,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
