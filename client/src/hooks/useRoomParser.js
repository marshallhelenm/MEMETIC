import { handleLocalStorage } from "../utils/LocalStorageHandler";

function useRoomParser({ roomKey, roomObject, myUuid }) {
  if (typeof roomObject == "string") roomObject = JSON.parse(roomObject);
  let allKeys = [];
  let columnsObject = {};
  let myUserInfo = {};
  let myPlayerCard;
  let myUsername;
  let observer = false;
  let users = {};

  let validRoomObject =
    typeof roomObject === "object" && Object.keys(roomObject).length > 0;

  let value = {
    allKeys,
    columnsObject,
    myUserInfo,
    myPlayerCard,
    myUsername,
    users,
    observer,
    validRoomObject,
  };

  if (!validRoomObject) return value;

  if (roomObject.memeSet) {
    allKeys = [...roomObject.memeSet.allKeys];
    columnsObject = { ...roomObject.memeSet };
    delete columnsObject.allKeys;
    value = { ...value, allKeys, columnsObject, ...columnsObject }; // add both the whole columns object and each column from inside it
  } else {
    validRoomObject = false;
    value = { ...value, validRoomObject };
    return value;
  }

  users = { ...roomObject.users };
  value = { ...value, users };

  if (users) {
    myUserInfo = { ...roomObject.users[myUuid] };
    value = { ...value, myUserInfo };

    if (myUserInfo) {
      myUsername = myUserInfo.username;
      myPlayerCard =
        myUserInfo.playerCard ||
        handleLocalStorage({
          type: "getPlayerCard",
          roomKey: roomKey,
        });
      value = { ...value, myUsername, myPlayerCard };
    } else {
      observer = Object.keys(users).length >= 2;
      value = { ...value, observer };
    }
  }

  validRoomObject = allKeys && columnsObject;
  value = { ...value, validRoomObject };

  return value;
}

export { useRoomParser };
