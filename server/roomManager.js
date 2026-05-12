// Room and player management utilities and templates

const emptyRoomTemplate = {
  roomKey: undefined,
  columnsObject: {},
  allKeys: [],
  players: {},
  player1Uuid: null,
  player2Uuid: null,
  messageHistory: [],
};

const emptyPlayerTemplate = {
  uuid: undefined,
  username: undefined,
  card: undefined,
};

function deepClone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj));
  }
}

module.exports = {
  emptyRoomTemplate,
  emptyPlayerTemplate,
  deepClone,
};
