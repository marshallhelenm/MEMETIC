import { useEffect, useRef, useState } from "react";
import { getSessionItem } from "../../utils/sessionStorageUtils";
import { cardStorageKey } from "../../contexts/PlayersContext";

interface UseJoinRoomProps {
  validGame: boolean;
  roomKey: string | null | undefined;
  username: string | null | undefined;
  gameKey?: number | string | null;
  sendJsonMessage: (msg: any) => void;
  connectionOpen?: boolean;
  maxAttempts?: number;
  retryDelay?: number;
}

/** The card this tab last had in this room, so the server can restore it. */
function rememberedCard(roomKey: string): { card?: string; gameKey?: number } {
  try {
    return JSON.parse(getSessionItem(cardStorageKey(roomKey)) || "{}");
  } catch {
    return {};
  }
}

export function useJoinRoom({
  validGame,
  roomKey,
  username,
  sendJsonMessage,
  connectionOpen = true,
  maxAttempts = 11,
  retryDelay = 500,
}: UseJoinRoomProps) {
  const [attempts, setAttempts] = useState(0);
  const wasOpenRef = useRef(connectionOpen);

  const sendJoin = () => {
    if (!roomKey || !username) return;
    const { card, gameKey } = rememberedCard(roomKey);
    sendJsonMessage({ type: "joinRoom", roomKey, username, card, gameKey });
  };

  // Initial join: retry until the game contents arrive.
  useEffect(() => {
    if (validGame) {
      setAttempts(0);
      return;
    }
    if (!roomKey || !username) return;

    if (attempts < maxAttempts) {
      const timer = setTimeout(() => {
        sendJoin();
        setAttempts((a) => a + 1);
      }, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [attempts, validGame, roomKey, username, sendJsonMessage, maxAttempts, retryDelay]);

  // Re-join as soon as the socket comes back after a drop, so the server
  // re-links us to our existing player (and card) in the room.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = connectionOpen;
    if (connectionOpen && !wasOpen && validGame) sendJoin();
  }, [connectionOpen, validGame]);

  return attempts;
}
