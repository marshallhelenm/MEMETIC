const handleLocalStorage = (message) => {
  const searchParams =
    message.searchParams || new URLSearchParams(window.location.search);
  const roomKey = message.roomKey || searchParams.get("roomKey");
  const username = message.username || searchParams.get("username");
  const playerCard = message.playerCard;

  const cleanUp = (roomKey = searchParams.get("roomKey")) => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(roomKey)) {
        localStorage.removeItem(key);
      }
    });
  };

  const getUsername = (roomKey = searchParams.get("roomKey")) => {
    const localUsername = localStorage.getItem(`${roomKey}-username`);
    if (!!localUsername && localUsername != "undefined") {
      return localUsername;
    }
  };

  const getPlayerCard = (roomKey = searchParams.get("roomKey")) => {
    const localPlayerCard = localStorage.getItem(`${roomKey}-player-card`);
    if (!localPlayerCard || localPlayerCard == "undefined") {
      return null;
    } else {
      return localPlayerCard;
    }
  };

  const setPlayerCard = (card, roomKey = searchParams.get("roomKey")) => {
    localStorage.setItem(`${roomKey}-player-card`, card);
  };

  const clearPlayerCard = (roomKey = searchParams.get("roomKey")) => {
    localStorage.removeItem(`${roomKey}-player-card`);
  };

  switch (message.type) {
    case "cleanUp":
      cleanUp(roomKey);
      break;
    case "getUsername":
      return getUsername(roomKey);
    case "setUsername":
      setPlayerCard(roomKey, username);
      break;
    case "getPlayerCard":
      return getPlayerCard(roomKey);
    case "setPlayerCard":
      setPlayerCard(roomKey, playerCard);
      break;
    case "clearPlayerCard":
      clearPlayerCard(roomKey);
      break;
    default:
      console.warn("Unknown local storage message type:", message.type);
      break;
  }
};

export { handleLocalStorage };
