import { useEffect, useMemo } from "react";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";

function MessageReceiver() {
  const { guessyManager, dispatch } = useGuessy();
  const { lastJsonMessage, uuid } = useWS();
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
      if (!message) return;

      devLog(["MessageReceiver handling message: ", message.type]);

      switch (message.type) {
        case "noGameAlert":
          guessyManager("createRoom", { newRoomKey: message.roomKey });
          break;
        case ("replaceGame", "roomContents"):
          // it's fuckin gone already
          if (!message.room) {
            devLog(["no roomContents to process!", message.room]);
            return;
          } else if (typeof message.room === "string") {
            message.room = JSON.parse(message.room);
          }
          dispatch({
            type: "updateRoom",
            payload: { roomObject: message.room },
          });
          break;
        case "usersUpdate":
          dispatch({
            type: "updateUsers",
            payload: { player1: message.player1, player2: message.player2 },
          });
          break;
        case "uuid":
          if (!sessionStorage.getItem("guessy-uuid")) {
            sessionStorage.setItem("guessy-uuid", message.uuid);
          }
          break;
        default:
          devLog(["Unhandled message type:", message["type"], message]);
      }
    };
  }, [dispatch, guessyManager]);

  useEffect(() => {
    if (lastJsonMessageChanged) handleIncomingMessage(lastJsonMessage);
  }, [handleIncomingMessage, lastJsonMessageChanged, lastJsonMessage]);
}

export default MessageReceiver;
