// sessionStorageUtils.ts
// Utility functions for sessionStorage operations related to the game context.

/**
 * Safely gets an item from sessionStorage.
 */
export function getSessionItem(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

/**
 * Safely sets an item in sessionStorage.
 */
export function setSessionItem(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch (err) {
    // Optionally log error
  }
}

/**
 * Safely removes an item from sessionStorage.
 */
export function removeSessionItem(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch (err) {
    // Optionally log error
  }
}
