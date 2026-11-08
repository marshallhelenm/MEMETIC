import React, { createContext, useMemo, useState, useEffect, ReactNode } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { devLog } from "../utils/Helpers";
import { getPlayerId } from "../utils/playerId";

export interface WSContextValue {
    sendJsonMessage: (msg: any) => void;
    lastJsonMessage: any;
    connectionError: boolean;
    connectionOpen: boolean;
    tryingToConnect: boolean;
    serverError: string | object;
    lastGameContentsMessage: any;
    lastChatHistoryMessage: any;
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

  const MAX_RECONNECT_ATTEMPTS = 10;

  function WSProvider({ children }: WSProviderProps) {
    // Resolved synchronously so the first connection includes the player ID.
    const [playerId] = useState<string>(getPlayerId);
    const [serverError, setServerError] = useState<string | object>("");
    const [reconnectGaveUp, setReconnectGaveUp] = useState<boolean>(false);
    const [lastGameContentsMessage, setLastGameContentsMessage] = useState<any>({});
    const [lastChatHistoryMessage, setLastChatHistoryMessage] = useState<any>({});

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
      `${socketURL}?uuid=${encodeURIComponent(playerId)}`,
      {
        share: false,
        shouldReconnect: () => true,
        reconnectAttempts: MAX_RECONNECT_ATTEMPTS,
        // 1s, 2s, 4s ... capped at 10s
        reconnectInterval: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
        onOpen: () => setReconnectGaveUp(false),
        onReconnectStop: () => setReconnectGaveUp(true),
      },
    );

    const connectionOpen = readyState === ReadyState.OPEN;
    const connectionError = reconnectGaveUp && !connectionOpen;
    const tryingToConnect = !connectionOpen && !reconnectGaveUp;

    // Dispatch each incoming message by type.
    useEffect(() => {
      const message = lastJsonMessage as any;
      if (!message) return;

      switch (message.type) {
        case "chatHistory":
          if (message?.chatHistory && message.chatHistory.length > 0) {
            setLastChatHistoryMessage({ ...message });
          }
          break;
        case "gameContents":
          if (message?.allKeys && message?.columnsObject) {
            setLastGameContentsMessage({ ...message });
            // A valid game state means any earlier server error no longer applies.
            setServerError("");
          }
          break;
        case "error":
          devLog(["Error message from server:", message.error]);
          setServerError(message.error);
          break;
        default:
          devLog(["Unhandled message type in WSProvider:", message.type, message]);
      }
    }, [lastJsonMessage]);

    const value = useMemo(() => {
      return {
        sendJsonMessage,
        lastJsonMessage,
        connectionError,
        connectionOpen,
        tryingToConnect,
        serverError,
        lastGameContentsMessage,
        lastChatHistoryMessage,
      };
    }, [
      sendJsonMessage,
      lastJsonMessage,
      connectionError,
      connectionOpen,
      tryingToConnect,
      serverError,
      lastGameContentsMessage,
      lastChatHistoryMessage,
    ]);

    return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
  }

  export { WSContext, WSProvider };
