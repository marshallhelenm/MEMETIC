import React, { createContext, useMemo, useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction, MutableRefObject } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { devLog } from "../utils/Helpers";
import { getSessionItem, setSessionItem } from "../utils/sessionStorageUtils";

export interface WSContextValue {
    serverReady: boolean;
    sendJsonMessage: (msg: any) => void;
    readyState: number;
    lastJsonMessage: any;
    connectionStatus: string;
    connectionError: boolean;
    connectionOpen: boolean;
    uuidRef: MutableRefObject<string>;
    tryingToConnect: boolean;
    serverError: string | object;
    setServerError: Dispatch<SetStateAction<string | object>>;
    lastMessageReceivedAt: number;
    lastGameContentsMessage: any;
    lastChatHistoryMessage: any;
    error: string | null;
  }

  interface WSProviderProps {
    children: ReactNode;
  }

  const WSContext = createContext<WSContextValue | undefined>(undefined);
  const LOCAL_WS_URL = "ws://localhost:4020/ws";

  const parseWebSocketUrl = (rawUrl: string): string | null => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    try {
      const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
      const candidateUrl = hasScheme ? trimmed : `https://${trimmed}`;
      const parsed = new URL(candidateUrl);

      if (parsed.protocol === "http:") parsed.protocol = "ws:";
      if (parsed.protocol === "https:") parsed.protocol = "wss:";

      if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
        return null;
      }

      if (!parsed.pathname || parsed.pathname === "/") {
        parsed.pathname = "/ws";
      }

      return parsed.toString();
    } catch {
      return null;
    }
  };

  const getConfiguredSocketURL = () => {
    if (typeof __VITE_WS_URL__ === "string") {
      return parseWebSocketUrl(__VITE_WS_URL__);
    }
    return null;
  };

  const resolveSocketURL = () => {
    const configuredSocketURL = getConfiguredSocketURL();
    if (configuredSocketURL) {
      return configuredSocketURL;
    }

    if (typeof window === "undefined") {
      return LOCAL_WS_URL;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
      return LOCAL_WS_URL;
    }

    return `${protocol}//${window.location.host}/ws`;
  };

  const socketURL = resolveSocketURL();

  function WSProvider({ children }: WSProviderProps) {
    const uuidRef = useRef<string>("");
    const [error, setError] = useState<string | null>(null);
    const isReadyRef = useRef<boolean>(false);
    const connectionAttemptsRef = useRef<number>(0);
    const tryingToConnectRef = useRef<boolean>(true);
    const [serverError, setServerError] = useState<string | object>("");
    const ws = useRef<WebSocket | null>(null);
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
      `${socketURL}?uuid=${uuidRef.current}`,
      { share: false, shouldReconnect: () => true },
    );
    const [lastGameContentsMessage, setLastGameContentsMessage] = useState<any>({});
    const [lastChatHistoryMessage, setLastChatHistoryMessage] = useState<any>({});
    const [lastMessageReceivedAt, setLastMessageReceivedAt] = useState<number>(Date.now());

    useEffect(() => {
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
    }, []);

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
        const socket = new window.WebSocket(`${socketURL}`);
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
          const message = lastJsonMessage as any;
          if (!message) return;
          // console.log("WSContext message received: ", message.type);

          setLastMessageReceivedAt(Date.now());
          try {
            if (!uuidRef.current && message.type !== "uuid") {
              sendJsonMessage({
                type: "requestUuid",
              });
              return;
            }

            switch (message.type) {
              case "chatHistory":
                if (message?.chatHistory && message.chatHistory.length > 0) {
                  setLastChatHistoryMessage(
                    typeof lastJsonMessage === "object" && lastJsonMessage !== null
                      ? { ...lastJsonMessage }
                      : lastJsonMessage
                  );
                }
                break;
              case "gameContents":
                if (message?.allKeys && message?.columnsObject) {
                  setLastGameContentsMessage(
                    typeof lastJsonMessage === "object" && lastJsonMessage !== null
                      ? { ...lastJsonMessage }
                      : lastJsonMessage
                  );
                }
                break;
              case "serverError":
                devLog(["Server error message:", message.error]);
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
              case "error":
                devLog(["Error message from server:", message.error]);
                setServerError(message.error);
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
