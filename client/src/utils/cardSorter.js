import { memeData } from "../assets/memeCollection";

// NOTE: this should be called on setRoomContents, not in the Board component, so it only has to be calculated once
function sortedColumns(itemKeys) {
  let columns = {};
  for (let index = 1; index < 7; index++) {
    columns[index] = [];
  }

  function calcHeight(key) {
    return 1 / parseFloat(memeData[key]["height_multiplier"]);
  }

  const totalHeight = itemKeys.reduce((sum, key) => {
    return sum + calcHeight(key);
  }, 0.0);

  const targetHeight = totalHeight / 6;

  function bestFit(currentHeight, keys) {
    let desiredHeight = Math.abs(targetHeight - currentHeight);
    let closestMatch;
    let closestHeight;
    for (let i = 0; i < keys.length; i++) {
      if (i == 0) {
        closestMatch = keys[0];
        closestHeight = calcHeight(closestMatch);
      } else {
        let currentHeight = keys[i];
        if (
          Math.abs(desiredHeight - currentHeight) <
          Math.abs(desiredHeight - closestHeight)
        ) {
          closestMatch = keys[i];
          closestHeight = calcHeight(closestMatch);
        }
      }
    }
    return closestMatch;
  }

  function findColHeight(col) {
    let height = 0.0;
    if (col.length == 0) {
      return 0;
    }
    for (let i = 0; i < col.length; i++) {
      let key = col[i];
      height = height + calcHeight(key);
    }
    return height;
  }

  function findColHeights() {
    const heights = [];
    for (let i = 1; i < 7; i++) {
      heights.push(findColHeight(columns[i]));
    }
    return heights;
  }

  function findShortestColumn() {
    const heights = findColHeights();
    let shortestCol = 1;
    for (let i = 1; i < 7; i++) {
      let currentHeight = heights[i - 1];
      if (currentHeight == 0) {
        return i;
      }
      if (currentHeight <= heights[shortestCol - 1]) {
        shortestCol = i;
      }
    }
    return shortestCol;
  }

const finalHeights = []

  function fillColumns() {
    const remainingKeys = itemKeys.slice(0);
    while (remainingKeys.length > 0) {
      for (let i = 1; i < 7; i++) {
        let col = columns[i];
        let currentHeight = findColHeight(col);
        let nextKey = bestFit(currentHeight, remainingKeys);
        col.push(nextKey);
        const index = remainingKeys.indexOf(nextKey);
        if (index > -1) {
          remainingKeys.splice(index, 1);
        }
        if (remainingKeys.length < 6){
            finalHeights.push(currentHeight + calcHeight(nextKey))
        }
      }
    }
    return columns;
  }

  function sortColumnsByHeight() {
    let columnKeys = [1, 2, 3, 4, 5, 6]
    columnKeys = columnKeys.sort((a, b) => {
      return parseFloat(finalHeights[a - 1]) - parseFloat(finalHeights[b - 1])
    });
    let orderedColumns = {
        1: columns[columnKeys[1]],
        2: columns[columnKeys[3]],
        3: columns[columnKeys[5]],
        4: columns[columnKeys[4]],
        5: columns[columnKeys[2]],
        6: columns[columnKeys[0]],
    }
    columns = orderedColumns
  }

  fillColumns()
  sortColumnsByHeight()
  return columns

}

function unsortedColumns(itemKeys) {
  const columns = {};
  for (let index = 1; index < 7; index++) {
    columns[index] = [];
  }
  let count = 0;
  let currentColumn = 1;
  for (let key in itemKeys) {
    if (count < 4) {
      columns[currentColumn].push(itemKeys[key]);
      count++;
    } else {
      currentColumn++;
      columns[currentColumn].push(itemKeys[key]);
      count = 1;
    }
  }
  return columns;
}

export { sortedColumns, unsortedColumns };
