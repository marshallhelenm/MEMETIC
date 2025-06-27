import memeData from "../assets/memes.json";

function sortKeysByHeight(itemKeys) {
  return itemKeys.sort((a, b) => {
    return parseHeight(b) - parseHeight(a);
  });
}

function parseHeight(key) {
  return parseFloat(memeData[key]["height_multiplier"]);
}

function findColHeight(col) {
  let height = 0.0;
  if (col.length == 0) {
    return 0;
  }
  for (let i = 0; i < col.length; i++) {
    let key = col[i];
    height = height + parseHeight(key);
  }

  return height;
}

function findColHeights(columns) {
  const heights = [];
  for (let i = 1; i < 7; i++) {
    heights.push(findColHeight(columns[i]));
  }
  return heights;
}

function avgColHeight(columns) {
  const heights = findColHeights(columns);
  let curTotalHeight = heights.reduce((sum, h) => {
    return sum + h;
  }, 0.0);

  let avg = curTotalHeight / 6;
  return avg;
}

function avgCardHeight(keys) {
  let height = keys.reduce((sum, key) => {
    return sum + parseHeight(key);
  }, 0);
  console.log("avgHeight: ", height, keys.length);

  return height / keys.length;
}

function findShortestColumn(columns) {
  const heights = findColHeights(columns);
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

function bestFit(currentHeight, keys, targetHeight) {
  let desiredHeight = Math.abs(targetHeight - currentHeight);
  let closestMatch;
  let closestHeight;
  for (let i = 0; i < keys.length; i++) {
    if (i == 0) {
      closestMatch = keys[0];
      closestHeight = parseHeight(closestMatch);
    } else {
      let currentHeight = keys[i];
      if (
        Math.abs(desiredHeight - currentHeight) <
        Math.abs(desiredHeight - closestHeight)
      ) {
        closestMatch = keys[i];
        closestHeight = parseHeight(closestMatch);
      }
    }
  }
  return closestMatch;
}

function leastOverflowingColumn(key, columns, targetHeight) {}

function bestColumn(key, columns, targetHeight, finalCards = false) {
  let cardHeight = parseHeight(key);
  let isTall = cardHeight * 3 > targetHeight;

  //looking for a gap that is as close to current height as possible.
  let bestFitColumn = 1; // tag for the column with the best fit
  let closestFit; // the difference between the proposed height and the target height
  //  a negative fit signifies overflow, a positive fit indicates there is that much space left in the column

  for (let i = 1; i < 7; i++) {
    let colHeight = findColHeight(columns[i]);
    let currentGap = targetHeight - colHeight; // amount of empty space left in the column we are currently looking at

    if (!finalCards && currentGap <= 0) continue; // this column is full, don't add anything to it

    let currentFit = currentGap - cardHeight; // the difference between the proposed height if we use this column and the target height

    if (i == 1) {
      // it's the first column we're looking at, so it's our baseline for comparison
      closestFit = currentFit;
      continue;
    }

    if (currentFit > 0 && closestFit > 0) {
      if (currentFit > closestFit) {
        if (isTall) {
          // favor leaving the smallest fit
          continue;
        } else {
          // pick the current one - it's emptier
          bestFitColumn = i;
          closestFit = currentFit;
        }
      }
    } else if (currentFit < 0 && closestFit < 0) {
      // if both overflow
      if (currentFit > closestFit) {
        // favor the one with the least overflow
        // pick the current one if it overflows less
        bestFitColumn = i;
        closestFit = currentFit;
      }
    } else if (currentFit < 0 && closestFit > 0) {
      // if current overflows but our best match doesn't
      // favor the one that doesn't overflow
      if (!isTall) {
        continue;
      } else {
        // unless the card is tall - in which case, go for the closest fit
        if (Math.abs(currentFit) < Math.abs(closestFit)) {
          bestFitColumn = i;
          closestFit = currentFit;
        }
      }
    } else if (currentFit > 0 && closestFit < 0) {
      // if best match overflows but our current match doesn't
      // favor the one that doesn't overflow
      closestFit = currentFit;
      bestFitColumn = i;
    }
  }

  return bestFitColumn;
}

function shuffleColumn(col) {
  return col.sort(() => Math.random() - 0.5);
}

// ***

function sortedColumns(unsortedKeys) {
  let itemKeys = sortKeysByHeight(unsortedKeys);

  let columns = {};
  for (let index = 1; index < 7; index++) {
    columns[index] = [];
  }
  const totalHeight = itemKeys.reduce((sum, key) => {
    return sum + parseHeight(key);
  }, 0.0);
  let targetHeight = totalHeight / 6;
  let finalCards = false;
  const finalHeights = [];
  // function fillColumns() {
  //   const remainingKeys = itemKeys.slice(0);
  //   while (remainingKeys.length > 0) {
  //     if (remainingKeys.length == 6) {
  //       targetHeight = avgColHeight(columns);
  //     }
  //     for (let i = 1; i < 7; i++) {
  //       let col = columns[i];
  //       let currentHeight = findColHeight(col);
  //       let nextKey = bestFit(currentHeight, remainingKeys, targetHeight);
  //       col.push(nextKey);
  //       const index = remainingKeys.indexOf(nextKey);
  //       if (index > -1) {
  //         remainingKeys.splice(index, 1);
  //       }
  //       if (remainingKeys.length < 6) {
  //         finalHeights.push(currentHeight + parseHeight(nextKey));
  //       }
  //     }
  //   }
  //   return columns;
  // }

  function assignCardsToColumns() {
    itemKeys.forEach((key, i) => {
      if (i >= 18) {
        targetHeight =
          avgColHeight(columns) + avgCardHeight(itemKeys.slice(18));
        finalCards = true;
      }
      console.log("new target height: ", targetHeight);
      let bc = bestColumn(key, columns, targetHeight, finalCards);
      columns[bc].push(key);
    });
    return columns;
  }

  function sortColumnsByHeight() {
    let columnKeys = [1, 2, 3, 4, 5, 6];
    columnKeys.forEach((key) => {
      finalHeights.push(findColHeight(columns[key]));
    });

    columnKeys = columnKeys.sort((a, b) => {
      return parseFloat(finalHeights[a - 1]) - parseFloat(finalHeights[b - 1]);
    });
    let orderedColumns = {};
    for (let i = 0; i < 6; i++) {
      orderedColumns[i + 1] = columns[columnKeys[i]];
    }
    columns = orderedColumns;
  }

  // fillColumns();
  assignCardsToColumns();
  for (let i = 1; i < 7; i++) {
    columns[i] = shuffleColumn(columns[i]);
  }
  sortColumnsByHeight();
  return columns;
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
