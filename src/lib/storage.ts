/**
 * Local storage utility with error handling.
 * Provides safe access to localStorage with fallbacks for unsupported environments.
 */
export const storage = {
  /**
   * Saves a value to localStorage.
   * Silently fails if localStorage is unsupported or quota exceeded.
   *
   * @param key - The key to store the value under
   * @param value - The string value to store
   */
  save: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage unsupported or quota exceeded - silently fail
    }
  },

  /**
   * Retrieves a value from localStorage.
   * Returns null if key doesn't exist or localStorage is unsupported.
   *
   * @param key - The key to retrieve
   * @returns The stored value or null
   */
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /**
   * Removes a value from localStorage.
   * Silently fails if localStorage is unsupported.
   *
   * @param key - The key to remove
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage unsupported - silently fail
    }
  },
};
