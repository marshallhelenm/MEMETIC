export function getPlayPageRender({
  roomKey,
  validGame,
  connectionError,
  tryingToConnect,
  serverError,
}: {
  roomKey: string | null | undefined;
  validGame?: boolean;
  connectionError?: boolean;
  tryingToConnect?: boolean;
  serverError?: string;
}): string {
  if (!roomKey || roomKey.length !== 8) {
    return "InvalidRoomKey";
  }
  if (connectionError && !tryingToConnect) {
    return "ErrorPageConnection";
  }
  // A loaded game stays on screen while the socket reconnects.
  if (validGame) {
    return "PlayGame";
  }
  if (serverError !== undefined && serverError !== "") {
    return "ErrorPageServer";
  }
  return "RoomLoading";
}
