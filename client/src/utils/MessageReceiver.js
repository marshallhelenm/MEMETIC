import { useEffect, useMemo } from "react";
import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import { devLog } from "../utils/Helpers";

function MessageReceiver() {
  const { guessyManager, dispatch } = useGuessy();
  const { lastJsonMessage, setUuid } = useWS();
  const { lastJsonMessageChanged } = useTraceUpdate({ lastJsonMessage });

  const processRoomContents = useMemo(() => {
    return (roomContents) => {
      if (!roomContents) {
        devLog(["no roomContents to process!", roomContents]);
        return;
      } else if (typeof roomContents === "string") {
        roomContents = JSON.parse(roomContents);
      }
      devLog(["processRoomContents", typeof roomContents, roomContents]);
      dispatch({ type: "updateRoom", payload: { roomObject: roomContents } });
    };
  }, [dispatch]);

  //   **Message Handling**
  const handleIncomingMessage = useMemo(() => {
    return (message) => {
      if (typeof message == "string") {
        message = JSON.parse(message);
      } else if (typeof message !== "object") {
        console.warn(
          "Message Handler: Invalid message received",
          typeof message,
          message
        );
        return;
      }
      if (!message) return;

      devLog(["MessageReceiver handling message: ", message]);

      switch (message["type"]) {
        case "noGameAlert":
          guessyManager("createRoom", { newRoomKey: message.roomKey });
          break;
        case "replaceGame":
          processRoomContents(message.newRoomObject);
          break;
        case "roomContents":
          processRoomContents(message.room);
          break;
        case "usersUpdate":
          dispatch({
            type: "updateUsers",
            payload: { player1: message.player1, player2: message.player2 },
          });
          break;
        case "uuid":
          setUuid(message.uuid);
          break;
        default:
          devLog(["Unhandled message type:", message["type"], message]);
      }
    };
  }, [processRoomContents, setUuid, dispatch, guessyManager]);

  useEffect(() => {
    if (lastJsonMessageChanged) handleIncomingMessage(lastJsonMessage);
  }, [handleIncomingMessage, lastJsonMessageChanged, lastJsonMessage]);
}

export default MessageReceiver;
