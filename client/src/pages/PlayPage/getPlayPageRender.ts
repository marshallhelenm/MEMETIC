export function getPlayPageRender({
  roomKey,
  validGame,
  connectionOpen,
  connectionError,
  tryingToConnect,
  serverError,
}: {
  roomKey: string | null | undefined;
  validGame?: boolean;
  connectionOpen?: boolean;
  connectionError?: boolean;
  tryingToConnect?: boolean;
  serverError?: string;
}): string {
  if (!roomKey || roomKey.length !== 8) {
    return "InvalidRoomKey";
  }
  if (validGame && connectionOpen) {
    return "PlayGame";
  }
  if (connectionError && !tryingToConnect) {
    return "ErrorPageConnection";
  }
  if (serverError !== undefined && serverError !== "") {
    return "ErrorPageServer";
  }
  return "RoomLoading";
}
