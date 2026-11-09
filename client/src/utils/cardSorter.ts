import memeData from "../assets/memes.json";

import type { ColumnLayout } from "../messages";

function cardSorter(unsortedKeys: string[], columnCount: number): ColumnLayout {
  const itemKeys = sortKeysByHeight(unsortedKeys);
  let columnsObject: ColumnLayout = {};
  for (let index = 1; index < columnCount + 1; index++) {
    columnsObject[index] = [];
  }
  const fullCardsHeight = totalCardHeight(itemKeys);

  // ** Utility methods
  function sortKeysByHeight(keys: string[]): string[] {
    return keys.sort((a, b) => {
      return parseHeight(b) - parseHeight(a);
    });
  }

  function parseHeight(key: string): number {
    const meme = (memeData as Record<string, { height_multiplier: number | string }>)[key];
    return parseFloat(String(meme.height_multiplier));
  }

  function findColHeight(col: string[]): number {
    let height = 0.0;
    if (col.length == 0) {
      return 0;
    }
    for (let i = 0; i < col.length; i++) {
      const key = col[i];
      height = height + parseHeight(key);
    }
    return height;
  }

  function findColHeights(columns: ColumnLayout): number[] {
    const heights: number[] = [];
    Object.keys(columns).forEach((key) => {
      heights.push(findColHeight(columns[Number(key)]));
    });
    return heights;
  }

  function avgColHeight(columns: ColumnLayout): number {
    const heights = findColHeights(columns);
    const curTotalHeight = heights.reduce((sum, h) => sum + h, 0.0);
    const avg = curTotalHeight / heights.length;
    return avg;
  }

  function totalCardHeight(keys: string[]): number {
    return keys.reduce((sum, key) => sum + parseHeight(key), 0.0);
  }

  function avgCardHeight(keys: string[]): number {
    const height = totalCardHeight(keys);
    return height / keys.length;
  }

  // ** assessment methods

  function findShortestColumn(columns: ColumnLayout): number {
    const heights = findColHeights(columns);
    let shortestCol = 1;
    for (let i = 1; i < heights.length + 1; i++) {
      const currentHeight = heights[i - 1];
      if (currentHeight == 0) {
        return i;
      }
      if (currentHeight <= heights[shortestCol - 1]) {
        shortestCol = i;
      }
    }
    return shortestCol;
  }

  function bestFit(currentHeight: number, keys: string[], targetHeight: number): string | undefined {
    const desiredHeight = Math.abs(targetHeight - currentHeight);
    let closestMatch: string | undefined = undefined;
    let closestHeight: number | undefined = undefined;
    for (let i = 0; i < keys.length; i++) {
      if (i == 0) {
        closestMatch = keys[0];
        closestHeight = parseHeight(closestMatch);
      } else {
        const currentKey = keys[i];
        const currentKeyHeight = parseHeight(currentKey);
        if (
          closestHeight !== undefined &&
          Math.abs(desiredHeight - currentKeyHeight) < Math.abs(desiredHeight - closestHeight)
        ) {
          closestMatch = currentKey;
          closestHeight = currentKeyHeight;
        }
      }
    }
    return closestMatch;
  }

  function bestColumn(key: string, columns: ColumnLayout, targetHeight: number, finalCards = false): number {
    const cardHeight = parseHeight(key);
    const isTall = cardHeight * 3 > targetHeight;
    let bestFitColumn = 1;
    let closestFit: number | undefined = undefined;
    for (let i = 1; i < Object.keys(columns).length + 1; i++) {
      const colHeight = findColHeight(columns[i]);
      const currentGap = targetHeight - colHeight;
      if (!finalCards && currentGap <= 0) continue;
      const currentFit = currentGap - cardHeight;
      if (i == 1) {
        closestFit = currentFit;
        continue;
      }
      if (closestFit === undefined) continue;
      if (currentFit > 0 && closestFit > 0) {
        if (currentFit > closestFit) {
          if (isTall) {
            continue;
          } else {
            bestFitColumn = i;
            closestFit = currentFit;
          }
        }
      } else if (currentFit < 0 && closestFit < 0) {
        if (currentFit > closestFit) {
          bestFitColumn = i;
          closestFit = currentFit;
        }
      } else if (currentFit < 0 && closestFit > 0) {
        if (!isTall) {
          continue;
        } else {
          if (Math.abs(currentFit) < Math.abs(closestFit)) {
            bestFitColumn = i;
            closestFit = currentFit;
          }
        }
      } else if (currentFit > 0 && closestFit < 0) {
        closestFit = currentFit;
        bestFitColumn = i;
      }
    }
    return bestFitColumn;
  }

  // ** Assembly Methods

  function shuffleColumn(col: string[]): string[] {
    return col.sort(() => Math.random() - 0.5);
  }

  function assignCardsToColumns(columns: ColumnLayout): ColumnLayout {
    const workingCols: ColumnLayout = { ...columns };
    let targetHeight = fullCardsHeight / columnCount;
    let finalCards = false;
    itemKeys.forEach((key, i) => {
      if (i >= 18) {
        targetHeight = avgColHeight(workingCols) + avgCardHeight(itemKeys.slice(18));
        finalCards = true;
      }
      const bc = bestColumn(key, workingCols, targetHeight, finalCards);
      workingCols[bc].push(key);
    });
    return workingCols;
  }

  function sortColumnsByHeight(columnsObject: ColumnLayout): ColumnLayout {
    const colCount = Object.keys(columnsObject).length;
    const finalHeights: number[] = [];
    let columnKeys = Array.from({ length: colCount }, (_, i) => i + 1);
    columnKeys.forEach((key) => {
      finalHeights.push(findColHeight(columnsObject[key]));
    });
    columnKeys = columnKeys.sort((a, b) => {
      return parseFloat(finalHeights[a - 1].toString()) - parseFloat(finalHeights[b - 1].toString());
    });
    const orderedColumns: ColumnLayout = {};
    for (let i = 0; i < colCount; i++) {
      orderedColumns[i + 1] = shuffleColumn(columnsObject[columnKeys[i]]);
    }
    return orderedColumns;
  }

  function unsortedColumns(itemKeys: string[], columnCount: number): ColumnLayout {
    const columns: ColumnLayout = {};
    for (let index = 1; index < columnCount + 1; index++) {
      columns[index] = [];
    }
    let count = 0;
    let currentColumn = 1;
    for (const key of itemKeys) {
      if (count < columnCount) {
        columns[currentColumn].push(key);
        count++;
      } else {
        currentColumn++;
        columns[currentColumn].push(key);
        count = 1;
      }
    }
    return columns;
  }

  // ***

  columnsObject = assignCardsToColumns(columnsObject);
  columnsObject = sortColumnsByHeight(columnsObject);

  return columnsObject;
}

export { cardSorter };
