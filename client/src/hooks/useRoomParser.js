import { devLog } from "../utils/Helpers";

function useRoomParser({ roomObject, columnCount, myUuid }) {
  if (typeof roomObject == "string") roomObject = JSON.parse(roomObject);
  let allKeys = [];
  let columns = {};
  let myUserInfo = {};
  let myPlayerCard;
  let myUsername;
  let observer = false;
  let users = {};

  // devLog(["useRoomParser, roomObject: ", roomObject]);
  let validRoomObject =
    typeof roomObject === "object" && Object.keys(roomObject).length > 0;

  if (!validRoomObject)
    return {
      allKeys,
      columns,
      myUserInfo,
      myPlayerCard,
      myUsername,
      users,
      observer,
      validRoomObject,
    };

  devLog(["useRoomParser, roomObject.memeSet: ", roomObject.memeSet]);

  if (roomObject.memeSet) {
    allKeys = roomObject.memeSet.allKeys;
    columns = roomObject.memeSet[`${columnCount}Column`];
  } else {
    validRoomObject = false;
    return {
      allKeys,
      columns,
      myUserInfo,
      myPlayerCard,
      myUsername,
      users,
      observer,
      validRoomObject,
    };
  }

  users = roomObject.users;
  if (users) {
    myUserInfo = roomObject.users[myUuid];
    if (myUserInfo) {
      myUsername = myUserInfo.username;
      myPlayerCard = myUserInfo.playerCard;
    } else {
      observer = Object.keys(users).length >= 2;
    }
  }

  validRoomObject = allKeys && columns;

  return {
    allKeys,
    columns,
    myUserInfo,
    myPlayerCard,
    myUsername,
    users,
    observer,
    validRoomObject,
  };
}

export { useRoomParser };
