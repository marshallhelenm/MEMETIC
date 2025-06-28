import memeData from "../assets/memes.json";

function cardSorter(unsortedKeys, columnCount) {
  let itemKeys = sortKeysByHeight(unsortedKeys);
  let columnsObject = {};
  for (let index = 1; index < columnCount + 1; index++) {
    columnsObject[index] = [];
  }
  let fullCardsHeight = totalCardHeight(itemKeys);

  // ** Utility methods
  function sortKeysByHeight(keys) {
    return keys.sort((a, b) => {
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
    Object.keys(columns).forEach((key) => {
      heights.push(findColHeight(columns[key]));
    });
    return heights;
  }

  function avgColHeight(columns) {
    const heights = findColHeights(columns);
    let curTotalHeight = heights.reduce((sum, h) => {
      return sum + h;
    }, 0.0);

    let avg = curTotalHeight / heights.length;
    return avg;
  }

  function totalCardHeight(keys) {
    return keys.reduce((sum, key) => {
      return sum + parseHeight(key);
    }, 0.0);
  }

  function avgCardHeight(keys) {
    let height = totalCardHeight(keys);
    console.log("avgHeight: ", height, keys.length);

    return height / keys.length;
  }

  // ** assessment methods

  function findShortestColumn(columns) {
    const heights = findColHeights(columns);
    let shortestCol = 1;
    for (let i = 1; i < heights.length + 1; i++) {
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

  function bestColumn(key, columns, targetHeight, finalCards = false) {
    let cardHeight = parseHeight(key);
    let isTall = cardHeight * 3 > targetHeight;

    //looking for a gap that is as close to current height as possible.
    let bestFitColumn = 1; // tag for the column with the best fit
    let closestFit; // the difference between the proposed height and the target height
    //  a negative fit signifies overflow, a positive fit indicates there is that much space left in the column

    for (let i = 1; i < Object.keys(columns).length + 1; i++) {
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

  // ** Assembly Methods

  function shuffleColumn(col) {
    return col.sort(() => Math.random() - 0.5);
  }

  function assignCardsToColumns(columns) {
    let workingCols = { ...columns };
    let targetHeight = fullCardsHeight / columnCount;
    let finalCards = false;
    itemKeys.forEach((key, i) => {
      if (i >= 18) {
        targetHeight =
          avgColHeight(workingCols) + avgCardHeight(itemKeys.slice(18));
        finalCards = true;
      }
      let bc = bestColumn(key, workingCols, targetHeight, finalCards);
      workingCols[bc].push(key);
    });
    return workingCols;
  }

  function sortColumnsByHeight(columnsObject) {
    let colCount = Object.keys(columnsObject).length;
    const finalHeights = [];
    let columnKeys = Array.from({ length: colCount }, (_, i) => i + 1);
    columnKeys.forEach((key) => {
      finalHeights.push(findColHeight(columnsObject[key]));
    });
    columnKeys = columnKeys.sort((a, b) => {
      return parseFloat(finalHeights[a - 1]) - parseFloat(finalHeights[b - 1]);
    });
    let orderedColumns = {};
    for (let i = 0; i < colCount; i++) {
      orderedColumns[i + 1] = shuffleColumn(columnsObject[columnKeys[i]]);
    }
    return orderedColumns;
  }

  function unsortedColumns(itemKeys, columnCount) {
    const columns = {};
    for (let index = 1; index < columnCount + 1; index++) {
      columns[index] = [];
    }
    let count = 0;
    let currentColumn = 1;
    for (let key in itemKeys) {
      if (count < columnCount) {
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

  // ***

  columnsObject = assignCardsToColumns(columnsObject);
  columnsObject = sortColumnsByHeight(columnsObject);

  // console.log(columnsObject);

  return columnsObject;
}

export { cardSorter };
