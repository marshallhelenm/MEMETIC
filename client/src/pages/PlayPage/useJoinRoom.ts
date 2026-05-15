import { useEffect, useState } from "react";

interface UseJoinRoomProps {
  validGame: boolean;
  roomKey: string | null | undefined;
  username: string | null | undefined;
  gameKey: string;
  sendJsonMessage: (msg: any) => void;
  maxAttempts?: number;
  retryDelay?: number;
}

export function useJoinRoom({
  validGame,
  roomKey,
  username,
  gameKey,
  sendJsonMessage,
  maxAttempts = 11,
  retryDelay = 500,
}: UseJoinRoomProps) {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (validGame) {
      setAttempts(0);
      return;
    }

    if (!roomKey || !username) return;

    if (attempts < maxAttempts) {
      const timer = setTimeout(() => {
        sendJsonMessage({
          type: "joinRoom",
          roomKey,
          username,
          card: sessionStorage.getItem(
            `guessy-${roomKey}-player-card-${gameKey}`
          ),
        });
        setAttempts((a) => a + 1);
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [
    attempts,
    validGame,
    roomKey,
    username,
    gameKey,
    sendJsonMessage,
    maxAttempts,
    retryDelay,
  ]);

  return attempts;
}
