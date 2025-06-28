import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useGuessy } from "../contexts/useGuessy";
import { useWS } from "../contexts/useWS";
import { useTraceUpdate } from "../hooks/useTraceUpdate";
import InvalidRoomKey from "../components/InvalidRoomKey";
import RoomLoading from "../components/RoomLoading";
import ConnectionError from "../components/ConnectionError";
import PlayGame from "../containers/PlayGame";
import { devLog } from "../utils/Helpers";

function PlayPage() {
  const { uuid, connectionStatus, connectionError } = useWS();
  const { roomKey, validRoomObject, guessyManager } = useGuessy();

  const { uuidChanged } = useTraceUpdate({ uuid }); // tracking this here, not higher up, because this is the only route where it's relevant

  useEffect(() => {
    if (typeof uuid === "string" || uuidChanged) {
      devLog([
        "PlayGame sending joinRoom. Request returnRoomContents: ",
        !validRoomObject,
      ]);
      guessyManager("joinRoom", { returnRoomContents: !validRoomObject });
    }
  }, [uuid, uuidChanged, validRoomObject, guessyManager]);

  // ** RENDER
  if (roomKey.length != 8) {
    return <InvalidRoomKey />;
  } else if (connectionError) {
    return <ConnectionError />;
  } else if (validRoomObject && connectionStatus == "Open") {
    return <PlayGame />;
  } else {
    return <RoomLoading />;
  }
}

export default PlayPage;
