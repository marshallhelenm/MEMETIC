const handleLocalStorage = (message) => {
  const searchParams = new URLSearchParams(window.location.search);
  const roomKey = message.roomKey || searchParams.get("roomKey");
  const username = message.username || searchParams.get("username");
  const playerCard = message.playerCard;

  const cleanUpRoom = (roomKey) => {
    Object.keys(localStorage).forEach((key) => {
      if (key.includes(roomKey)) localStorage.removeItem(key);
    });
  };
  const cleanUpGuessy = (roomKey) => {
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("guessy")) localStorage.removeItem(key);
    });
  };

  const getUsername = (roomKey) => {
    const localUsername = localStorage.getItem(`guessy-${roomKey}-username`);
    if (!!localUsername && localUsername != "undefined") {
      return localUsername;
    }
  };

  const getPlayerCard = (roomKey) => {
    const localPlayerCard = localStorage.getItem(
      `guessy-${roomKey}-player-card`
    );
    if (!localPlayerCard || localPlayerCard == "undefined") {
      return null;
    } else {
      return localPlayerCard;
    }
  };

  const setPlayerCard = (roomKey, card) => {
    localStorage.setItem(`guessy-${roomKey}-player-card`, card);
  };

  const clearPlayerCard = (roomKey) => {
    localStorage.removeItem(`guessy-${roomKey}-player-card`);
  };

  switch (message.type) {
    case "cleanUpRoom":
      cleanUpRoom(roomKey);
      break;
    case "cleanUpGuessy":
      cleanUpGuessy(roomKey);
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
