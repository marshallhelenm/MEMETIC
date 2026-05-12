import React from "react";
import { createContext, useMemo, useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { devLog } from "../utils/Helpers";
import { getSessionItem, setSessionItem } from "../utils/sessionStorageUtils";

/**
 * @typedef {Object} WSContextValue
 * @property {boolean} serverReady
 * @property {Function} sendJsonMessage
 * @property {number} readyState
 * @property {Object} lastJsonMessage
 * @property {string} connectionStatus
 * @property {boolean} connectionError
 * @property {boolean} connectionOpen
 * @property {Object} uuidRef
 * @property {boolean} tryingToConnect
 * @property {string|Object} serverError
 * @property {Function} setServerError
 * @property {number} lastMessageReceivedAt
 * @property {Object} lastGameContentsMessage
 * @property {Object} lastChatHistoryMessage
 * @property {string|null} error
 */

/** @type {import('react').Context<WSContextValue>} */
const WSContext = createContext();
const socketURL = "ws://localhost:6969";

function WSProvider({ children }) {
  let uuidRef = useRef("");
  const [error, setError] = useState(null);
  try {
    const sessionStorageUuid = getSessionItem("guessy-uuid");
    if (
      sessionStorageUuid &&
      sessionStorageUuid !== "null" &&
      sessionStorageUuid !== "undefined"
    ) {
      uuidRef.current = sessionStorageUuid;
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err));
  }
  const isReadyRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const tryingToConnectRef = useRef(true);
  const [serverError, setServerError] = useState(""); // as opposed to connectionError, this one is if there's a failure of parsing the messages
  const ws = useRef(null);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${socketURL}?uuid=${uuidRef.current}`,
    { share: false, shouldReconnect: () => true },
  );
  const [lastGameContentsMessage, setLastGameContentsMessage] = useState({});
  const [lastChatHistoryMessage, setLastChatHistoryMessage] = useState({});
  const [lastMessageReceivedAt, setLastMessageReceivedAt] = useState(
    Date.now(),
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
    try {
      const socket = new WebSocket(`${socketURL}`);
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
        if (!message) return;
        console.log("WSContext message received: ", message.type);

        setLastMessageReceivedAt(Date.now());
        try {
          if (!uuidRef.current && message.type !== "uuid") {
            // we're not ready to receive messages, ask for a uuid
            sendJsonMessage({
              type: "requestUuid",
            });
            return;
          }

          switch (message.type) {
            case "chatHistory":
              if (message?.chatHistory && message.chatHistory.length > 0) {
                setLastChatHistoryMessage({ ...lastJsonMessage });
              }
              break;
            case "gameContents":
              if (message?.allKeys && message?.columnsObject) {
                setLastGameContentsMessage({ ...lastJsonMessage });
              }
              break;
            case "serverError":
              setServerError(JSON.parse(message.error));
              break;
            case "uuid":
              if (!getSessionItem("guessy-uuid") || !uuidRef.current) {
                setSessionItem("guessy-uuid", message.uuid);
                uuidRef.current = message.uuid;
                sendJsonMessage({
                  type: "acceptUuid",
                });
              }
              break;
            default:
              devLog([
                "Unhandled message type in WSProvider:",
                message.type,
                message,
              ]);
          }
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          devLog(["Error in WSProvider", err, JSON.stringify(message)]);
        }
      };

      ws.current = socket;

      return () => {
        socket.close();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [connectionOpen, lastJsonMessage, sendJsonMessage]);

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
      lastChatHistoryMessage,
      error,
    };
  }, [
    isReadyRef.current,
    sendJsonMessage,
    readyState,
    lastJsonMessage,
    connectionStatus,
    connectionError,
    connectionOpen,
    uuidRef.current,
    tryingToConnectRef.current,
    serverError,
    setServerError,
    lastMessageReceivedAt,
    lastGameContentsMessage,
    lastChatHistoryMessage,
    error,
  ]);

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export { WSContext, WSProvider };
