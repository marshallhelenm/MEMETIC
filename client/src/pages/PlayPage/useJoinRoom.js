import { useEffect, useState } from "react";

export function useJoinRoom({
  validGame,
  roomKey,
  username,
  gameKey,
  sendJsonMessage,
  maxAttempts = 11,
  retryDelay = 500,
}) {
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
