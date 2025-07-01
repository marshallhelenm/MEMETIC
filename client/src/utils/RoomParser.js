import { devLog } from "./Helpers";

function parseUsers({ player1, player2, myUuid }) {
  const parsedUserInfo = {
    myPlayerCard: undefined,
    username: undefined,
    partnerCard: undefined,
    partnerUsername: undefined,
    observer: false,
  };

  let myInfo = {};
  let partnerInfo = {};

  // devLog([
  //   "RoomParser",
  //   "myUuid: ",
  //   myUuid,
  //   "player1: ",
  //   player1,
  //   "player2: ",
  //   player2,
  // ]);

  if (player1.uuid && player1.uuid === myUuid) {
    // i'm player 1
    myInfo = { ...player1 };
    partnerInfo = { ...player2 };
    parsedUserInfo.observer = false;
  } else if (player2.uuid && player2.uuid === myUuid) {
    // i'm player 2
    myInfo = { ...player2 };
    partnerInfo = { ...player1 };
    parsedUserInfo.observer = false;
  } else {
    parsedUserInfo.observer = true;
  }

  // devLog([
  //   "RoomParser",
  //   "myInfo: ",
  //   typeof myInfo,
  //   myInfo,
  //   "partnerInfo: ",
  //   typeof partnerInfo,
  //   partnerInfo,
  // ]);

  if (myInfo && Object.keys(myInfo).length > 0) {
    parsedUserInfo.username =
      myInfo.username ||
      new URLSearchParams(window.location.search).get("username");
    parsedUserInfo.myPlayerCard = myInfo.card;
  }
  if (partnerInfo && Object.keys(partnerInfo).length > 0) {
    parsedUserInfo.partnerUsername = partnerInfo.username || "";
    parsedUserInfo.partnerCard = partnerInfo.card;
  }

  return parsedUserInfo;
}
function parseRoom({ roomKey, roomObject, myUuid }) {
  if (typeof roomObject == "string") roomObject = JSON.parse(roomObject);
  let value = {
    roomKey,
    allKeys: [],
    columnsObject: {},
    myPlayerCard: undefined,
    username: undefined,
    partnerCard: undefined,
    partnerUsername: undefined,
    observer: false,
  };

  // start by parsing user info
  let parsedUserInfo = parseUsers({
    roomKey,
    player1: roomObject["player1"],
    player2: roomObject["player2"],
    myUuid,
  });
  value = { ...value, ...parsedUserInfo };

  // next parse game info
  let allKeys = roomObject.allKeys;
  let columnsObject = roomObject.columnsObject;

  if (allKeys.length == 24 && Object.keys(columnsObject).length == 6) {
    value.allKeys = [...allKeys];
    value.columnsObject = { ...columnsObject };
  }

  return value;
}

export { parseUsers, parseRoom };
