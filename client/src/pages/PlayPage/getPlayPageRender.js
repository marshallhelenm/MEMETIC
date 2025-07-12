export function getPlayPageRender({
  roomKey,
  validGame,
  connectionOpen,
  connectionError,
  tryingToConnect,
  serverError,
}) {
  if (!roomKey || roomKey.length !== 8) {
    return "InvalidRoomKey";
  }
  if (validGame && connectionOpen) {
    return "PlayGame";
  }
  if (connectionError && !tryingToConnect) {
    return "ErrorPageConnection";
  }
  if (serverError !== "") {
    return "ErrorPageServer";
  }
  return "RoomLoading";
}
