import { useEffect, useRef, useState } from "react";
import { getRememberedCard } from "../../utils/rememberedCard";
import type { ClientMessage } from "../../messages";

interface UseJoinRoomProps {
  validGame: boolean;
  roomKey: string | null | undefined;
  username: string | null | undefined;
  sendJsonMessage: (msg: ClientMessage) => void;
  connectionOpen?: boolean;
  maxAttempts?: number;
  retryDelay?: number;
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
    // The card this tab last had in this room, so the server can restore it.
    const { card, gameKey } = getRememberedCard(roomKey);
    sendJsonMessage({ type: "joinRoom", roomKey, username, card, gameKey });
  };
  const latest = useRef({ sendJoin, sendJsonMessage });
  latest.current = { sendJoin, sendJsonMessage };

  // Join when entering a room and leave when navigating away from it (or to
  // another room), so the server doesn't keep us in a room we've left. The
  // socket stays open across pages, so a disconnect would never signal this.
  // Under StrictMode this runs join, leave, join, which ends up joined.
  useEffect(() => {
    if (!roomKey || !username) return;
    latest.current.sendJoin();
    return () => latest.current.sendJsonMessage({ type: "leaveRoom", roomKey });
  }, [roomKey, username]);

  // Initial join: retry until the game contents arrive.
  useEffect(() => {
    if (validGame) {
      setAttempts(0);
      return;
    }
    if (!roomKey || !username) return;

    if (attempts < maxAttempts) {
      const timer = setTimeout(() => {
        latest.current.sendJoin();
        setAttempts((a) => a + 1);
      }, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [attempts, validGame, roomKey, username, maxAttempts, retryDelay]);

  // Re-join as soon as the socket comes back after a drop, so the server
  // re-links us to our existing player (and card) in the room.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = connectionOpen;
    if (connectionOpen && !wasOpen && validGame) latest.current.sendJoin();
  }, [connectionOpen, validGame]);

  return attempts;
}
