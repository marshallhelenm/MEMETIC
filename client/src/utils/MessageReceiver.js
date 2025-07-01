import { useEffect, useMemo } from "react";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";

function MessageReceiver() {
  const { guessyManager, dispatch } = useGuessy();
  const { lastJsonMessage, uuidRef, setServerError } = useWS();
  const { lastJsonMessageChanged } = useTraceUpdate({ lastJsonMessage });
  //   **Message Handling**
  const handleIncomingMessage = useMemo(() => {
    return (message) => {
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
      // devLog([
      //   "MessageReceiver handling message: ",
      //   message.type,
      //   // JSON.stringify(message),
      // ]);
      if (!message) return;

      if (!uuidRef.current && message.type != "uuid") {
        guessyManager("requestUuid");
        return;
      }
      switch (message.type) {
        case "noGameAlert":
          guessyManager("createRoom", { newRoomKey: message.roomKey });
          break;
        case "replaceGame":
        case "roomContents":
          if (!message.room) {
            devLog(["no roomContents to process!", message.room]);
            return;
          } else if (typeof message.room === "string") {
            message.room = JSON.parse(message.room);
          }
          dispatch({
            type: "updateRoom",
            payload: { roomObject: message.room },
            uuid: uuidRef.current,
          });
          dispatch({
            type: "setLoadingCards",
            payload: { loadingCards: false },
          });
          break;
        case "serverError":
          setServerError(JSON.parse(message.error));
          break;
        case "usersUpdate":
          dispatch({
            type: "updateUsers",
            payload: {
              player1: message.player1,
              player2: message.player2,
              uuid: uuidRef.current,
            },
          });
          break;
        case "uuid":
          if (!sessionStorage.getItem("guessy-uuid") || !uuidRef.current) {
            sessionStorage.setItem("guessy-uuid", message.uuid);
            uuidRef.current = message.uuid;
            guessyManager("acceptUuid");
          }
          break;
        default:
          devLog([
            "Unhandled message type in MessageReceiver:",
            message.type,
            message,
          ]);
      }
    };
  }, [dispatch, guessyManager, setServerError, uuidRef]);

  useEffect(() => {
    if (lastJsonMessageChanged) handleIncomingMessage(lastJsonMessage);
  }, [handleIncomingMessage, lastJsonMessageChanged, lastJsonMessage]);
}

export default MessageReceiver;
