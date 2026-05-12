// sessionStorageUtils.js
// Utility functions for sessionStorage operations related to the game context.

/**
 * Safely gets an item from sessionStorage.
 * @param {string} key
 * @returns {string|null}
 */
export function getSessionItem(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

/**
 * Safely sets an item in sessionStorage.
 * @param {string} key
 * @param {string} value
 */
export function setSessionItem(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch (err) {
    // Optionally log error
  }
}

/**
 * Safely removes an item from sessionStorage.
 * @param {string} key
 */
export function removeSessionItem(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (err) {
    // Optionally log error
  }
}

/**
 * Removes all sessionStorage keys that include the given roomKey.
 * @param {string} roomKey - The room key to match in sessionStorage keys.
 */
export function clearRoomSessionStorage(roomKey) {
  Object.keys(window.sessionStorage).forEach((key) => {
    if (key.includes(roomKey)) {
      window.sessionStorage.removeItem(key);
    }
  });
}
