import { useEffect, useMemo } from "react";

import { useGame, useWS, usePlayers } from "../contexts/useContextHooks";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";
import { GameProvider } from "../contexts/GameContext";
import { PlayersProvider } from "../contexts/PlayersContext";

function MessageReceiver() {
  return (
    <GameProvider>
      <PlayersProvider>
        <MessageReceiverInnards />
      </PlayersProvider>
    </GameProvider>
  );
}

function MessageReceiverInnards() {
  const { createGame, setGame } = useGame();
  const { handleSetOtherPlayers } = usePlayers();
  const { lastJsonMessage, sendJsonMessage, uuidRef, setServerError } = useWS();
  const { lastJsonMessageChanged } = useTraceUpdate(
    { lastJsonMessage }
    // true,
    // "MessageReceiver"
  );

  //   **Message Handling**
  const handleIncomingMessage = useMemo(() => {
    return (message) => {
      try {
        // prep message for handling
        if (typeof message == "string") {
          message = JSON.parse(message);
        } else if (typeof message !== "object") {
          console.warn(
            "Message Handler: Invalid message received",
            typeof message,
            JSON.stringify(message)
          );
          return;
        }

        devLog([
          "MessageReceiver handling message: ",
          message.type,
          // JSON.stringify(message),
        ]);

        if (!message) return; // nothin to do

        if (!uuidRef.current && message.type != "uuid") {
          // we're not ready to receive messages, ask for a uuid
          sendJsonMessage({
            type: "requestUuid",
          });
          return;
        }
        let room;
        switch (message.type) {
          case "noGameAlert":
            createGame();
            break;
          case "gameContents":
            room = message.room;
            if (typeof room === "string") {
              room = JSON.parse(room);
            }
            if (!room) {
              devLog(["server sent no gameContents to process!", message.room]);
              return;
            }
            setGame({
              newKeys: message.allKeys,
              newColumnsObject: message.columnsObject,
            });
            break;
          case "serverError":
            setServerError(JSON.parse(message.error));
            break;
          case "playersUpdate":
            handleSetOtherPlayers(message.players);
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
          default:
            devLog([
              "Unhandled message type in MessageReceiver:",
              message.type,
              message,
            ]);
        }
      } catch (error) {
        devLog(["Error in MessageReceiver", error, JSON.stringify(message)]);
      }
    };
  }, [
    sendJsonMessage,
    setServerError,
    uuidRef,
    createGame,
    setGame,
    handleSetOtherPlayers,
  ]);

  useEffect(() => {
    if (lastJsonMessageChanged) handleIncomingMessage(lastJsonMessage);
  }, [handleIncomingMessage, lastJsonMessageChanged, lastJsonMessage]);
}

export default MessageReceiver;
